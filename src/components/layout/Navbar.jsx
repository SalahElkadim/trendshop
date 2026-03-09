import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Badge, Button, Dropdown, Avatar, Space } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import authStore from "../../stores/authStore";
import cartStore from "../../stores/cartStore";

const Navbar = observer(() => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authStore.logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "account",
      icon: <SettingOutlined />,
      label: <Link to="/account">حسابي</Link>,
    },
    {
      key: "orders",
      icon: <OrderedListOutlined />,
      label: <Link to="/my-orders">طلباتي</Link>,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "تسجيل الخروج",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header
      className="fixed top-0 w-full z-50 bg-white border-b border-slate-100"
      style={{ height: 64 }}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-600 no-underline"
        >
          {process.env.REACT_APP_NAME || "متجري"}
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-slate-600 hover:text-indigo-600 no-underline font-medium"
          >
            الرئيسية
          </Link>
          <Link
            to="/products"
            className="text-slate-600 hover:text-indigo-600 no-underline font-medium"
          >
            المنتجات
          </Link>
          <Link
            to="/about"
            className="text-slate-600 hover:text-indigo-600 no-underline font-medium"
          >
            من نحن
          </Link>
        </nav>

        {/* Actions */}
        <Space size={12}>
          {/* Cart */}
          <Badge count={cartStore.itemsCount} size="small" color="#6366f1">
            <Button
              type="text"
              shape="circle"
              icon={<ShoppingCartOutlined style={{ fontSize: 22 }} />}
              onClick={() => cartStore.openDrawer()}
            />
          </Badge>

          {/* Auth */}
          {authStore.isLoggedIn ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomLeft"
              trigger={["click"]}
            >
              <Avatar
                src={authStore.user?.avatar}
                icon={<UserOutlined />}
                style={{ cursor: "pointer", backgroundColor: "#6366f1" }}
              />
            </Dropdown>
          ) : (
            <Space>
              <Button onClick={() => navigate("/login")}>دخول</Button>
              <Button type="primary" onClick={() => navigate("/register")}>
                تسجيل
              </Button>
            </Space>
          )}
        </Space>
      </div>
    </header>
  );
});

export default Navbar;
