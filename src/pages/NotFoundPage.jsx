import React from "react";
import { Link } from "react-router-dom";
import { Result, Button } from "antd";

const NotFoundPage = () => (
  <div
    className="flex justify-center items-center"
    style={{ minHeight: "70vh" }}
  >
    <Result
      status="404"
      title="404"
      subTitle="الصفحة التي تبحث عنها غير موجودة."
      extra={
        <Link to="/">
          <Button type="primary">العودة للرئيسية</Button>
        </Link>
      }
    />
  </div>
);

export default NotFoundPage;
