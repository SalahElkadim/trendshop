import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Divider, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import authStore from "../../stores/authStore";

const { Title, Text } = Typography;

export const LoginPage = observer(() => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const res = await authStore.login(values);
    if (res.success) {
      navigate("/");
    } else {
      message.error(res.error);
    }
  };

  return (
    <div
      className="flex justify-center items-center px-4"
      style={{ minHeight: "80vh", background: "#f8fafc" }}
    >
      <Card
        style={{ width: "100%", maxWidth: 440, borderRadius: 16 }}
        bodyStyle={{ padding: 32 }}
      >
        <div className="text-center mb-8">
          <Title level={2} style={{ margin: 0, color: "#6366f1" }}>
            تسجيل الدخول
          </Title>
          <Text type="secondary">أهلاً بك مجدداً 👋</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, type: "email" }]}>
            <Input prefix={<MailOutlined />} placeholder="البريد الإلكتروني" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="كلمة المرور"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={authStore.isLoading}
            style={{ height: 44 }}
          >
            دخول
          </Button>
        </Form>

        <Divider />
        <div className="text-center">
          <Text type="secondary">ليس لديك حساب؟ </Text>
          <Link to="/register">إنشاء حساب جديد</Link>
        </div>
      </Card>
    </div>
  );
});

export const RegisterPage = observer(() => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const res = await authStore.register(values);
    if (res.success) {
      message.success("تم إنشاء حسابك بنجاح!");
      navigate("/");
    } else {
      message.error(res.error);
    }
  };

  return (
    <div
      className="flex justify-center items-center px-4 py-10"
      style={{ background: "#f8fafc" }}
    >
      <Card
        style={{ width: "100%", maxWidth: 480, borderRadius: 16 }}
        bodyStyle={{ padding: 32 }}
      >
        <div className="text-center mb-8">
          <Title level={2} style={{ margin: 0, color: "#6366f1" }}>
            إنشاء حساب
          </Title>
          <Text type="secondary">انضم إلينا اليوم 🛍️</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="first_name"
            label="الاسم الأول"
            rules={[{ required: true }]}
          >
            <Input prefix={<UserOutlined />} placeholder="محمد" />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="الاسم الأخير"
            rules={[{ required: true }]}
          >
            <Input placeholder="أحمد" />
          </Form.Item>
          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[{ required: true, type: "email" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@email.com" />
          </Form.Item>
          <Form.Item name="phone" label="رقم الهاتف">
            <Input placeholder="01xxxxxxxxx" />
          </Form.Item>
          <Form.Item
            name="password"
            label="كلمة المرور"
            rules={[{ required: true, min: 8 }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="8 أحرف على الأقل"
            />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="تأكيد كلمة المرور"
            dependencies={["password"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject("كلمتا المرور غير متطابقتين!");
                },
              }),
            ]}
          >
            <Input.Password placeholder="أعد كتابة كلمة المرور" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={authStore.isLoading}
            style={{ height: 44 }}
          >
            إنشاء الحساب
          </Button>
        </Form>

        <Divider />
        <div className="text-center">
          <Text type="secondary">لديك حساب بالفعل؟ </Text>
          <Link to="/login">تسجيل الدخول</Link>
        </div>
      </Card>
    </div>
  );
});

export default LoginPage;
