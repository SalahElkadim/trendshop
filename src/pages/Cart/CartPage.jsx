import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Button,
  InputNumber,
  Typography,
  Empty,
  Table,
  Divider,
  Card,
} from "antd";
import { DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";
import cartStore from "../../stores/cartStore";
import { trackEvent } from "../../utils/pixel";

const { Title, Text } = Typography;

// ✅ كارد منتج للموبايل
const MobileCartItem = ({ item }) => (
  <div
    style={{
      display: "flex",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid #f0f0f0",
      alignItems: "flex-start",
    }}
  >
    <img
      src={item.variant_image || item.primary_image || "/placeholder.png"}
      alt={item.product_name}
      style={{
        width: 70,
        height: 70,
        objectFit: "cover",
        borderRadius: 8,
        flexShrink: 0,
      }}
    />
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* اسم المنتج مع word-break لمنع التكدس */}
      <Text
        strong
        style={{
          display: "block",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "normal",
          lineHeight: 1.4,
          marginBottom: 2,
        }}
      >
        {item.product_name}
      </Text>

      {item.variant_label && (
        <Text
          type="secondary"
          style={{ fontSize: 12, display: "block", marginBottom: 6 }}
        >
          {item.variant_label}
        </Text>
      )}

      <Text
        type="secondary"
        style={{ fontSize: 12, display: "block", marginBottom: 8 }}
      >
        {Number(item.unit_price).toLocaleString()} ج.م / القطعة
      </Text>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <InputNumber
            min={1}
            value={item.quantity}
            onChange={(val) => val && cartStore.updateItem(item.id, val)}
            onBlur={(e) => {
              const val = parseInt(e.target.value);
              if (val && val !== item.quantity)
                cartStore.updateItem(item.id, val);
            }}
            style={{ width: 75 }}
            size="small"
          />
          <Text strong style={{ color: "#6366f1" }}>
            {Number(item.subtotal).toLocaleString()} ج.م
          </Text>
        </div>
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => cartStore.removeItem(item.id)}
        />
      </div>
    </div>
  </div>
);

const CartPage = observer(() => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    trackEvent("InitiateCheckout", {
      content_ids: cartStore.items.map(
        (item) => item.product_id?.toString() || item.id.toString()
      ),
      contents: cartStore.items.map((item) => ({
        id: item.product_id?.toString() || item.id.toString(),
        quantity: item.quantity,
        item_price: parseFloat(item.unit_price),
      })),
      num_items: cartStore.itemsCount,
      value: parseFloat(cartStore.subtotal),
      currency: "EGP",
    });

    navigate("/checkout");
  };

  const columns = [
    {
      title: "المنتج",
      key: "product",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.primary_image || "/placeholder.png"}
            alt={item.product_name}
            className="w-14 h-14 object-cover rounded-lg"
            style={{ flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <Text
              strong
              style={{
                display: "block",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {item.product_name}
            </Text>
            {item.variant_label && (
              <Text type="secondary" className="text-xs">
                {item.variant_label}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "السعر",
      dataIndex: "unit_price",
      render: (v) => `${Number(v).toLocaleString()} ج.م`,
    },
    {
      title: "الكمية",
      key: "quantity",
      render: (_, item) => (
        <InputNumber
          min={1}
          value={item.quantity}
          onChange={(val) => val && cartStore.updateItem(item.id, val)}
          onBlur={(e) => {
            const val = parseInt(e.target.value);
            if (val && val !== item.quantity)
              cartStore.updateItem(item.id, val);
          }}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: "الإجمالي",
      key: "subtotal",
      render: (_, item) => (
        <Text strong style={{ color: "#6366f1" }}>
          {Number(item.subtotal).toLocaleString()} ج.م
        </Text>
      ),
    },
    {
      title: "",
      key: "delete",
      render: (_, item) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => cartStore.removeItem(item.id)}
        />
      ),
    },
  ];

  if (cartStore.items.length === 0) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ minHeight: "60vh" }}
      >
        <Empty
          image={
            <ShoppingOutlined style={{ fontSize: 80, color: "#cbd5e1" }} />
          }
          description={<Text type="secondary">السلة فارغة</Text>}
        >
          <Link to="/products">
            <Button type="primary">تسوق الآن</Button>
          </Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Title level={2} className="mb-6">
        سلة التسوق ({cartStore.itemsCount} منتج)
      </Title>

      {/* ✅ جدول للديسكتوب — مخفي على الموبايل */}
      <div className="hidden sm:block">
        <Table
          columns={columns}
          dataSource={cartStore.items}
          rowKey="id"
          pagination={false}
          scroll={{ x: true }}
        />
      </div>

      {/* ✅ كاردات للموبايل — مخفية على الديسكتوب */}
      <div className="block sm:hidden">
        <Card bodyStyle={{ padding: "0 12px" }}>
          {cartStore.items.map((item) => (
            <MobileCartItem key={item.id} item={item} />
          ))}
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Card style={{ minWidth: 300, width: "100%" }} className="sm:w-auto">
          <div className="flex justify-between mb-3">
            <Text>الإجمالي الفرعي:</Text>
            <Text strong>
              {Number(cartStore.subtotal).toLocaleString()} ج.م
            </Text>
          </div>
          <Divider style={{ margin: "12px 0" }} />
          <Button type="primary" block size="large" onClick={handleCheckout}>
            إتمام الشراء
          </Button>
          <Button block className="mt-2" onClick={() => cartStore.clearCart()}>
            تفريغ السلة
          </Button>
        </Card>
      </div>
    </div>
  );
});

export default CartPage;
