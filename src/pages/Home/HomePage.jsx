import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Button, Spin, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { productsAPI, categoriesAPI } from "../../api/services";
import ProductCard from "../../components/product/ProductCard";

const { Title, Text } = Typography;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productsAPI.getAll({ ordering: "-created_at" }),
          categoriesAPI.getAll(),
        ]);
        setProducts(prodRes.data.results || []);
        setCategories(catRes.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div
        className="flex justify-center items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spin size="large" />
      </div>
    );

  return (
    <div>
      {/* Hero Banner */}
      <div
        className="flex items-center justify-center text-center px-4"
        style={{
          minHeight: 480,
          background:
            "linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #3730a3 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />

        <div style={{ position: "relative" }}>
          <Title style={{ color: "#fff", fontSize: 42, marginBottom: 16 }}>
            أهلاً بك في {process.env.REACT_APP_NAME || "متجري"}
          </Title>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 18,
              display: "block",
              marginBottom: 32,
            }}
          >
            اكتشف أفضل المنتجات بأفضل الأسعار
          </Text>
          <Link to="/products">
            <Button type="default" size="large" icon={<ArrowLeftOutlined />}>
              تسوق الآن
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-12">
            <Title level={3} className="mb-6">
              تسوق حسب الفئة
            </Title>
            <Row gutter={[16, 16]}>
              {categories.map((cat) => (
                <Col key={cat.id} xs={12} sm={8} md={6} lg={4}>
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="no-underline"
                  >
                    <div className="text-center p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                      {cat.image && (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-12 h-12 object-cover rounded-full mx-auto mb-2"
                        />
                      )}
                      <Text strong className="text-sm">
                        {cat.name}
                      </Text>
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          </section>
        )}

        {/* Latest Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <Title level={3} style={{ margin: 0 }}>
              أحدث المنتجات
            </Title>
            <Link to="/products">
              <Button type="link" icon={<ArrowLeftOutlined />}>
                عرض الكل
              </Button>
            </Link>
          </div>
          <Row gutter={[20, 20]}>
            {products.slice(0, 8).map((product) => (
              <Col key={product.id} xs={12} sm={8} md={6}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
