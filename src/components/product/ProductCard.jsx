import React from "react";
import { Link } from "react-router-dom";
import { Card, Rate, Tag, Button, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import cartStore from "../../stores/cartStore";

const { Text, Title } = Typography;

const ProductCard = observer(({ product }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    // لو في variant واحد بس، ضيفه مباشرة
    const variants = product.variants || [];
    const firstVariant = variants.find((v) => !v.is_out_of_stock);
    cartStore.addItem(product.id, firstVariant?.id || null, 1);
  };

  return (
    <Link to={`/products/${product.slug}`} className="no-underline">
      <Card
        hoverable
        cover={
          <div className="relative overflow-hidden" style={{ height: 220 }}>
            <img
              src={product.primary_image || "/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            {product.discount_percentage > 0 && (
              <Tag color="#ef4444" className="absolute top-2 left-2 font-bold">
                -{product.discount_percentage}%
              </Tag>
            )}
            {!product.is_in_stock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Tag color="default">نفد المخزون</Tag>
              </div>
            )}
          </div>
        }
        bodyStyle={{ padding: "12px 16px" }}
        style={{ borderRadius: 12, overflow: "hidden" }}
      >
        <Text type="secondary" className="text-xs">
          {product.category_name}
        </Text>

        <Title
          level={5}
          ellipsis={{ rows: 2 }}
          style={{ margin: "4px 0 8px", fontSize: 14 }}
        >
          {product.name}
        </Title>

        {/* Rating */}
        {product.avg_rating && (
          <div className="flex items-center gap-1 mb-2">
            <Rate
              disabled
              defaultValue={product.avg_rating}
              allowHalf
              style={{ fontSize: 12 }}
            />
            <Text type="secondary" className="text-xs">
              ({product.reviews_count})
            </Text>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <Text strong style={{ fontSize: 16, color: "#6366f1" }}>
            {Number(product.effective_price).toLocaleString()} ج.م
          </Text>
          {product.discount_price && (
            <Text delete type="secondary" className="text-sm">
              {Number(product.price).toLocaleString()}
            </Text>
          )}
        </div>

        {/* Add to Cart */}
        <Button
          type="primary"
          block
          icon={<ShoppingCartOutlined />}
          disabled={!product.is_in_stock}
          onClick={handleAddToCart}
          size="small"
        >
          {product.is_in_stock ? "أضف للسلة" : "نفد المخزون"}
        </Button>
      </Card>
    </Link>
  );
});

export default ProductCard;
