import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Tabs,
  message,
  Avatar,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import authStore from "../../stores/authStore";
import { authAPI } from "../../api/services";

const { Title } = Typography;

const AccountPage = observer(() => {
  const [profileForm] = Form.useForm();
  const [passForm] = Form.useForm();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleProfileSave = async (values) => {
    setSavingProfile(true);
    const res = await authStore.updateProfile(values);
    if (res.success) message.success("تم حفظ البيانات.");
    else message.error(res.error || "فشل الحفظ.");
    setSavingProfile(false);
  };

  const handleChangePassword = async (values) => {
    setSavingPass(true);
    try {
      await authAPI.changePassword(values);
      message.success("تم تغيير كلمة المرور.");
      passForm.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || "فشل تغيير كلمة المرور.");
    } finally {
      setSavingPass(false);
    }
  };

  const items = [
    {
      key: "profile",
      label: "بياناتي",
      children: (
        <Form
          form={profileForm}
          layout="vertical"
          initialValues={{
            first_name: authStore.user?.first_name,
            last_name: authStore.user?.last_name,
            phone: authStore.user?.phone,
          }}
          onFinish={handleProfileSave}
          style={{ maxWidth: 480 }}
        >
          <Form.Item
            name="first_name"
            label="الاسم الأول"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="الاسم الأخير">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="رقم الهاتف">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={savingProfile}>
            حفظ التعديلات
          </Button>
        </Form>
      ),
    },
    {
      key: "password",
      label: "تغيير كلمة المرور",
      children: (
        <Form
          form={passForm}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ maxWidth: 480 }}
        >
          <Form.Item
            name="old_password"
            label="كلمة المرور الحالية"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="كلمة المرور الجديدة"
            rules={[{ required: true, min: 8 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="تأكيد كلمة المرور الجديدة"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={savingPass}>
            تغيير كلمة المرور
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar
          size={64}
          src={authStore.user?.avatar}
          icon={<UserOutlined />}
          style={{ backgroundColor: "#6366f1" }}
        />
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {authStore.user?.name ||
              `${authStore.user?.first_name} ${authStore.user?.last_name}`}
          </Title>
          <span className="text-slate-500">{authStore.user?.email}</span>
        </div>
      </div>

      <Card>
        <Tabs items={items} />
      </Card>
    </div>
  );
});

export default AccountPage;
