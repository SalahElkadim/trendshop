import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Card,
  Divider,
  Typography,
  Tag,
  message,
  Space,
  Alert,
  Select,
  Checkbox,
} from "antd";
import { couponsAPI, ordersAPI } from "../../api/services";
import cartStore from "../../stores/cartStore";
import authStore from "../../stores/authStore";

const { Title, Text } = Typography;
const { Option } = Select;

// ─────────────────────────────────────────────────────────────────────────────
// المحافظات وتكلفة الشحن
// ─────────────────────────────────────────────────────────────────────────────
const FREE_SHIPPING = ["القاهرة", "الجيزة"];
const EXPENSIVE_SHIPPING = [
  "شمال سيناء",
  "جنوب سيناء",
  "الوادي الجديد",
  "البحر الأحمر",
  "الأقصر",
  "أسوان",
];

const GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "البحيرة",
  "الفيوم",
  "الغربية",
  "الإسماعيلية",
  "المنوفية",
  "المنيا",
  "القليوبية",
  "الوادي الجديد",
  "السويس",
  "أسوان",
  "أسيوط",
  "بني سويف",
  "بورسعيد",
  "دمياط",
  "الشرقية",
  "جنوب سيناء",
  "كفر الشيخ",
  "مطروح",
  "الأقصر",
  "قنا",
  "شمال سيناء",
  "سوهاج",
  "البحر الأحمر",
];

const getShippingCost = (governorate) => {
  if (!governorate) return 25;
  if (FREE_SHIPPING.includes(governorate)) return 25;
  if (EXPENSIVE_SHIPPING.includes(governorate)) return 50;
  return 35;
};

