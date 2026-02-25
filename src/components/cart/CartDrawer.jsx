import React from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Drawer,
  Button,
  Empty,
  InputNumber,
  Divider,
  Typography,
  Space,
} from "antd";
import { DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";
import cartStore from "../../stores/cartStore";

const { Text, Title } = Typography;

const CartDrawer = observer(() => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    cartStore.closeDrawer();
    navigate("/checkout");
  };

  return (
    <Drawer
      title={`السلة (${cartStore.itemsCount} منتج)`}
      placement="right"
      open={cartStore.isOpen}
      onClose={() => cartStore.closeDrawer()}
      width={400}
      footer={
        cartStore.items.length > 0 && (
          <div>
            <div className="flex justify-between mb-3">
              <Text strong>الإجمالي:</Text>
              <Title level={4} style={{ margin: 0, color: "#6366f1" }}>
                {Number(cartStore.subtotal).toLocaleString()} ج.م
              </Title>
            </div>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                block
                size="large"
                onClick={handleCheckout}
              >
                إتمام الشراء
              </Button>
              <Button
                block
                onClick={() => {
                  cartStore.closeDrawer();
                  navigate("/cart");
                }}
              >
                عرض السلة
              </Button>
            </Space>
          </div>
        )
      }
    >
      {cartStore.items.length === 0 ? (
        <Empty
          image={
            <ShoppingOutlined style={{ fontSize: 64, color: "#cbd5e1" }} />
          }
          description="السلة فارغة"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {cartStore.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 bg-slate-50 rounded-lg"
            >
              {/* صورة المنتج */}
              <img
                src={item.primary_image || "/placeholder.png"}
                alt={item.product_name}
                className="w-16 h-16 object-cover rounded-md"
              />

              {/* تفاصيل */}
              <div className="flex-1 min-w-0">
                <Text strong className="block truncate text-sm">
                  {item.product_name}
                </Text>
                {item.variant_label && (
                  <Text type="secondary" className="text-xs">
                    {item.variant_label}
                  </Text>
                )}
                <div className="flex items-center justify-between mt-2">
                  <InputNumber
                    min={1}
                    value={item.quantity}
                    size="small"
                    style={{ width: 70 }}
                    onChange={(val) => cartStore.updateItem(item.id, val)}
                  />
                  <Text strong style={{ color: "#6366f1" }}>
                    {Number(item.subtotal).toLocaleString()} ج.م
                  </Text>
                </div>
              </div>

              {/* حذف */}
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => cartStore.removeItem(item.id)}
              />
            </div>
          ))}

          <Divider />
          <Button
            type="text"
            danger
            block
            onClick={() => cartStore.clearCart()}
          >
            تفريغ السلة
          </Button>
        </div>
      )}
    </Drawer>
  );
});

export default CartDrawer;
