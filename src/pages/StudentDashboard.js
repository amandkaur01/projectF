import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const actions = [
    {
      label:       "Available Equipment",
      icon:        "🔧",
      description: "Browse all lab items",
      path:        "/equipment",
      color:       "var(--teal-100)",
    },
    {
      label:       "Borrow Equipment",
      icon:        "📤",
      description: "Request an item to use",
      path:        "/borrow",
      color:       "#dbeafe",
    },
    {
      label:       "Return Equipment",
      icon:        "🔄",
      description: "Return borrowed items",
      path:        "/return",
      color:       "#d1fae5",
    },
    {
      label:       "My History",
      icon:        "📋",
      description: "View past borrow records",
      path:        "/student-history",
      color:       "#fef3c7",
    },
  ];

  return (
    <div className="sl-page">
      <Navbar />
      <div className="sl-content">

        {/* Welcome Header */}
        <div
          style={{
            background:    "linear-gradient(135deg, var(--teal-800), var(--teal-600))",
            borderRadius:  "var(--radius-xl)",
            padding:       "36px 40px",
            color:         "#fff",
            marginBottom:  "32px",
            position:      "relative",
            overflow:      "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "13px", opacity: 0.7, fontWeight: 500, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Student Portal
            </div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>
              Welcome, {user.name || "Student"} 👋
            </h1>
            <p style={{ margin: "8px 0 0", opacity: 0.75, fontSize: "14px" }}>
              Manage your lab equipment borrowing from here
            </p>
          </div>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "-50px", right: "15%", width: "200px", height: "200px", background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
        </div>

        {/* Action Cards */}
        <h2 className="sl-section-title">What would you like to do?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
          {actions.map((a) => (
            <div
              key={a.path}
              onClick={() => navigate(a.path)}
              style={{
                background:     "#fff",
                border:         "1.5px solid var(--border)",
                borderRadius:   "var(--radius-lg)",
                padding:        "26px 22px",
                cursor:         "pointer",
                transition:     "all 0.2s",
                display:        "flex",
                flexDirection:  "column",
                gap:            "12px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform    = "translateY(-4px)";
                e.currentTarget.style.boxShadow    = "var(--shadow-lg)";
                e.currentTarget.style.borderColor  = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform   = "translateY(0)";
                e.currentTarget.style.boxShadow   = "none";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <div style={{ width: "54px", height: "54px", borderRadius: "var(--radius-md)", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {a.label}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {a.description}
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "var(--primary)", fontWeight: 600 }}>
                Go → 
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;