const getShippingLabel = (cost) => {
  if (cost === 25) return { text: `${cost} ج.م`, color: "success" };
  if (cost === 50) return { text: `${cost} ج.م`, color: "warning" };
  return { text: `${cost} ج.م`, color: "secondary" };
};

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT PAGE
// ─────────────────────────────────────────────────────────────────────────────
const CheckoutPage = observer(() => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedGov, setSelectedGov] = useState(null);

  // ── واتساب: هل رقمه نفس رقم التليفون؟ ──────────────────────────────────
  const [sameAsPhone, setSameAsPhone] = useState(false);

  const shippingCost = getShippingCost(selectedGov);
  const subtotal = Number(cartStore.subtotal);
  const discount = couponData ? Number(couponData.discount_amount) : 0;
  const finalTotal = subtotal - discount + shippingCost;

  // لما يغير رقم التليفون ويكون sameAsPhone مفعّل → حدّث رقم الواتساب تلقائياً
  const handlePhoneChange = (e) => {
    if (sameAsPhone) {
      form.setFieldValue("whatsapp_number", e.target.value);
    }
  };

  // لما يضغط على checkbox "نفس رقم الهاتف"
  const handleSameAsPhone = (e) => {
    setSameAsPhone(e.target.checked);
    if (e.target.checked) {
      const phone = form.getFieldValue("shipping_phone") || "";
      form.setFieldValue("whatsapp_number", phone);
    } else {
      form.setFieldValue("whatsapp_number", "");
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    try {
      const res = await couponsAPI.validate({
        code: couponCode,
        order_total: cartStore.subtotal,
      });
      setCouponData(res.data.data);
      message.success("تم تطبيق الكوبون بنجاح!");
    } catch (err) {
      message.error(err.response?.data?.message || "كوبون غير صالح.");
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (cartStore.items.length === 0) {
      message.error("السلة فارغة!");
      return;
    }
    if (!selectedGov) {
      message.error("اختر المحافظة أولاً!");
      return;
    }

    setSubmitting(true);
    try {
      const items = cartStore.items.map((item) => ({
        product_id: item.product,
        variant_id: item.variant || null,
        quantity: item.quantity,
      }));

      const payload = {
        ...values,
        shipping_city: selectedGov,
        shipping_country: "مصر",
        payment_method: "cod",
        coupon_code: couponData?.coupon?.code || "",
        shipping_cost: shippingCost,
        // ── واتساب ──────────────────────────────────────────────────────────
        whatsapp_number: values.whatsapp_number || "",
        items,
      };

      if (!authStore.isLoggedIn) {
        payload.guest_email = values.guest_email;
      }

      const res = await ordersAPI.checkout(payload);
      const order = res.data.data;

      runInAction(() => {
        cartStore.cart = {
          ...cartStore.cart,
          items: [],
          total_items: 0,
          subtotal: 0,
        };
      });
      localStorage.removeItem("guest_cart_id");

      navigate(`/order-success/${order.order_number}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        message.error(JSON.stringify(errors));
      } else {
        message.error(err.response?.data?.message || "فشل إتمام الطلب.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const shippingLabel = getShippingLabel(shippingCost);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Title level={2} className="mb-8">
        إتمام الطلب
      </Title>

      <Row gutter={[32, 32]}>
        {/* ── نموذج الشحن ── */}
        <Col xs={24} lg={14}>
          <Card title="بيانات الشحن" className="mb-6">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {/* Guest alert */}
              {!authStore.isLoggedIn && (
                <Alert
                  message="أنت تتسوق كضيف"
                  description="يمكنك التسجيل لاحقاً لمتابعة طلباتك."
                  type="info"
                  showIcon
                  className="mb-4"
                />
              )}

              {/* 1. الاسم */}
              <Form.Item
                name="shipping_name"
                label="الاسم الكامل"
                rules={[{ required: true, message: "أدخل الاسم الكامل" }]}
              >
                <Input placeholder="محمد أحمد" />
              </Form.Item>

              {/* 2. رقم التليفون + واتساب في صف واحد */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="shipping_phone"
                    label="رقم الهاتف"
                    rules={[
                      { required: true, message: "أدخل رقم الهاتف" },
                      {
                        pattern: /^01[0125][0-9]{8}$/,
                        message: "أدخل رقم مصري صحيح (مثال: 01xxxxxxxxx)",
                      },
                    ]}
                  >
                    <Input
                      placeholder="01xxxxxxxxx"
                      maxLength={11}
                      onChange={handlePhoneChange}
                    />
                  </Form.Item>
                </Col>

                {/* ── حقل الواتساب ── */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="whatsapp_number"
                    label={
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {/* أيقونة واتساب SVG بسيطة */}
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="#25D366"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        رقم الواتساب{" "}
                        <span
                          style={{
                            color: "#999",
                            fontWeight: 400,
                            fontSize: 12,
                          }}
                        >
                          (اختياري)
                        </span>
                      </span>
                    }
                    rules={[
                      {
                        pattern: /^(01[0125][0-9]{8})?$/,
                        message: "أدخل رقم مصري صحيح أو اتركه فارغاً",
                      },
                    ]}
                  >
                    <Input
                      placeholder="01xxxxxxxxx"
                      maxLength={11}
                      disabled={sameAsPhone}
                      prefix={<span style={{ fontSize: 13 }}>🇪🇬</span>}
                    />
                  </Form.Item>

                  {/* Checkbox: نفس رقم الهاتف */}
                  <div style={{ marginTop: -16, marginBottom: 16 }}>
                    <Checkbox
                      checked={sameAsPhone}
                      onChange={handleSameAsPhone}
                      style={{ fontSize: 12, color: "#666" }}
                    >
                      نفس رقم الهاتف
                    </Checkbox>
                  </div>
                </Col>
              </Row>

              {/* 3. الدولة + 4. المحافظة — في صف واحد */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="shipping_country" label="الدولة">
                    <Input value="مصر" defaultValue="مصر" disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="shipping_city"
                    label="المحافظة"
                    rules={[{ required: true, message: "اختر المحافظة" }]}
                  >
                    <Select
                      placeholder="اختر المحافظة..."
                      showSearch
                      onChange={(val) => setSelectedGov(val)}
                      filterOption={(input, option) =>
                        option?.children?.includes(input)
                      }
                    >
                      {GOVERNORATES.map((gov) => (
                        <Option key={gov} value={gov}>
                          {gov}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* بنر تكلفة الشحن */}
              {selectedGov && (
                <div
                  style={{
                    background:
                      shippingCost === 0
                        ? "#F0FDF4"
                        : shippingCost === 50
                        ? "#FFF7ED"
                        : "#EFF6FF",
                    border: `1px solid ${
                      shippingCost === 0
                        ? "#BBF7D0"
                        : shippingCost === 50
                        ? "#FED7AA"
                        : "#BFDBFE"
                    }`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>
                    {shippingCost === 0 ? "🎉" : "🚚"}
                  </span>
                  <Text
                    style={{
                      color:
                        shippingCost === 0
                          ? "#15803D"
                          : shippingCost === 50
                          ? "#C2410C"
                          : "#1D4ED8",
                    }}
                  >
                    تكلفة الشحن لـ <strong>{selectedGov}</strong>:{" "}
                    <strong>
                      {shippingCost === 0 ? "مجاني" : `${shippingCost} ج.م`}
                    </strong>
                  </Text>
                </div>
              )}

              {/* 5. العنوان بالتفصيل */}
              <Form.Item
                name="shipping_address"
                label="العنوان بالتفصيل"
                rules={[{ required: true, message: "أدخل العنوان" }]}
              >
                <Input placeholder="الشارع، رقم المبنى، الشقة" />
              </Form.Item>

              {/* 6. الإيميل */}
              <Form.Item
                name="guest_email"
                label="البريد الإلكتروني (اختياري)"
                rules={[{ type: "email", message: "أدخل بريد إلكتروني صحيح" }]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>

              {/* 7. الملاحظات */}
              <Form.Item name="notes" label="ملاحظات">
                <Input.TextArea
                  rows={3}
                  placeholder="أي تعليمات خاصة بالتوصيل..."
                />
              </Form.Item>

              <Divider />

              {/* طريقة الدفع */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl">
                  💵
                </div>
                <div>
                  <Text strong>الدفع عند الاستلام (COD)</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    ستدفع عند استلام الطلب
                  </Text>
                </div>
                <Tag color="green" className="mr-auto">
                  متاح
                </Tag>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={submitting}
              >
                تأكيد الطلب
              </Button>
            </Form>
          </Card>
        </Col>

        {/* ── ملخص الطلب ── */}
        <Col xs={24} lg={10}>
          <Card title="ملخص الطلب" className="sticky top-20">
            {/* Items */}
            <div className="flex flex-col gap-3 mb-4">
              {cartStore.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        item.variant_image ||
                        item.primary_image ||
                        "/placeholder.png"
                      }
                      alt={item.product_name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <Text className="text-sm block">{item.product_name}</Text>
                      {item.variant_label && (
                        <Text type="secondary" className="text-xs">
                          {item.variant_label}
                        </Text>
                      )}
                    </div>
                  </div>
                  <Text>×{item.quantity}</Text>
                  <Text strong>
                    {Number(item.subtotal).toLocaleString()} ج.م
                  </Text>
                </div>
              ))}
            </div>

            <Divider />

            {/* كود الخصم */}
            <div className="mb-4">
              <Text strong className="block mb-2">
                كود الخصم
              </Text>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  placeholder="أدخل الكوبون"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <Button
                  type="primary"
                  loading={couponLoading}
                  onClick={handleValidateCoupon}
                >
                  تطبيق
                </Button>
              </Space.Compact>
              {couponData && (
                <Text type="success" className="mt-1 block text-sm">
                  ✓ خصم {Number(couponData.discount_amount).toLocaleString()}{" "}
                  ج.م
                </Text>
              )}
            </div>

            <Divider />

            {/* Totals */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Text>المجموع الفرعي</Text>
                <Text>{subtotal.toLocaleString()} ج.م</Text>
              </div>

              {couponData && (
                <div className="flex justify-between">
                  <Text type="success">الخصم</Text>
                  <Text type="success">-{discount.toLocaleString()} ج.م</Text>
                </div>
              )}

              <div className="flex justify-between">
                <Text>الشحن {selectedGov && `(${selectedGov})`}</Text>
                <Text type={shippingLabel.color}>
                  {shippingCost === 0 ? "مجاني" : `${shippingCost} ج.م`}
                </Text>
              </div>

              <Divider style={{ margin: "8px 0" }} />

              <div className="flex justify-between">
                <Text strong style={{ fontSize: 16 }}>
                  الإجمالي
                </Text>
                <Title level={4} style={{ margin: 0, color: "#6366f1" }}>
                  {finalTotal.toLocaleString()} ج.م
                </Title>
              </div>

              {!selectedGov && (
                <Text
                  type="secondary"
                  style={{ fontSize: 11, textAlign: "center", marginTop: 4 }}
                >
                  * اختر المحافظة لمعرفة تكلفة الشحن
                </Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
});

export default CheckoutPage;
