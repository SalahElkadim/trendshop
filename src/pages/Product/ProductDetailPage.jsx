import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Row,
  Col,
  Button,
  Rate,
  Tag,
  Select,
  InputNumber,
  Spin,
  Typography,
  Divider,
  Tabs,
  Empty,
  Form,
  Input,
  message,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { productsAPI, reviewsAPI } from "../../api/services";
import cartStore from "../../stores/cartStore";
import authStore from "../../stores/authStore";
import { trackEvent } from "../../utils/pixel"; // ← جديد

const { Title, Text } = Typography;

const ProductDetailPage = observer(() => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [mainVideo, setMainVideo] = useState(null);
  const [mediaType, setMediaType] = useState("image"); // "image" | "video"
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm] = Form.useForm();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getBySlug(slug);
        const p = res.data.data;
        setProduct(p);
        console.log("videos:", p.videos);
        setMainImage(
          p.images?.find((i) => i.is_primary)?.image || p.images?.[0]?.image
        );
        setMediaType("image");
        const firstAvailable = p.variants?.find((v) => !v.is_out_of_stock);
        if (firstAvailable) setSelectedVariant(firstAvailable.id);
        trackEvent("ViewContent", {
          content_name: p.name,
          content_ids: [p.id.toString()],
          content_type: "product",
          content_category: p.category_name,
          value: parseFloat(p.effective_price),
          currency: "EGP",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleAddToCart = () => {
    const selectedVariantObj = product.variants?.find(
      (v) => v.id === selectedVariant
    );
    const currentPrice = selectedVariantObj?.effective_price || product.effective_price;
    // ✅ تتبع الإضافة للسلة
    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: [product.id.toString()],
      content_type: "product",
      value: parseFloat(currentPrice) * quantity,
      currency: "EGP",
      num_items: quantity,
    });
    cartStore.addItem(product.id, selectedVariant, quantity);
  };

  const handleSubmitReview = async (values) => {
    setSubmittingReview(true);
    try {
      await reviewsAPI.addReview(slug, values);
      message.success("تم إضافة تقييمك بنجاح!");
      reviewForm.resetFields();
      const res = await productsAPI.getBySlug(slug);
      setProduct(res.data.data);
    } catch (err) {
      message.error(err.response?.data?.message || "فشل إضافة التقييم.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading)
    return (
      <div
        className="flex justify-center items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spin size="large" />
      </div>
    );

  if (!product) return <Empty description="المنتج غير موجود" />;

  const selectedVariantObj = product.variants?.find(
    (v) => v.id === selectedVariant
  );
  const currentPrice =
    selectedVariantObj?.effective_price || product.effective_price;
  const maxQty = selectedVariantObj?.stock || 99;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Row gutter={[40, 40]}>
        {/* ── الميديا ── */}
        <Col xs={24} md={12}>
          {/* العرض الرئيسي */}
          <div
            className="bg-white rounded-xl overflow-hidden border border-slate-100 mb-3"
            style={{ height: 420 }}
          >
            {mediaType === "video" ? (
              <video
                key={mainVideo}
                controls
                autoPlay
                className="w-full h-full object-contain"
                style={{ background: "#000" }}
              >
                <source src={mainVideo} />
              </video>
            ) : (
              <img
                src={mainImage || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 flex-wrap">
            {/* صور */}
            {product.images?.map((img) => (
              <div
                key={img.id}
                onClick={() => {
                  setMainImage(img.image);
                  setMediaType("image");
                }}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                  mediaType === "image" && mainImage === img.image
                    ? "border-indigo-500"
                    : "border-slate-200"
                }`}
              >
                <img
                  src={img.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* فيديوهات */}
            {product.videos?.map((vid) => (
              <div
                key={vid.id}
                onClick={() => {
                  setMainVideo(vid.video);
                  setMediaType("video");
                }}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden cursor-pointer transition-all relative ${
                  mediaType === "video" && mainVideo === vid.video
                    ? "border-indigo-500"
                    : "border-slate-200"
                }`}
                style={{ background: "#0F172A", flexShrink: 0 }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="12"
                      height="14"
                      viewBox="0 0 12 14"
                      fill="#6366F1"
                    >
                      <path d="M0 0L12 7L0 14V0Z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Col>

        {/* ── تفاصيل المنتج ── */}
        <Col xs={24} md={12}>
          <Text type="secondary" className="text-sm">
            {product.category_name}
          </Text>
          <Title level={2} style={{ margin: "8px 0" }}>
            {product.name}
          </Title>
          <text type="secondary">{product.description}</text>
          <br />
          <br />

          {/* Rating */}
          {product.avg_rating && (
            <div className="flex items-center gap-2 mb-4">
              <Rate disabled value={product.avg_rating} allowHalf />
              <Text type="secondary">({product.reviews_count} تقييم)</Text>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <Title level={2} style={{ margin: 0, color: "#6366f1" }}>
              {Number(currentPrice).toLocaleString()} ج.م
            </Title>
            {product.discount_price && (
              <>
                <Text delete type="secondary" style={{ fontSize: 18 }}>
                  {Number(product.price).toLocaleString()} ج.م
                </Text>
                <Tag color="red">-{product.discount_percentage}%</Tag>
              </>
            )}
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mb-4">
              <Text strong className="block mb-2">
                الاختيار:
              </Text>
              <Select
                value={selectedVariant}
                onChange={setSelectedVariant}
                style={{ minWidth: 200 }}
                placeholder="اختر..."
                options={product.variants.map((v) => ({
                  value: v.id,
                  label: v.attribute_values?.map((av) => av.value).join(" / "),
                  disabled: v.is_out_of_stock,
                }))}
              />
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <Text strong>الكمية:</Text>
            <InputNumber
              min={1}
              max={maxQty}
              value={quantity}
              onChange={setQuantity}
              style={{ width: 100 }}
            />
            <Text type="secondary">({maxQty} متاح)</Text>
          </div>

          {/* Add to Cart */}
          <Button
            type="primary"
            size="large"
            block
            icon={<ShoppingCartOutlined />}
            disabled={!product.is_in_stock}
            onClick={handleAddToCart}
            loading={cartStore.isLoading}
          >
            {product.is_in_stock ? "أضف للسلة" : "نفد المخزون"}
          </Button>

          <Divider />
        </Col>
      </Row>

      {/* ── Tabs ── */}
      <div className="mt-10">
        <Tabs
          items={[
            {
              key: "reviews",
              label: `التقييمات (${product.reviews_count || 0})`,
              children: (
                <div>
                  {product.reviews?.length === 0 ? (
                    <Empty description="لا توجد تقييمات بعد" />
                  ) : (
                    <div className="flex flex-col gap-4 mb-8">
                      {product.reviews?.map((r) => (
                        <div
                          key={r.id}
                          className="bg-white rounded-xl p-4 border border-slate-100"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Text strong>{r.reviewer_name}</Text>
                            <Rate
                              disabled
                              value={r.rating}
                              style={{ fontSize: 14 }}
                            />
                          </div>
                          {r.title && (
                            <Text strong className="block mb-1">
                              {r.title}
                            </Text>
                          )}
                          <Text type="secondary">{r.body}</Text>
                          {r.is_verified_purchase && (
                            <Tag color="green" className="mt-2">
                              مشتري موثق
                            </Tag>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {authStore.isLoggedIn && (
                    <>
                      <Divider>أضف تقييمك</Divider>
                      <Form
                        form={reviewForm}
                        onFinish={handleSubmitReview}
                        layout="vertical"
                        style={{ maxWidth: 500 }}
                      >
                        <Form.Item
                          name="rating"
                          label="التقييم"
                          rules={[{ required: true }]}
                        >
                          <Rate />
                        </Form.Item>
                        <Form.Item name="title" label="عنوان التقييم">
                          <Input placeholder="عنوان مختصر..." />
                        </Form.Item>
                        <Form.Item
                          name="body"
                          label="تفاصيل التقييم"
                          rules={[{ required: true }]}
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="شاركنا تجربتك مع المنتج..."
                          />
                        </Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={submittingReview}
                        >
                          نشر التقييم
                        </Button>
                      </Form>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
});

export default ProductDetailPage;
