import { useState, useRef } from "react";

/* ─── Design Tokens ─────────────────────────────────────────────────── */
const THEMES = {
  midnight: {
    name: "Midnight Pro",
    bg: "#0d0f1a",
    panel: "#13162b",
    panelAlt: "#1a1f38",
    border: "#252a45",
    text: "#e8eaf6",
    muted: "#6b7399",
    primary: "#6366f1",
    primarySoft: "#1e1f3a",
    accent: "#f59e0b",
    success: "#10b981",
    danger: "#ef4444",
    gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    sidebarGradient: "linear-gradient(180deg,#13162b 0%,#0f1123 100%)",
    font: "'Noto Kufi Arabic', Tahoma, sans-serif",
    shadow: "0 8px 32px rgba(0,0,0,0.5)",
    glow: "0 0 24px rgba(99,102,241,0.3)",
  },
  pearl: {
    name: "Pearl Light",
    bg: "#f0f4ff",
    panel: "#ffffff",
    panelAlt: "#f8faff",
    border: "#dde5f5",
    text: "#1a2045",
    muted: "#7480a0",
    primary: "#3b5bdb",
    primarySoft: "#e8edff",
    accent: "#f59e0b",
    success: "#0d9488",
    danger: "#e53e3e",
    gradient: "linear-gradient(135deg,#3b5bdb,#7048e8)",
    sidebarGradient: "linear-gradient(180deg,#1e2d6b 0%,#2a3d8f 100%)",
    font: "'Noto Kufi Arabic', Tahoma, sans-serif",
    shadow: "0 4px 24px rgba(59,91,219,0.1)",
    glow: "0 0 20px rgba(59,91,219,0.15)",
  },
  emerald: {
    name: "Emerald Dark",
    bg: "#071814",
    panel: "#0d2320",
    panelAlt: "#112b27",
    border: "#1a3d38",
    text: "#d1fae5",
    muted: "#5a8c84",
    primary: "#10b981",
    primarySoft: "#082820",
    accent: "#f59e0b",
    success: "#34d399",
    danger: "#f87171",
    gradient: "linear-gradient(135deg,#10b981,#059669)",
    sidebarGradient: "linear-gradient(180deg,#0a1f1c 0%,#071814 100%)",
    font: "'Noto Kufi Arabic', Tahoma, sans-serif",
    shadow: "0 8px 32px rgba(0,0,0,0.6)",
    glow: "0 0 24px rgba(16,185,129,0.25)",
  },
};

const SECTIONS = [
  { id: "login", label: "شاشة الدخول", icon: "🔐" },
  { id: "sidebar", label: "الشريط الجانبي", icon: "📋" },
  { id: "topbar", label: "شريط العنوان", icon: "🔝" },
  { id: "dashboard", label: "لوحة التحكم", icon: "📊" },
  { id: "pos", label: "نقطة البيع", icon: "🛒" },
  { id: "table", label: "الجداول", icon: "📄" },
  { id: "cards", label: "البطاقات الإحصائية", icon: "💳" },
];

/* ─── Preview Components ─────────────────────────────────────────────── */
function LoginPreview({ t }) {
  return (
    <div style={{
      minHeight: "100%", display: "flex", alignItems: "center",
      justifyContent: "center", background: t.bg, padding: "24px",
      fontFamily: t.font,
    }}>
      <div style={{
        width: 400, background: t.panel, borderRadius: 24,
        border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: 32,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: t.gradient, display: "flex",
            alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 16,
            boxShadow: t.glow,
          }}>AAT</div>
          <div>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 17 }}>نظام شركة عمار العاني</div>
            <div style={{ color: t.muted, fontSize: 12, marginTop: 2 }}>v9 PRO — نسخة احترافية</div>
          </div>
        </div>
        {/* Fields */}
        {["اسم المستخدم", "الرقم السري"].map((lbl, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ color: t.muted, fontSize: 12, marginBottom: 6 }}>{lbl}</div>
            <div style={{
              background: t.panelAlt, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: "11px 14px", color: t.muted,
              fontSize: 14,
            }}>{i === 0 ? "admin" : "••••••"}</div>
          </div>
        ))}
        <div style={{
          background: t.gradient, color: "#fff", borderRadius: 14,
          padding: "13px 0", textAlign: "center", fontWeight: 700,
          marginTop: 20, boxShadow: t.glow, cursor: "pointer",
          fontSize: 15,
        }}>دخول إلى النظام</div>
        <div style={{
          marginTop: 16, padding: "10px 14px", borderRadius: 12,
          background: t.primarySoft, border: `1px dashed ${t.border}`,
          color: t.muted, fontSize: 12, textAlign: "center",
        }}>الحساب الافتراضي: admin / 123456</div>
      </div>
    </div>
  );
}

