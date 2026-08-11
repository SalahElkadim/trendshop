import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import { ordersAPI } from "../../api/services";
import { trackEvent as trackFacebookEvent } from "../../utils/pixel";
import { trackEvent as trackTikTokEvent } from "../../utils/tiktokPixel";
const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchOrderAndTrack = async () => {
    try {
      const res = await ordersAPI.getOrder(orderNumber);
      const order = res.data.data;
      setOrderData(order);

      const trackedKey = `purchase_tracked_${orderNumber}`;
      if (!localStorage.getItem(trackedKey)) {
        const contentIds = order.items?.map((item) => item.product_id?.toString()) || [];
        const totalItems = order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
        const totalValue = parseFloat(order.total_price);

        trackFacebookEvent("Purchase", {
          content_ids: contentIds,
          contents: order.items?.map((item) => ({
            id: item.product_id?.toString(),
            quantity: item.quantity,
            item_price: parseFloat(item.unit_price),
          })) || [],
          order_id: order.order_number,
          value: totalValue,
          currency: "EGP",
          num_items: totalItems,
        });

        trackTikTokEvent("Purchase", {
          content_id: contentIds,
          content_type: "product",
          value: totalValue,
          currency: "EGP",
          num_items: totalItems,
        });

        localStorage.setItem(trackedKey, "true");
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchOrderAndTrack();
}, [orderNumber]);
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
        subTitle={
  <span>
    {`رقم الطلب: ${orderNumber} - `}
    <b>سيتواصل معك مندوب الشحن خلال يومين بإذن الله</b>
  </span>
}
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
