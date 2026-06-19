// ─────────────────────────────────────────────────────────────────────────────
// PieceAttributesForm.jsx
// فورم خصائص قطعة واحدة (لون/مقاس...) — بيظهر لما يكون عند المنتج Price Tiers
// + Attributes مع بعض، وكل قطعة محتاجة خصائصها الخاصة
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { Typography, Tag } from "antd";
import { productsAPI } from "../../api/services"; // ← عدّل المسار لو مختلف

const { Text } = Typography;

const PIECE_LABELS = [
  "الأولى",
  "الثانية",
  "الثالثة",
  "الرابعة",
  "الخامسة",
  "السادسة",
  "السابعة",
  "الثامنة",
  "التاسعة",
  "العاشرة",
];

/**
 * Props:
 *   index               : رقم القطعة (0-based)
 *   attrs               : {attributeName: valueObj} ← اختيارات القطعة دي
 *   availableAttributes : product.available_attributes
 *   slug                : slug بتاع المنتج
 *   onAttrSelect(index, attrName, val)
 *   onVariantChange(index, variant|null) ← بيتنادي كل ما الـ variant المتطابق يتغير
 */
export default function PieceAttributesForm({
  index,
  attrs,
  availableAttributes,
  slug,
  onAttrSelect,
  onVariantChange,
}) {
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(false);

  const allSelected = availableAttributes.every(
    (attr) => attrs[attr.attribute]
  );
  // ✦ signature ثابتة من الـ ids عشان نعرف نتأكد امتى نعيد البحث عن الـ variant
  const signature = availableAttributes
    .map((attr) => attrs[attr.attribute]?.id ?? "")
    .join("-");

  useEffect(() => {
    if (!allSelected) {
      setVariant(null);
      onVariantChange(index, null);
      return;
    }

    let cancelled = false;
    const resolve = async () => {
      setLoading(true);
      try {
        const av_ids = availableAttributes.map(
          (attr) => attrs[attr.attribute].id
        );
        const res = await productsAPI.findVariant(slug, av_ids);
        if (!cancelled) {
          setVariant(res.data.data);
          onVariantChange(index, res.data.data);
        }
      } catch {
        if (!cancelled) {
          setVariant(null);
          onVariantChange(index, null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    resolve();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, slug]);

  const pieceLabel = PIECE_LABELS[index] || `رقم ${index + 1}`;

  return (
    <div
      style={{
        border: "1.5px solid #e2e8f0",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text strong style={{ fontSize: 13 }}>
          القطعة {pieceLabel}
        </Text>

        {loading && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            جاري التحقق...
          </Text>
        )}
        {!loading && variant && !variant.is_out_of_stock && (
          <Tag color="green" style={{ margin: 0 }}>
            متاحة
          </Tag>
        )}
        {!loading && variant && variant.is_out_of_stock && (
          <Tag color="red" style={{ margin: 0 }}>
            نفد المخزون
          </Tag>
        )}
        {!loading && allSelected && !variant && (
          <Tag color="red" style={{ margin: 0 }}>
            هذا التوليف غير متاح
          </Tag>
        )}
      </div>

      {availableAttributes.map((attr) => (
        <div key={attr.attribute} style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 12,
              color: "#64748B",
              display: "block",
              marginBottom: 4,
            }}
          >
            {attr.attribute}
          </Text>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {attr.values.map((val) => {
              const isSelected = attrs[attr.attribute]?.id === val.id;
              return (
                <button
                  key={val.id}
                  onClick={() => onAttrSelect(index, attr.attribute, val)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 8,
                    border: isSelected
                      ? "2px solid #6366f1"
                      : "1.5px solid #e2e8f0",
                    background: isSelected ? "#eef2ff" : "transparent",
                    fontSize: 12,
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "#4338ca" : "inherit",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {val.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
