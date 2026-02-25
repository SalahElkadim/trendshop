import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Button, Spin, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { ordersAPI } from "../../api/services";
import dayjs from "dayjs";

const { Title } = Typography;

const statusColors = {
  pending: "orange",
  confirmed: "blue",
  shipped: "cyan",
  delivered: "green",
  cancelled: "red",
  refunded: "default",
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI
      .getMyOrders()
      .then((res) => {
        setOrders(res.data.data?.results || res.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: "رقم الطلب", dataIndex: "order_number", key: "order_number" },
    {
      title: "التاريخ",
      dataIndex: "created_at",
      key: "created_at",
      render: (v) => dayjs(v).format("YYYY-MM-DD"),
    },
    {
      title: "المنتجات",
      dataIndex: "items_count",
      key: "items_count",
      render: (v) => `${v} منتج`,
    },
    {
      title: "الإجمالي",
      dataIndex: "total_price",
      key: "total_price",
      render: (v) => `${Number(v).toLocaleString()} ج.م`,
    },
    {
      title: "الحالة",
      dataIndex: "status_display",
      key: "status",
      render: (v, row) => <Tag color={statusColors[row.status]}>{v}</Tag>,
    },
    {
      title: "",
      key: "action",
      render: (_, row) => (
        <Link to={`/orders/${row.order_number}`}>
          <Button type="link" icon={<EyeOutlined />}>
            عرض
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Title level={2} className="mb-6">
        طلباتي
      </Title>
      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          scroll={{ x: true }}
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default MyOrdersPage;
