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
import { trackEvent } from "../../utils/pixel"; // ← جديد

const { Title, Text } = Typography;

const CartPage = observer(() => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    // ✅ تتبع بدء عملية الشراء
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
          />
          <div>
            <Text strong className="block">
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
          onChange={(val) => cartStore.updateItem(item.id, val)}
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

      <Table
        columns={columns}
        dataSource={cartStore.items}
        rowKey="id"
        pagination={false}
        scroll={{ x: true }}
      />

      <div className="flex justify-end mt-6">
        <Card style={{ minWidth: 300 }}>
          <div className="flex justify-between mb-3">
            <Text>الإجمالي الفرعي:</Text>
            <Text strong>
              {Number(cartStore.subtotal).toLocaleString()} ج.م
            </Text>
          </div>
          <Divider style={{ margin: "12px 0" }} />
          <Button
            type="primary"
            block
            size="large"
            onClick={handleCheckout} // ← معدّل
          >
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
