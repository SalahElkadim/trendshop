import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Row,
  Col,
  Button,
  Rate,
  Tag,
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
import { trackEvent } from "../../utils/pixel";
import PriceTiersWidget from "./PriceTiersWidget"; // ← عدّل المسار
import PieceAttributesForm from "./PieceAttributesForm"; // ← عدّل المسار

const { Title, Text } = Typography;

const ProductDetailPage = observer(() => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const cartQtyForProduct = product
    ? cartStore.items
        .filter((item) => item.product === product.id)
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [mainVideo, setMainVideo] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm] = Form.useForm();

  // ── ✦ NEW: حالة "أكتر من قطعة بخصائص مختلفة في نفس الطلب" ────────────────
  // pieces: [{attrs: {attributeName: valueObj}}]  واحدة لكل قطعة
  // pieceVariants: [variant|null] بنفس الترتيب — الـ variant المتطابق لكل قطعة
  const [pieces, setPieces] = useState([]);
  const [pieceVariants, setPieceVariants] = useState([]);

  // ── تحميل المنتج ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getBySlug(slug);
        const p = res.data.data;
        setProduct(p);
        setMainImage(
          p.images?.find((i) => i.is_primary)?.image || p.images?.[0]?.image
        );
        setMediaType("image");
        setSelectedAttrs({});
        setSelectedVariant(null);
        setQuantity(1);
        setPieces([]); // ✦ NEW
        setPieceVariants([]); // ✦ NEW
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

  // ── لما كل الـ attributes تتاختار → دور على الـ variant (المسار القديم: منتج بخصائص بدون tiers) ──
  useEffect(() => {
    if (!product?.available_attributes?.length) return;

    const allSelected = product.available_attributes.every(
      (attr) => selectedAttrs[attr.attribute]
    );

    if (!allSelected) {
      setSelectedVariant(null);
      return;
    }

    const findVariant = async () => {
      setVariantLoading(true);
      try {
        const av_ids = Object.values(selectedAttrs).map((v) => v.id);
        const res = await productsAPI.findVariant(slug, av_ids);
        setSelectedVariant(res.data.data);
      } catch {
        setSelectedVariant(null);
      } finally {
        setVariantLoading(false);
      }
    };

    findVariant();
  }, [selectedAttrs, product, slug]);

  // ── لما يتغير الـ selected attribute value → غيّر الصورة لو في صورة مرتبطة (المسار القديم) ──
  const handleAttrSelect = (attrName, val) => {
    setSelectedAttrs((prev) => ({ ...prev, [attrName]: val }));

    if (!product?.images) return;

    const linkedImage = product.images.find(
      (img) => img.attribute_value === val.id
    );

    if (linkedImage) {
      setMainImage(linkedImage.image);
      setMediaType("image");
    }
  };

  // ── ✦ NEW: هل المنتج محتاج المسار الجديد (تيرز + خصائص مع بعض)؟ ─────────
  const hasTiers = product?.price_tiers?.length > 0;
  const hasAttributes = product?.available_attributes?.length > 0;
  const usesPiecesFlow = !!(hasTiers && hasAttributes);

  // ── ✦ NEW: يظبط عدد بلوكات القطع، مع الحفاظ على اللي اتملى قبل كده ──────
  const setPieceCount = (count) => {
    setPieces((prev) => {
      if (count <= prev.length) return prev.slice(0, count);
      const extra = Array.from({ length: count - prev.length }, () => ({
        attrs: {},
      }));
      return [...prev, ...extra];
    });
    setPieceVariants((prev) => {
      if (count <= prev.length) return prev.slice(0, count);
      const extra = Array.from({ length: count - prev.length }, () => null);
      return [...prev, ...extra];
    });
  };

  // ── ✦ NEW: اختيار خاصية لقطعة معينة ──────────────────────────────────────
  const handlePieceAttrSelect = (index, attrName, val) => {
    setPieces((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, attrs: { ...p.attrs, [attrName]: val } } : p
      )
    );

    const linkedImage = product?.images?.find(
      (img) => img.attribute_value === val.id
    );
    if (linkedImage) {
      setMainImage(linkedImage.image);
      setMediaType("image");
    }
  };

  // ── ✦ NEW: بيتنادي من PieceAttributesForm كل ما الـ variant بتاعها يتغير ──
  const handlePieceVariantChange = (index, variant) => {
    setPieceVariants((prev) => {
      const next = [...prev];
      next[index] = variant;
      return next;
    });
  };

  // ── حساب السعر والكمية ──────────────────────────────────────────────────
  const getPriceForQuantity = (totalQty) => {
    const tiers = product?.price_tiers;
    const base = Number(
      selectedVariant?.effective_price || product?.effective_price || 0
    );
    if (!tiers || tiers.length === 0) return base;

    const sorted = [...tiers].sort((a, b) => b.min_quantity - a.min_quantity);
    const matched = sorted.find((t) => t.min_quantity <= totalQty);
    return matched ? Number(matched.unit_price) : base;
  };

  // ✦ totalRequestedQty: عدد القطع/الكمية اللي بنشتريها دلوقتي — يشتغل في الحالتين
  const totalRequestedQty = usesPiecesFlow ? pieces.length : quantity;
  const effectiveTotalQty = cartQtyForProduct + totalRequestedQty;
  const currentPrice = getPriceForQuantity(effectiveTotalQty);
  const currentTotal = currentPrice * totalRequestedQty;

  const maxQty = selectedVariant ? selectedVariant.stock : 99;
  const isOutOfStock = selectedVariant
    ? selectedVariant.is_out_of_stock
    : !product?.is_in_stock;

  const allAttrsSelected =
    !product?.available_attributes?.length ||
    product.available_attributes.every((attr) => selectedAttrs[attr.attribute]);

  // ── ✦ NEW: جاهزية القطع كلها (variant متاح ومش نافد) ─────────────────────
  const piecesAllResolved =
    pieces.length > 0 &&
    pieceVariants.length === pieces.length &&
    pieceVariants.every((v) => v && !v.is_out_of_stock);

  // ✦ NEW: لو قطعتين بنفس الـ variant، نتأكد إن المخزون بيكفي مجموعهم مش بس واحدة
  const stockOk = (() => {
    const qtyByVariant = {};
    pieceVariants.forEach((v) => {
      if (v) qtyByVariant[v.id] = (qtyByVariant[v.id] || 0) + 1;
    });
    return pieceVariants.every((v) => !v || qtyByVariant[v.id] <= v.stock);
  })();

  const canAddPieces = piecesAllResolved && stockOk;

  const handleTierSelect = (tierMinQty) => {
    const neededQty = Math.max(1, tierMinQty - cartQtyForProduct);
    if (usesPiecesFlow) {
      setPieceCount(neededQty);
    } else {
      setQuantity(neededQty);
    }
  };

  // ✦ NEW: كمية مخصصة لو زادت عن أعلى تير
  const handleCustomQuantity = (qty) => {
    if (!qty) return;
    if (usesPiecesFlow) {
      setPieceCount(qty);
    } else {
      setQuantity(qty);
    }
  };

  // ── إضافة للسلة (المسار القديم: قطعة واحدة أو منتج بدون خصائص) ──────────
  const handleAddToCart = () => {
    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: [product.id.toString()],
      content_type: "product",
      value: parseFloat(currentPrice) * quantity,
      currency: "EGP",
      num_items: quantity,
    });

    const variantId = selectedVariant?.id ?? null;
    cartStore.addItem(product.id, variantId, quantity);
  };

  // ── ✦ NEW: إضافة كل القطع للسلة — كل variant بكميته الإجمالية ────────────
  const handleAddPiecesToCart = () => {
    const qtyByVariant = {};
    pieceVariants.forEach((v) => {
      if (v) qtyByVariant[v.id] = (qtyByVariant[v.id] || 0) + 1;
    });

    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: [product.id.toString()],
      content_type: "product",
      value: parseFloat(currentTotal),
      currency: "EGP",
      num_items: pieces.length,
    });

    Object.entries(qtyByVariant).forEach(([variantId, qty]) => {
      cartStore.addItem(product.id, Number(variantId), qty);
    });

    message.success(
      `تمت إضافة ${pieces.length} ${pieces.length === 1 ? "قطعة" : "قطع"} للسلة`
    );
    setPieces([]);
    setPieceVariants([]);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Row gutter={[40, 40]}>
        {/* ── الميديا ─────────────────────────────────────────────────────── */}
        <Col xs={24} md={12}>
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
                style={{ transition: "opacity 0.25s" }}
              />
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 flex-wrap">
            {product.images?.map((img) => {
              const isActive = mediaType === "image" && mainImage === img.image;

              const linkedAttrValue = img.attribute_value
                ? product.available_attributes
                    ?.flatMap((a) => a.values)
                    .find((v) => v.id === img.attribute_value)
                : null;

              return (
                <div key={img.id} style={{ position: "relative" }}>
                  <div
                    onClick={() => {
                      setMainImage(img.image);
                      setMediaType("image");

                      // ✦ في المسار القديم بس بنربط الصورة باختيار تلقائي للـ attribute
                      // (في وضع القطع المتعددة الاختيار بيبقى لكل قطعة لوحدها من الفورم بتاعها)
                      if (!usesPiecesFlow && img.attribute_value) {
                        const linkedAttr = product.available_attributes?.find(
                          (attr) =>
                            attr.values.some(
                              (v) => v.id === img.attribute_value
                            )
                        );
                        const linkedVal = linkedAttr?.values.find(
                          (v) => v.id === img.attribute_value
                        );
                        if (linkedAttr && linkedVal) {
                          handleAttrSelect(linkedAttr.attribute, linkedVal);
                        }
                      }
                    }}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                      isActive ? "border-indigo-500" : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {linkedAttrValue && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -18,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 10,
                        color: "#6366F1",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {linkedAttrValue.value}
                    </div>
                  )}
                </div>
              );
            })}

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

        {/* ── تفاصيل المنتج ────────────────────────────────────────────────── */}
        <Col xs={24} md={12}>
          <Text type="secondary" className="text-sm">
            {product.category_name}
          </Text>
          <Title level={2} style={{ margin: "8px 0" }}>
            {product.name}
          </Title>
          <div className="flex flex-col gap-1">
            {product.description
              ?.split(/(?<=\.)\s+/)
              .filter(Boolean)
              .map((sentence, i) => (
                <Text key={i} type="secondary" className="block">
                  {sentence}
                </Text>
              ))}
          </div>
          <br />
          <br />

          {product.avg_rating && (
            <div className="flex items-center gap-2 mb-4">
              <Rate disabled value={product.avg_rating} allowHalf />
              <Text type="secondary">({product.reviews_count} تقييم)</Text>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            {usesPiecesFlow && pieces.length === 0 ? (
              <Title level={3} style={{ margin: 0, color: "#6366f1" }}>
                يبدأ من {Number(product.effective_price).toLocaleString()} ج.م
              </Title>
            ) : (
              <>
                <Title level={2} style={{ margin: 0, color: "#6366f1" }}>
                  {currentTotal.toLocaleString()} ج.م
                </Title>
                {totalRequestedQty > 1 && (
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    ({currentPrice.toLocaleString()} ج.م × {totalRequestedQty})
                  </Text>
                )}
                {product.discount_price && totalRequestedQty === 1 && (
                  <>
                    <Text delete type="secondary" style={{ fontSize: 18 }}>
                      {Number(product.price).toLocaleString()} ج.م
                    </Text>
                    <Tag color="red">-{product.discount_percentage}%</Tag>
                  </>
                )}
              </>
            )}
          </div>

          {/* ── Attribute Selectors (المسار القديم فقط: مفيش tiers، أو فيه tiers بس مفيش خصائص) ── */}
          {!usesPiecesFlow && product.available_attributes?.length > 0 && (
            <div className="mb-6">
              {product.available_attributes.map((attr) => (
                <div key={attr.attribute} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Text strong>اختار {attr.attribute}:</Text>
                    {selectedAttrs[attr.attribute] && (
                      <Text type="secondary">
                        {selectedAttrs[attr.attribute].value}
                      </Text>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {attr.values.map((val) => {
                      const isSelected =
                        selectedAttrs[attr.attribute]?.id === val.id;

                      const linkedImg = product.images?.find(
                        (img) => img.attribute_value === val.id
                      );

                      return (
                        <button
                          key={val.id}
                          onClick={() => handleAttrSelect(attr.attribute, val)}
                          title={
                            linkedImg ? "اضغط لرؤية صورة هذا الخيار" : undefined
                          }
                          style={{
                            padding: linkedImg ? "4px" : "6px 16px",
                            borderRadius: 10,
                            border: isSelected
                              ? "2px solid #6366f1"
                              : "1.5px solid #e2e8f0",
                            background: isSelected ? "#eef2ff" : "transparent",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            minWidth: linkedImg ? 60 : "auto",
                          }}
                        >
                          {linkedImg && (
                            <img
                              src={linkedImg.image}
                              alt={val.value}
                              style={{
                                width: 52,
                                height: 52,
                                objectFit: "cover",
                                borderRadius: 6,
                                display: "block",
                              }}
                            />
                          )}
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected ? "#4338ca" : "inherit",
                              padding: linkedImg ? "0 4px 2px" : 0,
                            }}
                          >
                            {val.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {allAttrsSelected && !selectedVariant && !variantLoading && (
                <Text type="danger" style={{ fontSize: 13 }}>
                  هذا التوليف غير متاح حالياً
                </Text>
              )}
            </div>
          )}

          {product?.price_tiers?.length > 0 && (
            <PriceTiersWidget
              tiers={product.price_tiers}
              basePrice={
                selectedVariant?.effective_price || product?.effective_price
              }
              quantity={totalRequestedQty}
              alreadyInCartQty={cartQtyForProduct}
              onSelect={handleTierSelect}
              onCustomQuantity={handleCustomQuantity}
            />
          )}

          {cartQtyForProduct > 0 && (
            <Text
              type="secondary"
              style={{ fontSize: 13, display: "block", marginBottom: 8 }}
            >
              📦 لديك {cartQtyForProduct}{" "}
              {cartQtyForProduct === 1 ? "قطعة" : "قطع"} من هذا المنتج في السلة
              بالفعل — أضف المزيد للحصول على سعر أفضل.
            </Text>
          )}

          {/* ── ✦ NEW: فورمز خصائص كل قطعة (لما يكون عند المنتج tiers + خصائص) ── */}
          {usesPiecesFlow && pieces.length > 0 && (
            <div className="mb-6">
              <Text strong style={{ display: "block", marginBottom: 10 }}>
                أدخل خصائص كل قطعة:
              </Text>
              {pieces.map((piece, idx) => (
                <PieceAttributesForm
                  key={idx}
                  index={idx}
                  attrs={piece.attrs}
                  availableAttributes={product.available_attributes}
                  slug={slug}
                  onAttrSelect={handlePieceAttrSelect}
                  onVariantChange={handlePieceVariantChange}
                />
              ))}
            </div>
          )}

          {/* ── Quantity (المسار القديم فقط) ── */}
          {!usesPiecesFlow && (
            <div className="flex items-center gap-4 mb-6">
              <Text strong>
                {product?.price_tiers?.length > 0
                  ? `أو اختر كمية أخرى:`
                  : "الكمية:"}
              </Text>
              <InputNumber
                min={1}
                max={maxQty || 99}
                value={quantity}
                onChange={setQuantity}
                style={{ width: 100 }}
              />
              {selectedVariant && <Text type="secondary">({maxQty} متاح)</Text>}
            </div>
          )}

          {/* Add to Cart */}
          {usesPiecesFlow ? (
            <Button
              type="primary"
              size="large"
              block
              icon={<ShoppingCartOutlined />}
              disabled={pieces.length === 0 || !canAddPieces}
              onClick={handleAddPiecesToCart}
              loading={cartStore.isLoading}
            >
              {pieces.length === 0
                ? "اختر عدد القطع أولاً"
                : !piecesAllResolved
                ? "استكمل بيانات كل قطعة"
                : !stockOk
                ? "الكمية المطلوبة غير متوفرة في المخزون"
                : "أضف للسلة"}
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              block
              icon={<ShoppingCartOutlined />}
              disabled={
                isOutOfStock ||
                variantLoading ||
                (product.available_attributes?.length > 0 && !selectedVariant)
              }
              onClick={handleAddToCart}
              loading={cartStore.isLoading || variantLoading}
            >
              {variantLoading
                ? "جاري التحقق..."
                : product.available_attributes?.length > 0 && !selectedVariant
                ? "اختر المواصفات أولاً"
                : isOutOfStock
                ? "نفد المخزون"
                : "أضف للسلة"}
            </Button>
          )}

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
                      {product.reviews?.slice(0, visibleReviews).map((r) => (
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
                  {product.reviews?.length > visibleReviews && (
                    <Button
                      type="default"
                      block
                      onClick={() => setVisibleReviews((prev) => prev + 5)}
                      className="mt-4"
                    >
                      اقرأ المزيد ({product.reviews.length - visibleReviews}{" "}
                      تقييم متبقي)
                    </Button>
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
