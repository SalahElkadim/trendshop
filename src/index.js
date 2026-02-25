import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import arEG from "antd/locale/ar_EG";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ConfigProvider
      locale={arEG}
      direction="rtl"
      theme={{
        token: {
          colorPrimary: "#6366F1",
          borderRadius: 8,
          fontFamily: "'Cairo', sans-serif",
        },
        components: {
          Button: {
            primaryColor: "#fff",
          },
          Input: {
            borderRadius: 8,
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
