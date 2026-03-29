import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import axios from "axios";
import Navbar from "../components/Navbar";
import useAutoRefresh from "../hooks/useAutoRefresh";

const BASE       = process.env.REACT_APP_API_URL || "http://localhost:8080";
const AI_BASE    = `${BASE}/api/ai`;
const EMAIL_BASE = `${BASE}/api/email`;

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState({
    totalEquipment: 0,
    borrowed: 0,
    overdue: 0,
    available: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [analysis,       setAnalysis]       = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [question,       setQuestion]       = useState("");
  const [answer,         setAnswer]         = useState("");

  const [loadingAnalysis,       setLoadingAnalysis]       = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [loadingChat,           setLoadingChat]           = useState(false);
  const [activeAI,              setActiveAI]              = useState(null);
  const [emailLogs,             setEmailLogs]             = useState([]);
  const [triggerLoading,        setTriggerLoading]        = useState(false);

  // Fetch both stats and equipment in one refresh cycle
  const fetchDashboardData = useCallback(() => {
    // Stats
    API.get("/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));

    // Email notification logs
    axios.get(`${EMAIL_BASE}/logs`)
      .then((res) => setEmailLogs(res.data))
      .catch(() => {});

    // Low stock: available < 30% of total OR out of stock
    API.get("/equipment")
      .then((res) => {
        const low = res.data
          .filter((e) => {
            if (e.totalQuantity === 0) return false;
            return (
              e.availableQuantity === 0 ||
              e.availableQuantity / e.totalQuantity < 0.3
            );
          })
          .sort((a, b) => a.availableQuantity - b.availableQuantity);
        setLowStockItems(low);
        setLastUpdated(new Date());
      })
      .catch((err) => console.log(err));
  }, []);

  // Auto-refresh on mount, window focus, and every 30s
  useAutoRefresh(fetchDashboardData, 30000);

  /* ── AI Handlers ─────────────────────────────────── */

  const getUsageAnalysis = () => {
    setLoadingAnalysis(true);
    setActiveAI("analysis");
    setAnalysis("");
    axios.get(`${AI_BASE}/usage-analysis`)
      .then((res) => setAnalysis(res.data))
      .catch(() => setAnalysis("⚠️ Could not reach AI service."))
      .finally(() => setLoadingAnalysis(false));
  };

  const getRecommendation = () => {
    setLoadingRecommendation(true);
    setActiveAI("recommendation");
    setRecommendation("");
    axios.get(`${AI_BASE}/recommendation`)
      .then((res) => setRecommendation(res.data))
      .catch(() => setRecommendation("⚠️ Could not reach AI service."))
      .finally(() => setLoadingRecommendation(false));
  };

  const askAI = () => {
    if (!question.trim()) return;
    setLoadingChat(true);
    setActiveAI("chat");
    setAnswer("");
    axios.post(`${AI_BASE}/chat`, { question })
      .then((res) => setAnswer(res.data))
      .catch(() => setAnswer("⚠️ Could not reach AI service."))
      .finally(() => setLoadingChat(false));
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") askAI(); };

  const triggerEmailCheck = () => {
    setTriggerLoading(true);
    axios.post(`${EMAIL_BASE}/trigger`)
      .then(() => {
        axios.get(`${EMAIL_BASE}/logs`).then((res) => setEmailLogs(res.data)).catch(() => {});
        alert("✅ Overdue email check completed. Check the log below.");
      })
      .catch(() => setMessage && console.log("Email trigger unavailable in production - runs automatically at 8AM"))
      .finally(() => setTriggerLoading(false));
  };

  const actions = [
    { label: "View Equipment", icon: "🔧", path: "/equipment" },
    { label: "Add Equipment",  icon: "➕", path: "/add-equipment" },
    { label: "Borrow Records", icon: "📋", path: "/borrow-records" },
  ];

  return (
    <div className="sl-page">
      <Navbar />
      <div className="sl-content">

        {/* Header */}
        <div className="sl-page-header">
          <h1 className="sl-page-header__title">
            <div className="sl-page-header__title-icon">👨‍💼</div>
            Admin Dashboard
          </h1>
          <p className="sl-page-header__subtitle">
            Welcome back, <strong>{user.name || "Admin"}</strong> — here's an overview of the lab.
            {lastUpdated && (
              <span style={{ marginLeft: "10px", fontSize: "11px", color: "var(--text-muted)" }}>
                · Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        {/* ── Stat Cards ──────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}>
          <div className="sl-stat-card">
            <div className="sl-stat-card__icon sl-stat-card__icon--teal">🔧</div>
            <div className="sl-stat-card__value">{stats.totalEquipment}</div>
            <div className="sl-stat-card__label">Total Units</div>
            <div className="sl-stat-card__glow" />
          </div>
          <div className="sl-stat-card">
            <div className="sl-stat-card__icon sl-stat-card__icon--blue">📤</div>
            <div className="sl-stat-card__value">{stats.borrowed}</div>
            <div className="sl-stat-card__label">Units Borrowed</div>
            <div className="sl-stat-card__glow" />
          </div>
          <div className="sl-stat-card">
            <div className="sl-stat-card__icon sl-stat-card__icon--red">⏰</div>
            <div className="sl-stat-card__value"
              style={{ color: stats.overdue > 0 ? "#b91c1c" : undefined }}>
              {stats.overdue}
            </div>
            <div className="sl-stat-card__label">Overdue Units</div>
            <div className="sl-stat-card__glow" />
          </div>
          <div className="sl-stat-card">
            <div className="sl-stat-card__icon sl-stat-card__icon--amber">✅</div>
            <div className="sl-stat-card__value">{stats.available}</div>
            <div className="sl-stat-card__label">Available Now</div>
            <div className="sl-stat-card__glow" />
          </div>
        </div>

        {/* ── Quick Actions + Low Stock ────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "36px" }}>

          {/* Quick Actions */}
          <div>
            <h2 className="sl-section-title">Quick Actions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              {actions.map((a) => (
                <div key={a.path} className="sl-action-card" onClick={() => navigate(a.path)}>
                  <div className="sl-action-card__icon">{a.icon}</div>
                  <div className="sl-action-card__label">{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div>
            <h2 className="sl-section-title"
              style={{ color: lowStockItems.length > 0 ? "#b45309" : undefined }}>
              ⚠️ Low Stock Alert
              {lowStockItems.length > 0 && (
                <span style={{
                  background: "#fef3c7", color: "#92400e",
                  fontSize: "11px", fontWeight: 700,
                  padding: "2px 9px", borderRadius: "20px",
                  marginLeft: "8px", verticalAlign: "middle",
                }}>
                  {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""}
                </span>
              )}
            </h2>

            <div className="sl-card" style={{ padding: 0, overflow: "hidden" }}>
              {lowStockItems.length === 0 ? (
                <div style={{
                  padding: "28px 20px", textAlign: "center",
                  color: "var(--text-muted)", fontSize: "14px",
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>✅</div>
                  All equipment is well stocked
                </div>
              ) : (
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {lowStockItems.map((item) => {
                    const pct = item.totalQuantity > 0
                      ? Math.round((item.availableQuantity / item.totalQuantity) * 100)
                      : 0;
                    const isOut = item.availableQuantity === 0;
                    return (
                      <div key={item.id} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 16px", borderBottom: "1px solid var(--border)",
                        background: isOut ? "#fff5f5" : "#fffbeb",
                      }}>
                        <div style={{
                          width: "10px", height: "10px", borderRadius: "50%",
                          flexShrink: 0, background: isOut ? "#ef4444" : "#f59e0b",
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 600, fontSize: "13px", color: "var(--text-primary)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {item.category}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{
                            fontWeight: 700, fontSize: "14px",
                            color: isOut ? "#b91c1c" : "#92400e",
                          }}>
                            {item.availableQuantity}/{item.totalQuantity}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {isOut ? "OUT OF STOCK" : `${pct}% left`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {lowStockItems.length > 0 && (
                <div
                  onClick={() => navigate("/add-equipment")}
                  style={{
                    padding: "10px 16px", textAlign: "center",
                    fontSize: "13px", fontWeight: 600, color: "var(--primary)",
                    cursor: "pointer", borderTop: "1px solid var(--border)",
                    background: "var(--teal-50)", transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--teal-100)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "var(--teal-50)"}
                >
                  ➕ Add More Equipment
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── AI Section ─────────────────────────────── */}
        <div className="sl-ai-section">
          <div className="sl-ai-header">
            <div className="sl-ai-header__icon">🤖</div>
            <div>
              <h2 className="sl-ai-header__title">AI Lab Insights</h2>
              <p className="sl-ai-header__subtitle">
                Intelligent analysis powered by AI — usage trends &amp; purchase recommendations
              </p>
            </div>
          </div>

          <div className="sl-ai-actions">
            <button className="sl-ai-btn" onClick={getUsageAnalysis} disabled={loadingAnalysis}>
              {loadingAnalysis ? <span className="sl-spinner" /> : "📊"} Usage Analysis
            </button>
            <button className="sl-ai-btn" onClick={getRecommendation} disabled={loadingRecommendation}>
              {loadingRecommendation ? <span className="sl-spinner" /> : "🛒"} Purchase Recommendation
            </button>
          </div>

          {activeAI === "analysis" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, opacity: 0.7, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                📊 Usage Analysis
              </div>
              {loadingAnalysis
                ? <div className="sl-ai-result sl-ai-result--loading"><span className="sl-spinner" /> Analyzing…</div>
                : analysis ? <div className="sl-ai-result">{analysis}</div> : null}
            </div>
          )}

          {activeAI === "recommendation" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, opacity: 0.7, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                🛒 Purchase Recommendation
              </div>
              {loadingRecommendation
                ? <div className="sl-ai-result sl-ai-result--loading"><span className="sl-spinner" /> Generating…</div>
                : recommendation ? <div className="sl-ai-result">{recommendation}</div> : null}
            </div>
          )}

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, opacity: 0.8, marginBottom: "10px" }}>
              💬 Ask AI Assistant
            </div>
            <div className="sl-ai-chat">
              <input
                type="text"
                className="sl-ai-chat-input"
                placeholder="e.g. Which equipment should we restock? Which is used the most?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="sl-ai-btn"
                onClick={askAI}
                disabled={loadingChat || !question.trim()}
                style={{ flexShrink: 0 }}
              >
                {loadingChat ? <span className="sl-spinner" /> : "➤"} Ask AI
              </button>
            </div>
            {activeAI === "chat" && (
              <div style={{ marginTop: "14px" }}>
                {loadingChat
                  ? <div className="sl-ai-result sl-ai-result--loading"><span className="sl-spinner" /> Thinking…</div>
                  : answer ? <div className="sl-ai-result">{answer}</div> : null}
              </div>
            )}
          </div>
        </div>

        {/* ── Email Notification Log ─────────────────── */}
        <div className="sl-card" style={{ marginTop: "28px", padding: 0, overflow: "hidden" }}>

          {/* Card Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 24px", borderBottom: "1px solid var(--border)",
            background: "var(--teal-50)",
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                📧 Overdue Fine Email Log
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Auto-sends ₹500 fine warning to students with overdue equipment · Runs daily at 8:00 AM
              </div>
            </div>
            <button
              className="sl-btn sl-btn--primary sl-btn--sm"
              onClick={triggerEmailCheck}
              disabled={triggerLoading}
              title="Manually trigger overdue email check now"
            >
              {triggerLoading ? <><span className="sl-spinner" /> Checking…</> : "▶ Run Now"}
            </button>
          </div>

          {/* Email log table */}
          {emailLogs.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📭</div>
              No fine warning emails sent yet.<br />
              <span style={{ fontSize: "12px" }}>Emails are sent automatically at 8 AM when overdue borrows are detected.</span>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Email</th>
                    <th>Equipment</th>
                    <th>Borrow ID</th>
                    <th>Email Sent On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map((log, idx) => {
                    const statusMap = {
                      SENT:     { bg: "#d1fae5", color: "#065f46", label: "✅ Sent" },
                      FAILED:   { bg: "#fee2e2", color: "#991b1b", label: "❌ Failed" },
                      NO_EMAIL: { bg: "#fef3c7", color: "#92400e", label: "⚠️ No Email" },
                    };
                    const s = statusMap[log.status] || statusMap["SENT"];
                    return (
                      <tr key={log.id}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 600, color: log.status === "NO_EMAIL" ? "var(--text-muted)" : "var(--text-primary)", fontStyle: log.status === "NO_EMAIL" ? "italic" : "normal" }}>
                          {log.status === "NO_EMAIL" ? "⚠️ " : "✉️ "}{log.studentEmail}
                        </td>
                        <td>{log.equipmentName}</td>
                        <td>
                          <span style={{
                            background: "var(--teal-100)", color: "var(--teal-800)",
                            padding: "2px 10px", borderRadius: "20px",
                            fontSize: "12px", fontWeight: 700,
                          }}>
                            #{log.borrowId}
                          </span>
                        </td>
                        <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                          📅 {log.emailSentDate}
                        </td>
                        <td>
                          <div>
                            <span style={{
                              background: s.bg, color: s.color,
                              padding: "3px 10px", borderRadius: "20px",
                              fontSize: "11px", fontWeight: 700, display: "inline-block",
                            }}>
                              {s.label}
                            </span>
                            {log.failureReason && (
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                title={log.failureReason}>
                                {log.failureReason}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;