import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import axios from "axios";
import Navbar from "../components/Navbar";

const AI_BASE = "http://localhost:8080/api/ai";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Backend now sends: totalEquipment, borrowed, overdue, available
  const [stats, setStats] = useState({
    totalEquipment: 0,
    borrowed: 0,
    overdue: 0,
    available: 0,
  });

  const [analysis,       setAnalysis]       = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [question,       setQuestion]       = useState("");
  const [answer,         setAnswer]         = useState("");

  const [loadingAnalysis,       setLoadingAnalysis]       = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [loadingChat,           setLoadingChat]           = useState(false);
  const [activeAI,              setActiveAI]              = useState(null);

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, []);

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

  const actions = [
    { label: "View Equipment", icon: "🔧", path: "/equipment" },
    { label: "Add Equipment",  icon: "➕", path: "/add-equipment" },
    { label: "Borrow Records", icon: "📋", path: "/borrow-records" },
    { label: "Borrow Item",    icon: "🔄", path: "/borrow" },
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
          </p>
        </div>

        {/* ── Stat Cards ──────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}>

          {/* Total Units in inventory */}
          <div className="sl-stat-card">
            <div className="sl-stat-card__icon sl-stat-card__icon--teal">🔧</div>
            <div className="sl-stat-card__value">{stats.totalEquipment}</div>
            <div className="sl-stat-card__label">Total Units</div>
            <div className="sl-stat-card__glow" />
          </div>

          {/* Units currently borrowed (outstanding) */}
          <div className="sl-stat-card">
            <div className="sl-stat-card__icon sl-stat-card__icon--blue">📤</div>
            <div className="sl-stat-card__value">{stats.borrowed}</div>
            <div className="sl-stat-card__label">Units Borrowed</div>
            <div className="sl-stat-card__glow" />
          </div>

          {/* Overdue units — pulled directly from backend */}
          <div className="sl-stat-card">
            <div className="sl-stat-card__icon sl-stat-card__icon--red">⏰</div>
            <div
              className="sl-stat-card__value"
              style={{ color: stats.overdue > 0 ? "#b91c1c" : undefined }}
            >
              {stats.overdue}
            </div>
            <div className="sl-stat-card__label">Overdue Units</div>
            <div className="sl-stat-card__glow" />
          </div>

          {/* Available units — sum of availableQuantity from backend */}
          <div className="sl-stat-card">
            <div className="sl-stat-card__icon sl-stat-card__icon--amber">✅</div>
            <div className="sl-stat-card__value">{stats.available}</div>
            <div className="sl-stat-card__label">Available Now</div>
            <div className="sl-stat-card__glow" />
          </div>

        </div>

        {/* ── Quick Actions ───────────────────────────── */}
        <h2 className="sl-section-title">Quick Actions</h2>
        <div className="sl-action-grid" style={{ marginBottom: "36px" }}>
          {actions.map((a) => (
            <div key={a.path} className="sl-action-card" onClick={() => navigate(a.path)}>
              <div className="sl-action-card__icon">{a.icon}</div>
              <div className="sl-action-card__label">{a.label}</div>
            </div>
          ))}
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

          {/* Buttons */}
          <div className="sl-ai-actions">
            <button className="sl-ai-btn" onClick={getUsageAnalysis} disabled={loadingAnalysis}>
              {loadingAnalysis ? <span className="sl-spinner" /> : "📊"}
              Usage Analysis
            </button>
            <button className="sl-ai-btn" onClick={getRecommendation} disabled={loadingRecommendation}>
              {loadingRecommendation ? <span className="sl-spinner" /> : "🛒"}
              Purchase Recommendation
            </button>
          </div>

          {/* Analysis result */}
          {activeAI === "analysis" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, opacity: 0.7, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                📊 Usage Analysis
              </div>
              {loadingAnalysis ? (
                <div className="sl-ai-result sl-ai-result--loading">
                  <span className="sl-spinner" /> Analyzing equipment usage data…
                </div>
              ) : analysis ? (
                <div className="sl-ai-result">{analysis}</div>
              ) : null}
            </div>
          )}

          {/* Recommendation result */}
          {activeAI === "recommendation" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, opacity: 0.7, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                🛒 Purchase Recommendation
              </div>
              {loadingRecommendation ? (
                <div className="sl-ai-result sl-ai-result--loading">
                  <span className="sl-spinner" /> Generating recommendations…
                </div>
              ) : recommendation ? (
                <div className="sl-ai-result">{recommendation}</div>
              ) : null}
            </div>
          )}

          {/* Chat */}
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
                {loadingChat ? <span className="sl-spinner" /> : "➤"}
                Ask AI
              </button>
            </div>
            {activeAI === "chat" && (
              <div style={{ marginTop: "14px" }}>
                {loadingChat ? (
                  <div className="sl-ai-result sl-ai-result--loading">
                    <span className="sl-spinner" /> Thinking…
                  </div>
                ) : answer ? (
                  <div className="sl-ai-result">{answer}</div>
                ) : null}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;