function SidebarPreview({ t }) {
  const pages = ["لوحة التحكم","البيع (POS)","الشراء","الأصناف","المخزون","العملاء","الموردون","التقارير"];
  const icons = ["📊","🛒","📦","🏷️","🏗️","👥","🚚","📈"];
  return (
    <div style={{ display: "flex", height: "100%", fontFamily: t.font, background: t.bg }}>
      <div style={{
        width: 250, background: t.sidebarGradient,
        borderLeft: `1px solid ${t.border}`, display: "flex",
        flexDirection: "column", padding: "20px 14px",
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14, background: t.gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 13, boxShadow: t.glow,
          }}>AAT</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>عمار العاني</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>المدير الأعلى</div>
          </div>
        </div>
        {/* Search */}
        <div style={{
          background: "rgba(255,255,255,0.07)", borderRadius: 12,
          padding: "9px 12px", marginBottom: 16, color: "rgba(255,255,255,0.3)",
          fontSize: 12, border: `1px solid rgba(255,255,255,0.08)`,
        }}>ابحث عن صنف أو فاتورة...</div>
        {/* Nav */}
        {pages.map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 12, marginBottom: 4,
            background: i === 0 ? t.gradient : "transparent",
            color: i === 0 ? "#fff" : "rgba(255,255,255,0.55)",
            cursor: "pointer", fontSize: 13, fontWeight: i === 0 ? 700 : 400,
            boxShadow: i === 0 ? t.glow : "none",
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 16 }}>{icons[i]}</span>
            {p}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ color: t.muted, fontSize: 13 }}>← الشريط الجانبي على اليسار</div>
      </div>
    </div>
  );
}

