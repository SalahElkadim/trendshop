import React from "react";
import { Link } from "react-router-dom";
import { Layout, Row, Col, Typography } from "antd";

const { Text } = Typography;

const Footer = () => {
  return (
    <Layout.Footer style={{ background: "#1e293b", padding: "40px 24px 24px" }}>
      <div className="max-w-7xl mx-auto">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <h3 className="text-white text-xl font-bold mb-3">
              {process.env.REACT_APP_NAME || "متجري"}
            </h3>
            <Text style={{ color: "#94a3b8" }}>
              نقدم لك أفضل المنتجات بأفضل الأسعار مع ضمان الجودة.
            </Text>
          </Col>
          <Col xs={12} md={8}>
            <h4 className="text-white font-semibold mb-3">روابط سريعة</h4>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-slate-400 hover:text-white no-underline"
              >
                الرئيسية
              </Link>
              <Link
                to="/products"
                className="text-slate-400 hover:text-white no-underline"
              >
                المنتجات
              </Link>
              <Link
                to="/my-orders"
                className="text-slate-400 hover:text-white no-underline"
              >
                طلباتي
              </Link>
            </div>
          </Col>
          <Col xs={12} md={8}>
            <h4 className="text-white font-semibold mb-3">تواصل معنا</h4>
            <div className="flex flex-col gap-2">
              <Text style={{ color: "#94a3b8" }}>info@store.com</Text>
              <Text style={{ color: "#94a3b8" }}>+20 100 000 0000</Text>
            </div>
          </Col>
        </Row>
        <div className="border-t border-slate-700 mt-8 pt-6 text-center">
          <Text style={{ color: "#64748b" }}>
            © {new Date().getFullYear()} {process.env.REACT_APP_NAME || "متجري"}
            . جميع الحقوق محفوظة.
          </Text>
        </div>
      </div>
    </Layout.Footer>
  );
};

export default Footer;
