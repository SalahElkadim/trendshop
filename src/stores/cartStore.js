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
    return this.cart?.items || [];
  }

  // ── Fetch Cart ────────────────────────────────────────────
  async fetchCart() {
    this.isLoading = true;
    try {
      const cartId = this.cart?.id || localStorage.getItem("guest_cart_id");
      const res = await cartAPI.getCart(cartId ? { cart_id: cartId } : {});
      runInAction(() => {
        this.cart = res.data.data;
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
  async addItem(productId, variantId = null, quantity = 1) {
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
        this.cart = res.data.data;
        if (res.data.data?.id) {
          localStorage.setItem("guest_cart_id", res.data.data.id);
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
        this.cart = res.data.data;
      });
    } catch (err) {
      message.error(err.response?.data?.message || "فشل التحديث.");
    }
  }

  async removeItem(itemId) {
    try {
      const res = await cartAPI.removeItem(itemId, this.cart?.id);
      runInAction(() => {
        this.cart = res.data.data;
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
}

export default new CartStore();