function TopbarPreview({ t }) {
  return (
    <div style={{ fontFamily: t.font, background: t.bg, padding: 20 }}>
      <div style={{
        background: t.panel, borderRadius: 20, border: `1px solid ${t.border}`,
        boxShadow: t.shadow, padding: "16px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <h2 style={{ margin: 0, color: t.text, fontSize: 22, fontWeight: 800 }}>لوحة التحكم</h2>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>نظرة تنفيذية سريعة على الشركة</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["نسخة احتياطية","استيراد نسخة"].map((btn, i) => (
            <div key={i} style={{
              background: i === 0 ? t.gradient : t.panelAlt,
              color: i === 0 ? "#fff" : t.text,
              borderRadius: 12, padding: "9px 16px", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
              border: i === 1 ? `1px solid ${t.border}` : "none",
              boxShadow: i === 0 ? t.glow : "none",
            }}>{btn}</div>
          ))}
        </div>
      </div>
      {/* Breadcrumb */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center",
        marginTop: 14, padding: "0 8px",
      }}>
        {["الرئيسية","لوحة التحكم"].map((s, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span style={{ color: t.muted }}>›</span>}
            <span style={{ color: i === 1 ? t.primary : t.muted, fontSize: 13, fontWeight: i===1?700:400 }}>{s}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function DashboardPreview({ t }) {
  const stats = [
    { label: "إجمالي المبيعات", value: "٤,٨٢٥,٠٠٠", icon: "📈", color: t.primary, trend: "+١٢٪" },
    { label: "صافي الربح", value: "٨٦٢,٥٠٠", icon: "💰", color: t.success, trend: "+٨٪" },
    { label: "الأصناف النشطة", value: "٣٢٤", icon: "📦", color: t.accent, trend: "+٥" },
    { label: "ديون العملاء", value: "٢٣٠,٠٠٠", icon: "📋", color: t.danger, trend: "-٣٪" },
  ];
  return (
    <div style={{ fontFamily: t.font, background: t.bg, padding: 20 }}>
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: t.panel, borderRadius: 18, border: `1px solid ${t.border}`,
            boxShadow: t.shadow, padding: "18px 16px", position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, right: 0, width: 80, height: 80,
              borderRadius: "0 18px 0 100%",
              background: `${s.color}18`,
            }}/>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ color: t.muted, fontSize: 11, marginBottom: 4 }}>{s.label}</div>
            <div style={{ color: t.text, fontSize: 20, fontWeight: 800 }}>{s.value}</div>
            <div style={{
              marginTop: 8, fontSize: 11, color: s.trend.startsWith("+") ? t.success : t.danger,
              fontWeight: 700,
            }}>{s.trend} هذا الشهر</div>
          </div>
        ))}
      </div>
      {/* Chart placeholder + table */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <div style={{
          background: t.panel, borderRadius: 18, border: `1px solid ${t.border}`,
          boxShadow: t.shadow, padding: 20,
        }}>
          <div style={{ color: t.text, fontWeight: 700, marginBottom: 14 }}>📉 مبيعات الأشهر الأخيرة</div>
          {/* Bar chart visual */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
            {[40,65,50,80,70,90,60,75].map((h,i) => (
              <div key={i} style={{
                flex: 1, height: `${h}%`, borderRadius: "6px 6px 0 0",
                background: i === 7 ? t.gradient : `${t.primary}40`,
                boxShadow: i === 7 ? t.glow : "none",
                transition: "height 0.3s",
              }}/>
            ))}
          </div>
        </div>
        <div style={{
          background: t.panel, borderRadius: 18, border: `1px solid ${t.border}`,
          boxShadow: t.shadow, padding: 20,
        }}>
          <div style={{ color: t.text, fontWeight: 700, marginBottom: 14 }}>⚠️ أصناف تحتاج طلب</div>
          {["مصباح LED","حنفية ستانلس","برغي جبس"].map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 0", borderBottom: i < 2 ? `1px solid ${t.border}` : "none",
              color: t.muted, fontSize: 13,
            }}>
              <span style={{ color: t.text }}>{item}</span>
              <span style={{
                background: i === 0 ? `${t.danger}20` : `${t.accent}20`,
                color: i === 0 ? t.danger : t.accent,
                borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700,
              }}>{i === 0 ? "حرج" : "يحتاج طلب"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function POSPreview({ t }) {
  const items = ["مصباح LED 40W","حنفية ستانلس","برغي جبس 3 سم"];
  return (
    <div style={{ fontFamily: t.font, background: t.bg, padding: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Items panel */}
        <div style={{
          background: t.panel, borderRadius: 18, border: `1px solid ${t.border}`,
          boxShadow: t.shadow, padding: 18,
        }}>
          <div style={{ color: t.text, fontWeight: 700, marginBottom: 14 }}>🔍 بحث عن صنف</div>
          <div style={{
            background: t.panelAlt, borderRadius: 12, padding: "10px 14px",
            border: `1px solid ${t.primary}60`, color: t.primary, fontSize: 13, marginBottom: 14,
          }}>led 40</div>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", borderRadius: 12, marginBottom: 8,
              background: t.panelAlt, border: `1px solid ${t.border}`,
              cursor: "pointer",
            }}>
              <div>
                <div style={{ color: t.text, fontSize: 13, fontWeight: 600 }}>{item}</div>
                <div style={{ color: t.muted, fontSize: 11 }}>رصيد: {(i+1)*20} قطعة</div>
              </div>
              <div style={{
                background: t.gradient, color: "#fff", borderRadius: 10,
                padding: "6px 14px", fontSize: 12, fontWeight: 700, boxShadow: t.glow,
              }}>+ إضافة</div>
            </div>
          ))}
        </div>
        {/* Cart panel */}
        <div style={{
          background: t.panel, borderRadius: 18, border: `1px solid ${t.border}`,
          boxShadow: t.shadow, padding: 18,
        }}>
          <div style={{ color: t.text, fontWeight: 700, marginBottom: 14 }}>🛒 سلة البيع</div>
          {[
            { name: "مصباح LED 40W", qty: 3, price: "9,500" },
            { name: "حنفية ستانلس", qty: 1, price: "16,500" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 0", borderBottom: `1px dashed ${t.border}`,
              color: t.text, fontSize: 13,
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ color: t.muted, fontSize: 11 }}>×{item.qty}</div>
              </div>
              <div style={{ color: t.primary, fontWeight: 700 }}>{item.price} د.ع</div>
            </div>
          ))}
          <div style={{
            marginTop: 16, background: t.primarySoft, borderRadius: 14,
            padding: "16px 18px", textAlign: "center",
            border: `1px solid ${t.primary}40`,
          }}>
            <div style={{ color: t.muted, fontSize: 12 }}>المبلغ الإجمالي</div>
            <div style={{ color: t.primary, fontSize: 26, fontWeight: 800 }}>٤٥,٠٠٠ د.ع</div>
          </div>
          <div style={{
            background: t.gradient, color: "#fff", borderRadius: 14,
            padding: "13px 0", textAlign: "center", fontWeight: 700,
            marginTop: 12, boxShadow: t.glow, cursor: "pointer", fontSize: 15,
          }}>✅ تأكيد الفاتورة</div>
        </div>
      </div>
    </div>
  );
}

