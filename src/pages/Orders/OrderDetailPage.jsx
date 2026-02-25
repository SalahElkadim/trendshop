import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Descriptions,
  Tag,
  Button,
  Spin,
  Typography,
  Table,
  Modal,
  Input,
  message,
  Card,
} from "antd";
import { ordersAPI } from "../../api/services";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const statusColors = {
  pending: "orange",
  confirmed: "blue",
  shipped: "cyan",
  delivered: "green",
  cancelled: "red",
  refunded: "default",
};

const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    ordersAPI
      .getOrder(orderNumber)
      .then((res) => setOrder(res.data.data))
      .catch(() => message.error("الطلب غير موجود."))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      message.error("من فضلك اكتب سبب الإلغاء.");
      return;
    }
    setCancelling(true);
    try {
      const res = await ordersAPI.cancelOrder(orderNumber, {
        reason: cancelReason,
      });
      setOrder(res.data.data);
      setCancelModal(false);
      message.success("تم إلغاء الطلب بنجاح.");
    } catch (err) {
      message.error(err.response?.data?.message || "فشل الإلغاء.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  if (!order) return null;

  const columns = [
    { title: "المنتج", dataIndex: "product_name", key: "product_name" },
    {
      title: "الاختيار",
      dataIndex: "variant_name",
      key: "variant_name",
      render: (v) => v || "-",
    },
    {
      title: "السعر",
      dataIndex: "unit_price",
      key: "unit_price",
      render: (v) => `${Number(v).toLocaleString()} ج.م`,
    },
    { title: "الكمية", dataIndex: "quantity", key: "quantity" },
    {
      title: "الإجمالي",
      dataIndex: "total_price",
      key: "total_price",
      render: (v) => `${Number(v).toLocaleString()} ج.م`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <Title level={2} style={{ margin: 0 }}>
          طلب #{order.order_number}
        </Title>
        <Tag
          color={statusColors[order.status]}
          style={{ fontSize: 14, padding: "4px 12px" }}
        >
          {order.status_display}
        </Tag>
      </div>

      {/* بيانات الطلب */}
      <Card className="mb-6">
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="التاريخ">
            {dayjs(order.created_at).format("YYYY-MM-DD HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="طريقة الدفع">
            الدفع عند الاستلام
          </Descriptions.Item>
          <Descriptions.Item label="حالة الدفع">
            <Tag color={order.payment_status === "paid" ? "green" : "orange"}>
              {order.payment_status_display}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="الإجمالي">
            <Text strong style={{ color: "#6366f1", fontSize: 16 }}>
              {Number(order.total_price).toLocaleString()} ج.م
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* عنوان الشحن */}
      <Card title="عنوان التوصيل" className="mb-6">
        <Descriptions column={1}>
          <Descriptions.Item label="الاسم">
            {order.shipping_name}
          </Descriptions.Item>
          <Descriptions.Item label="الهاتف">
            {order.shipping_phone}
          </Descriptions.Item>
          <Descriptions.Item label="العنوان">
            {order.shipping_address}، {order.shipping_city}،{" "}
            {order.shipping_country}
          </Descriptions.Item>
          {order.notes && (
            <Descriptions.Item label="ملاحظات">{order.notes}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* المنتجات */}
      <Card title="المنتجات" className="mb-6">
        <Table
          columns={columns}
          dataSource={order.items}
          rowKey="id"
          pagination={false}
          scroll={{ x: true }}
          summary={() => (
            <Table.Summary>
              {order.shipping_cost > 0 && (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={4}>
                    <Text>تكلفة الشحن ({order.shipping_city})</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>
                      {Number(order.shipping_cost).toLocaleString()} ج.م
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={4}>
                  <Text strong>الإجمالي</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong style={{ color: "#6366f1" }}>
                    {Number(order.total_price).toLocaleString()} ج.م
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* زر الإلغاء */}
      {order.can_cancel && (
        <Button danger size="large" onClick={() => setCancelModal(true)}>
          إلغاء الطلب
        </Button>
      )}

      {/* سبب الإلغاء لو اتلغى */}
      {order.cancellation && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <Text type="danger" strong>
            سبب الإلغاء:{" "}
          </Text>
          <Text>{order.cancellation.reason}</Text>
        </Card>
      )}

      {/* Cancel Modal */}
      <Modal
        title="إلغاء الطلب"
        open={cancelModal}
        onCancel={() => setCancelModal(false)}
        onOk={handleCancel}
        okText="تأكيد الإلغاء"
        okButtonProps={{ danger: true, loading: cancelling }}
        cancelText="تراجع"
      >
        <Text className="block mb-3">من فضلك اذكر سبب الإلغاء:</Text>
        <Input.TextArea
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="سبب الإلغاء..."
        />
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
