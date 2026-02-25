import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import { ordersAPI } from "../../api/services";
import { trackEvent } from "../../utils/pixel"; // ← جديد

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderAndTrack = async () => {
      try {
        const res = await ordersAPI.getByOrderNumber(orderNumber);
        const order = res.data.data;
        setOrderData(order);

        // ✅ تتبع إتمام الشراء - يشتغل مرة واحدة فقط
        trackEvent("Purchase", {
          content_ids:
            order.items?.map((item) => item.product_id?.toString()) || [],
          contents:
            order.items?.map((item) => ({
              id: item.product_id?.toString(),
              quantity: item.quantity,
              item_price: parseFloat(item.unit_price),
            })) || [],
          order_id: order.order_number,
          value: parseFloat(order.total_price),
          currency: "EGP",
          num_items: order.items?.length || 0,
        });
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndTrack();
  }, [orderNumber]); // يشتغل مرة واحدة عند تحميل الصفحة

  if (loading) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ minHeight: "70vh" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      className="flex justify-center items-center"
      style={{ minHeight: "70vh" }}
    >
      <Result
        status="success"
        title="تم استلام طلبك بنجاح! 🎉"
        subTitle={`رقم الطلب: ${orderNumber} - سيتم التواصل معك قريباً لتأكيد التوصيل.`}
        extra={[
          <Link to={`/orders/${orderNumber}`} key="detail">
            <Button type="primary">تتبع الطلب</Button>
          </Link>,
          <Link to="/" key="home">
            <Button>العودة للرئيسية</Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default OrderSuccessPage;
