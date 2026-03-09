import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  HeartOutlined,
  SafetyOutlined,
  RocketOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const stats = [
  { value: "+١٠٠٠", label: "عميل سعيد" },
  { value: "+٥٠٠", label: "منتج متاح" },
  { value: "٥", label: "سنوات خبرة" },
  { value: "٢٤/٧", label: "دعم فني" },
];

const values = [
  {
    icon: <HeartOutlined style={{ fontSize: 32, color: "#6366f1" }} />,
    title: "شغفنا",
    desc: "نؤمن بأن كل عميل يستحق تجربة تسوق استثنائية، ونعمل بكل شغف لتحقيق ذلك في كل يوم.",
  },
  {
    icon: <SafetyOutlined style={{ fontSize: 32, color: "#6366f1" }} />,
    title: "الجودة أولاً",
    desc: "نختار منتجاتنا بعناية فائقة لضمان أعلى مستويات الجودة وأفضل قيمة مقابل المال.",
  },
  {
    icon: <RocketOutlined style={{ fontSize: 32, color: "#6366f1" }} />,
    title: "التوصيل السريع",
    desc: "نضمن وصول طلبك إليك في أسرع وقت ممكن، مع تتبع لحظي لشحنتك طوال الطريق.",
  },
  {
    icon: <TeamOutlined style={{ fontSize: 32, color: "#6366f1" }} />,
    title: "فريق متكامل",
    desc: "فريقنا من المتخصصين يعملون على مدار الساعة لضمان رضاك التام وحل أي استفسار فوراً.",
  },
];

const team = [
  { name: "أحمد سامي", role: "المؤسس والرئيس التنفيذي", initials: "أس" },
  { name: "سارة محمود", role: "مديرة العمليات", initials: "سم" },
  { name: "خالد يوسف", role: "مدير خدمة العملاء", initials: "خي" },
];

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Cairo', sans-serif",
        background: "#f8faff",
        minHeight: "100vh",
        paddingTop: 64,
      }}
    >
      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />

      {/* Hero Section */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #3730a3 100%)",
          padding: "80px 24px",
          textAlign: "center",
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

        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <span
            style={{
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              padding: "6px 20px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1,
              display: "inline-block",
              marginBottom: 20,
            }}
          >
            قصتنا
          </span>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 900,
              margin: "0 0 20px",
              lineHeight: 1.3,
            }}
          >
            نبني تجربة تسوق
            <br />
            <span style={{ color: "#c7d2fe" }}>تستحق الثقة</span>
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 17,
              lineHeight: 1.8,
              margin: "0 0 32px",
            }}
          >
            بدأنا رحلتنا بحلم بسيط: توفير منتجات عالية الجودة بأسعار عادلة لكل
            منزل عربي، وها نحن اليوم نخدم آلاف العملاء بكل فخر.
          </p>
          <Button
            size="large"
            onClick={() => navigate("/products")}
            style={{
              background: "#fff",
              color: "#6366f1",
              fontWeight: 700,
              border: "none",
              borderRadius: 10,
              height: 48,
              paddingInline: 36,
              fontSize: 15,
            }}
          >
            تصفح منتجاتنا
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 24,
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: 900,
                  color: "#6366f1",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: 14,
                  marginTop: 8,
                  fontWeight: 600,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section
        style={{ padding: "64px 24px", maxWidth: 860, margin: "0 auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
          className="about-grid"
        >
          <div>
            <span
              style={{
                color: "#6366f1",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              من نحن
            </span>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                fontWeight: 900,
                color: "#0f172a",
                margin: "12px 0 20px",
                lineHeight: 1.4,
              }}
            >
              أكثر من مجرد متجر إلكتروني
            </h2>
            <p
              style={{
                color: "#475569",
                lineHeight: 1.9,
                fontSize: 15,
                margin: "0 0 16px",
              }}
            >
              تأسسنا عام ٢٠١٩ بهدف واحد واضح: تغيير طريقة التسوق الإلكتروني في
              العالم العربي. نحن لا نبيع منتجات فحسب، بل نبني علاقات قائمة على
              الثقة والشفافية مع كل عميل.
            </p>
            <p
              style={{
                color: "#475569",
                lineHeight: 1.9,
                fontSize: 15,
                margin: 0,
              }}
            >
              فريقنا المتنوع من المحترفين يعمل بلا كلل لضمان أن كل طلب يصل
              بأمان، وأن كل استفسار يُجاب عليه باحترافية وسرعة.
            </p>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
              borderRadius: 24,
              padding: 40,
              textAlign: "center",
              minHeight: 260,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 64 }}>🛍️</div>
            <div style={{ fontWeight: 900, fontSize: 20, color: "#4f46e5" }}>
              متجري
            </div>
            <div style={{ color: "#6366f1", fontSize: 13 }}>
              منذ ٢٠١٩ • نخدمك بكل فخر
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span
              style={{
                color: "#6366f1",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 2,
              }}
            >
              ما يميزنا
            </span>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                fontWeight: 900,
                color: "#0f172a",
                margin: "12px 0 0",
              }}
            >
              قيمنا ومبادئنا
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 24,
            }}
          >
            {values.map((v) => (
              <div
                key={v.title}
                style={{
                  background: "#f8faff",
                  borderRadius: 16,
                  padding: 28,
                  border: "1px solid #e0e7ff",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(99,102,241,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ marginBottom: 16 }}>{v.icon}</div>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    color: "#0f172a",
                    margin: "0 0 10px",
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: 14,
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span
              style={{
                color: "#6366f1",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 2,
              }}
            >
              خلف الكواليس
            </span>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                fontWeight: 900,
                color: "#0f172a",
                margin: "12px 0 0",
              }}
            >
              فريق العمل
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 24,
            }}
          >
            {team.map((member) => (
              <div key={member.name} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#fff",
                  }}
                >
                  {member.initials}
                </div>
                <div
                  style={{ fontWeight: 800, color: "#0f172a", fontSize: 16 }}
                >
                  {member.name}
                </div>
                <div style={{ color: "#6366f1", fontSize: 13, marginTop: 4 }}>
                  {member.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          padding: "56px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            fontWeight: 900,
            margin: "0 0 12px",
          }}
        >
          انضم لعائلتنا اليوم
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 15,
            margin: "0 0 28px",
          }}
        >
          تسوق بثقة واستمتع بأفضل العروض والخدمة
        </p>
        <Button
          size="large"
          onClick={() => navigate("/register")}
          style={{
            background: "#fff",
            color: "#6366f1",
            fontWeight: 700,
            border: "none",
            borderRadius: 10,
            height: 48,
            paddingInline: 40,
            fontSize: 15,
          }}
        >
          إنشاء حساب مجاناً
        </Button>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
