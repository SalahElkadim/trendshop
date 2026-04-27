import { makeAutoObservable, runInAction } from "mobx";
import { cartAPI } from "../api/services";
import { message } from "antd";

class CartStore {
  cart = null; // { id, items, total_items, subtotal }
  isLoading = false;
  isOpen = false; // Drawer مفتوح؟

  constructor() {
    makeAutoObservable(this);
  }

  get itemsCount() {
    return this.cart?.total_items || 0;
  }

  get subtotal() {
    return this.cart?.subtotal || 0;
  }

  get items() {
    return (this.cart?.items || []).slice().sort((a, b) => a.id - b.id);
  }

  // ── Fetch Cart ────────────────────────────────────────────
  async fetchCart() {
    this.isLoading = true;
    try {
      const cartId = this.cart?.id || localStorage.getItem("guest_cart_id");
      const res = await cartAPI.getCart(cartId ? { cart_id: cartId } : {});
      runInAction(() => {
        this.cart = this._applyVariantImages(res.data.data);;
        if (res.data.data?.id) {
          localStorage.setItem("guest_cart_id", res.data.data.id);
        }
      });
    } catch {
      // silent fail للـ guest
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // ── Add Item ──────────────────────────────────────────────
  async addItem(
    productId,
    variantId = null,
    quantity = 1,
    variantImage = null
  ) {
    this.isLoading = true;
    try {
      const cartId = this.cart?.id || localStorage.getItem("guest_cart_id");
      const res = await cartAPI.addItem({
        product_id: productId,
        variant_id: variantId,
        quantity,
        cart_id: cartId ? parseInt(cartId) : null,
      });
      runInAction(() => {
        const cartData = res.data.data;

        // ✅ لو في صورة للـ variant، حدّثها قبل ما نحط الـ cart في الـ store
        // ✅ بعد — هنحفظ صورة الـ variant في localStorage عشان تفضل موجودة بعد refresh
        if (variantImage && variantId) {
          const saved = JSON.parse(
            localStorage.getItem("variant_images") || "{}"
          );
          saved[variantId] = variantImage;
          localStorage.setItem("variant_images", JSON.stringify(saved));
        }

        this.cart = this._applyVariantImages(cartData);

        this.cart = cartData;

        if (cartData?.id) {
          localStorage.setItem("guest_cart_id", cartData.id);
        }
        this.isOpen = true;
      });
      message.success("تمت الإضافة للسلة ✓");
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "فشلت الإضافة.";
      message.error(msg);
      return { success: false };
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
  // ── Update Item ───────────────────────────────────────────
  async updateItem(itemId, quantity) {
    if (typeof quantity !== "number") return; // ← منع الـ infinite loop
    try {
      const res = await cartAPI.updateItem(itemId, quantity, this.cart?.id);
      runInAction(() => {
        this.cart = this._applyVariantImages(res.data.data);;
      });
    } catch (err) {
      message.error(err.response?.data?.message || "فشل التحديث.");
    }
  }

  async removeItem(itemId) {
    try {
      const res = await cartAPI.removeItem(itemId, this.cart?.id);
      runInAction(() => {
        this.cart = this._applyVariantImages(res.data.data);;
      });
      message.success("تم حذف المنتج من السلة.");
    } catch {
      message.error("فشل الحذف.");
    }
  }

  async clearCart() {
    try {
      await cartAPI.clearCart(this.cart?.id);
      runInAction(() => {
        this.cart = { ...this.cart, items: [], total_items: 0, subtotal: 0 };
      });
    } catch {}
  }

  // ── Drawer Control ────────────────────────────────────────
  openDrawer() {
    this.isOpen = true;
  }
  closeDrawer() {
    this.isOpen = false;
  }
  // ✅ هنا — بعد closeDrawer وقبل آخر }
  _applyVariantImages(cartData) {
    if (!cartData?.items) return cartData;
    const saved = JSON.parse(localStorage.getItem("variant_images") || "{}");
    return {
      ...cartData,
      items: cartData.items.map((item) =>
        item.variant && saved[item.variant]
          ? { ...item, variant_image: saved[item.variant] }
          : item
      ),
    };
  }
}  // ← آخر } بتاعت الـ class


export default new CartStore();