function TablePreview({ t }) {
  const rows = [
    { no: "INV-0045", customer: "أحمد علي", total: "٢٣,٥٠٠", status: "مدفوع", date: "٢٠٢٦/٠٤/١٨" },
    { no: "INV-0044", customer: "شركة البناء", total: "١٨٧,٠٠٠", status: "آجل", date: "٢٠٢٦/٠٤/١٧" },
    { no: "INV-0043", customer: "محمد حسن", total: "٩,٥٠٠", status: "مدفوع", date: "٢٠٢٦/٠٤/١٦" },
  ];
  return (
    <div style={{ fontFamily: t.font, background: t.bg, padding: 20 }}>
      <div style={{
        background: t.panel, borderRadius: 18, border: `1px solid ${t.border}`,
        boxShadow: t.shadow, overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${t.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: t.text, fontWeight: 700, fontSize: 16 }}>سجل الفواتير</span>
          <div style={{
            background: t.gradient, color: "#fff", borderRadius: 10,
            padding: "7px 16px", fontSize: 12, fontWeight: 700, boxShadow: t.glow,
          }}>+ فاتورة جديدة</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: t.panelAlt }}>
              {["رقم الفاتورة","العميل","الإجمالي","الحالة","التاريخ","إجراءات"].map((h, i) => (
                <th key={i} style={{
                  padding: "12px 16px", textAlign: "right",
                  color: t.muted, fontSize: 12, fontWeight: 700,
                  borderBottom: `1px solid ${t.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{
                borderBottom: `1px solid ${t.border}`,
                background: i % 2 === 1 ? t.panelAlt : t.panel,
              }}>
                <td style={{ padding: "12px 16px", color: t.primary, fontWeight: 700, fontSize: 13 }}>{row.no}</td>
                <td style={{ padding: "12px 16px", color: t.text, fontSize: 13 }}>{row.customer}</td>
                <td style={{ padding: "12px 16px", color: t.text, fontSize: 13, fontWeight: 600 }}>{row.total} د.ع</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    background: row.status === "مدفوع" ? `${t.success}20` : `${t.accent}20`,
                    color: row.status === "مدفوع" ? t.success : t.accent,
                    borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 700,
                  }}>{row.status}</span>
                </td>
                <td style={{ padding: "12px 16px", color: t.muted, fontSize: 12 }}>{row.date}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["👁️","✏️","🗑️"].map((icon, j) => (
                      <span key={j} style={{
                        background: t.panelAlt, borderRadius: 8, padding: "5px 8px",
                        cursor: "pointer", fontSize: 13, border: `1px solid ${t.border}`,
                      }}>{icon}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardsPreview({ t }) {
  const stats = [
    { label: "إجمالي المبيعات اليوم", value: "٢٣٥,٠٠٠", icon: "💵", color: t.primary },
    { label: "المشتريات الشهر", value: "١,٢٠٠,٠٠٠", icon: "📦", color: t.success },
    { label: "عدد العملاء", value: "١٤٨", icon: "👥", color: t.accent },
    { label: "المنتجات المنتهية", value: "١٢", icon: "⚠️", color: t.danger },
    { label: "صافي الربح", value: "٦٧٨,٥٠٠", icon: "📈", color: t.success },
    { label: "التحويلات المعلقة", value: "٣", icon: "🔄", color: t.muted },
  ];
  return (
    <div style={{ fontFamily: t.font, background: t.bg, padding: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: t.panel, borderRadius: 18, border: `1px solid ${t.border}`,
            boxShadow: t.shadow, padding: "20px 18px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: `${s.color}20`, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 24,
              flexShrink: 0, border: `1px solid ${s.color}40`,
            }}>{s.icon}</div>
            <div>
              <div style={{ color: t.muted, fontSize: 11, marginBottom: 4 }}>{s.label}</div>
              <div style={{ color: t.text, fontSize: 20, fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: s.color, fontSize: 11, marginTop: 2, fontWeight: 600 }}>● نشط</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PREVIEW_MAP = {
  login: LoginPreview,
  sidebar: SidebarPreview,
  topbar: TopbarPreview,
  dashboard: DashboardPreview,
  pos: POSPreview,
  table: TablePreview,
  cards: CardsPreview,
};

/* ─── Main App ───────────────────────────────────────────────────────── */
export default function App() {
  const [activeTheme, setActiveTheme] = useState("midnight");
  const [activeSection, setActiveSection] = useState("dashboard");
  const t = THEMES[activeTheme];
  const PreviewComp = PREVIEW_MAP[activeSection];

  return (
    <div style={{
      fontFamily: t.font, background: t.bg, minHeight: "100vh",
      color: t.text, direction: "rtl",
    }}>
      {/* ─── Header Bar ─── */}
      <div style={{
        background: t.panel, borderBottom: `1px solid ${t.border}`,
        padding: "14px 24px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        boxShadow: t.shadow, position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14, background: t.gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 14, boxShadow: t.glow,
          }}>AAT</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>AAT ERP v9 PRO</div>
            <div style={{ color: t.muted, fontSize: 11 }}>مصمم الواجهة الاحترافي</div>
          </div>
        </div>
        {/* Theme switcher */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: t.muted, fontSize: 12 }}>الثيم:</span>
          {Object.entries(THEMES).map(([key, theme]) => (
            <div key={key} onClick={() => setActiveTheme(key)} style={{
              padding: "7px 16px", borderRadius: 10, cursor: "pointer",
              background: activeTheme === key ? t.gradient : t.panelAlt,
              color: activeTheme === key ? "#fff" : t.muted,
              fontWeight: activeTheme === key ? 700 : 400,
              fontSize: 12, border: `1px solid ${t.border}`,
              boxShadow: activeTheme === key ? t.glow : "none",
              transition: "all 0.2s",
            }}>{theme.name}</div>
          ))}
        </div>
      </div>

      {/* ─── Body ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 70px)" }}>
        {/* ─── Sections Nav ─── */}
        <div style={{
          background: t.panel, borderLeft: `1px solid ${t.border}`,
          padding: "20px 14px",
        }}>
          <div style={{ color: t.muted, fontSize: 11, fontWeight: 700, marginBottom: 14, paddingRight: 4 }}>
            الأقسام — اختر للمعاينة
          </div>
          {SECTIONS.map(sec => (
            <div key={sec.id} onClick={() => setActiveSection(sec.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 14px", borderRadius: 12, marginBottom: 6,
              cursor: "pointer", fontSize: 13,
              background: activeSection === sec.id ? t.gradient : "transparent",
              color: activeSection === sec.id ? "#fff" : t.text,
              fontWeight: activeSection === sec.id ? 700 : 400,
              boxShadow: activeSection === sec.id ? t.glow : "none",
              border: `1px solid ${activeSection === sec.id ? "transparent" : t.border}`,
              transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 18 }}>{sec.icon}</span>
              {sec.label}
            </div>
          ))}

          {/* Theme info card */}
          <div style={{
            marginTop: 24, background: t.panelAlt, borderRadius: 14,
            padding: "14px", border: `1px solid ${t.border}`,
          }}>
            <div style={{ color: t.muted, fontSize: 11, marginBottom: 8 }}>الثيم الحالي</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {[t.primary, t.success, t.accent, t.danger].map((c, i) => (
                <div key={i} style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: c, border: `2px solid ${t.border}`,
                }}/>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Live Preview ─── */}
        <div style={{ overflow: "auto" }}>
          {/* Preview label */}
          <div style={{
            background: t.panelAlt, borderBottom: `1px solid ${t.border}`,
            padding: "10px 20px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>{SECTIONS.find(s => s.id === activeSection)?.icon}</span>
            <span style={{ color: t.text, fontWeight: 600, fontSize: 14 }}>
              معاينة مباشرة: {SECTIONS.find(s => s.id === activeSection)?.label}
            </span>
            <span style={{
              marginRight: "auto", background: `${t.success}20`, color: t.success,
              borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700,
            }}>● LIVE</span>
          </div>

          {/* Render preview */}
          <div style={{ minHeight: 500 }}>
            <PreviewComp t={t} />
          </div>

          {/* Color tokens panel */}
          <div style={{
            margin: "0 20px 20px", background: t.panel,
            borderRadius: 18, border: `1px solid ${t.border}`,
            boxShadow: t.shadow, padding: 20,
          }}>
            <div style={{ color: t.text, fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
              🎨 توكنات الألوان — {t.name}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {[
                ["الخلفية", t.bg],
                ["البطاقة", t.panel],
                ["الأساسي", t.primary],
                ["النجاح", t.success],
                ["التحذير", t.accent],
                ["الخطر", t.danger],
                ["النص", t.text],
                ["الخافت", t.muted],
              ].map(([label, color]) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: t.panelAlt, borderRadius: 12, padding: "10px 12px",
                  border: `1px solid ${t.border}`,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: color, border: `1px solid ${t.border}`,
                    flexShrink: 0,
                  }}/>
                  <div>
                    <div style={{ color: t.text, fontSize: 12, fontWeight: 600 }}>{label}</div>
                    <div style={{ color: t.muted, fontSize: 10, fontFamily: "monospace" }}>{color}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
