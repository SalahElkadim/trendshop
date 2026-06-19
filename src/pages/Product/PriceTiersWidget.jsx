// ─────────────────────────────────────────────────────────────────────────────
// PriceTiersWidget.jsx
// يتضاف في صفحة تفاصيل المنتج فوق الـ Quantity selector
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Typography, Tag, InputNumber } from "antd";
import { TagsOutlined, ThunderboltOutlined } from "@ant-design/icons";

const { Text } = Typography;

/**
 * Props:
 *   tiers             : [{min_quantity, unit_price}]  ← من product.price_tiers
 *   basePrice         : number                         ← product.effective_price
 *   quantity          : number                         ← إجمالي الكمية/القطع المختارة حالياً
 *   alreadyInCartQty  : number
 *   onSelect          : (qty) => void                  ← لما يضغط على تير
 *   onCustomQuantity  : (qty) => void                  ← لما يكتب كمية أكبر من أعلى تير يدوي
 */
export default function PriceTiersWidget({
  tiers,
  basePrice,
  quantity,
  alreadyInCartQty = 0,
  onSelect,
  onCustomQuantity,
}) {
  const [customQty, setCustomQty] = useState(null);

  if (!tiers || tiers.length === 0) return null;
  const effectiveQty = alreadyInCartQty + quantity;

  const getPriceForQty = (qty) => {
    const sorted = [...tiers].sort((a, b) => b.min_quantity - a.min_quantity);
    const matched = sorted.find((t) => t.min_quantity <= qty);
    return matched ? Number(matched.unit_price) : Number(basePrice);
  };

  const maxTierQty = Math.max(...tiers.map((t) => t.min_quantity));

  const activeTierIndex = (() => {
    let active = -1;
    tiers.forEach((tier, i) => {
      if (effectiveQty >= tier.min_quantity) active = i;
    });
    return active;
  })();

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fafafa 0%, #f0f4ff 100%)",
        border: "1.5px solid #e0e7ff",
        borderRadius: 16,
        padding: "16px 18px",
        marginBottom: 20,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TagsOutlined style={{ color: "#fff", fontSize: 14 }} />
          </div>
          <Text style={{ fontWeight: 700, fontSize: 14, color: "#1e1b4b" }}>
            احصل على أفضل سعر
          </Text>
        </div>
      </div>

      {alreadyInCartQty > 0 && (
        <Text
          style={{
            fontSize: 12,
            color: "#6366F1",
            display: "block",
            marginBottom: 10,
          }}
        >
          عندك {alreadyInCartQty} في السلة — السعر محسوب على الإجمالي (
          {effectiveQty})
        </Text>
      )}

      {/* ── Tiers ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tiers.map((tier, index) => {
          const qty = tier.min_quantity;
          const unitPrice = Number(tier.unit_price);
          const totalPrice = unitPrice * qty;

          const originalTotal = Number(basePrice) * qty;
          const saved = originalTotal - totalPrice;
          const hasSaving = saved > 0;

          const isActive = index === activeTierIndex;

          return (
            <button
              key={index}
              onClick={() => {
                setCustomQty(null);
                onSelect(qty);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 12,
                border: isActive ? "2px solid #6366F1" : "1.5px solid #e2e8f0",
                background: isActive
                  ? "linear-gradient(135deg, #eef2ff, #f5f3ff)"
                  : "#fff",
                cursor: "pointer",
                transition: "all 0.18s",
                boxShadow: isActive
                  ? "0 2px 12px rgba(99,102,241,0.15)"
                  : "none",
                textAlign: "right",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: isActive ? "#6366F1" : "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.18s",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: isActive ? "#fff" : "#64748B",
                    }}
                  >
                    {qty}
                  </Text>
                </div>
                <Text
                  style={{
                    fontSize: 13,
                    color: isActive ? "#3730a3" : "#475569",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {qty === 1 ? "قطعة" : qty === 2 ? "قطعتين" : `${qty} قطع`}
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {hasSaving && (
                  <Tag
                    icon={<ThunderboltOutlined />}
                    style={{
                      background: "#fef9c3",
                      border: "1px solid #fde047",
                      color: "#854d0e",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "1px 6px",
                      margin: 0,
                    }}
                  >
                    وفّر {saved.toLocaleString()} ج.م
                  </Tag>
                )}
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: isActive ? "#6366F1" : "#0f172a",
                  }}
                >
                  {totalPrice.toLocaleString()} ج.م
                </Text>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── كمية يدوية لو زادت عن أعلى tier ── */}
      <div
        style={{
          marginTop: 12,
          padding: "10px 14px",
          background: "#f8fafc",
          borderRadius: 10,
          border: "1px dashed #cbd5e1",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Text style={{ fontSize: 12, color: "#64748B" }}>
          أكتر من {maxTierQty} قطعة؟ اكتب العدد:
        </Text>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <InputNumber
            size="small"
            min={maxTierQty + 1}
            max={99}
            value={customQty}
            placeholder={`${maxTierQty + 1}+`}
            onChange={(val) => {
              setCustomQty(val);
              if (val && onCustomQuantity) onCustomQuantity(val);
            }}
            style={{ width: 80 }}
          />
          <Text style={{ fontSize: 11, color: "#94a3b8" }}>
            ({getPriceForQty(maxTierQty).toLocaleString()} ج.م للقطعة)
          </Text>
        </div>
      </div>
    </div>
  );
}
