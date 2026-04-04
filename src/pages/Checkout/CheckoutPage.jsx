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
  if (!governorate) return 0;
  if (FREE_SHIPPING.includes(governorate)) return 0;
  if (EXPENSIVE_SHIPPING.includes(governorate)) return 50;
  return 25;
};

const getShippingLabel = (cost) => {
  if (cost === 0) return { text: "مجاني", color: "success" };
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

  const shippingCost = getShippingCost(selectedGov);
  const subtotal = Number(cartStore.subtotal);
  const discount = couponData ? Number(couponData.discount_amount) : 0;
  const finalTotal = subtotal - discount + shippingCost;

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

              {/* 2. رقم التليفون */}
              <Form.Item
                name="shipping_phone"
                label="رقم الهاتف"
                rules={[{ required: true, message: "أدخل رقم الهاتف" }]}
              >
                <Input placeholder="01xxxxxxxxx" />
              </Form.Item>

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

              {/* 6. الإيميل — للجميع (اختياري للضيف) */}
              <Form.Item
                name="guest_email"
                label={
                  authStore.isLoggedIn
                    ? "البريد الإلكتروني (اختياري)"
                    : "البريد الإلكتروني (اختياري)"
                }
                rules={[{ type: "email", message: "أدخل بريد إلكتروني صحيح" }]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>

              {/* الكود البريدي */}
              <Form.Item name="shipping_postal_code" label="الكود البريدي">
                <Input placeholder="اختياري" />
              </Form.Item>

              {/* 8. الملاحظات */}
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
                      src={item.primary_image || "/placeholder.png"}
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

            {/* 7. كود الخصم */}
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
