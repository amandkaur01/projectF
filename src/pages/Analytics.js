import React, { useState, useCallback, useEffect, useRef } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import useAutoRefresh from "../hooks/useAutoRefresh";

const TEAL  = ["#0d9488","#14b8a6","#2dd4bf","#5eead4","#99f6e4","#ccfbf1"];
const GRID  = "rgba(13,148,136,0.08)";
const TICK  = "#6b9e99";
const DARK  = "#0d3330";

// ── Load Chart.js once ───────────────────────────────────────────────────
let cjsReady = false, cjsCbs = [];
function loadChartJs(cb) {
  if (cjsReady) { cb(); return; }
  cjsCbs.push(cb);
  if (document.getElementById("cjs")) return;
  const s = document.createElement("script");
  s.id = "cjs";
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
  s.onload = () => { cjsReady = true; cjsCbs.forEach(f => f()); cjsCbs = []; };
  document.head.appendChild(s);
}

// ── Stat Card ────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, iconBg, valueColor, small }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #d1faf4",
      borderRadius: "12px", padding: "18px 16px",
      position: "relative", overflow: "hidden", minWidth: 0,
    }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "10px",
        background: iconBg || "#ccfbf1",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "18px", marginBottom: "10px", flexShrink: 0,
      }}>{icon}</div>
      <div style={{
        fontSize: small ? "18px" : "26px",
        fontWeight: 800,
        color: valueColor || "#115e59",
        lineHeight: 1.1,
        marginBottom: "5px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
      }}>{value}</div>
      <div style={{
        fontSize: "10px", fontWeight: 600, color: "#6b9e99",
        textTransform: "uppercase", letterSpacing: "0.5px",
      }}>{label}</div>
      <div style={{
        position: "absolute", bottom: "-18px", right: "-18px",
        width: "60px", height: "60px",
        background: iconBg || "#ccfbf1",
        borderRadius: "50%", opacity: 0.35,
      }} />
    </div>
  );
}

// ── Chart Card ───────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, legend, children, fullWidth }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #d1faf4",
      borderRadius: "14px", padding: "20px",
      gridColumn: fullWidth ? "1 / -1" : undefined,
    }}>
      <div style={{ fontSize: "15px", fontWeight: 700, color: DARK, marginBottom: "2px" }}>
        {title}
      </div>
      <div style={{ fontSize: "12px", color: "#6b9e99", marginBottom: legend ? "10px" : "16px" }}>
        {subtitle}
      </div>
      {legend && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
          {legend.map(l => (
            <span key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#6b9e99" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: l.color, display: "inline-block" }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────
function Analytics() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const charts = useRef({});

  const fetchData = useCallback(() => {
    API.get("/api/analytics")
      .then(res => { setData(res.data); setLastUpdated(new Date()); })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  useAutoRefresh(fetchData, 60000);

  const destroy = id => {
    if (charts.current[id]) { charts.current[id].destroy(); delete charts.current[id]; }
  };

  useEffect(() => {
    if (!data) return;
    loadChartJs(() => draw(data));
    return () => ["monthly","most","category","least"].forEach(destroy);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const draw = d => {
    const C = window.Chart;
    if (!C) return;
    const base = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    };
    const xScale = { grid: { color: GRID }, ticks: { color: TICK, font: { size: 11 } } };
    const yScale = { grid: { color: GRID }, ticks: { color: TICK, font: { size: 11 } }, beginAtZero: true };

    // Monthly
    destroy("monthly");
    const mc = document.getElementById("monthly");
    if (mc) charts.current["monthly"] = new C(mc, {
      type: "bar",
      data: {
        labels: d.monthlyTrend.map(m => m.month),
        datasets: [
          { label: "Borrows", data: d.monthlyTrend.map(m => m.borrows), backgroundColor: TEAL[0], borderRadius: 6, barPercentage: 0.5 },
          { label: "Returns", data: d.monthlyTrend.map(m => m.returns), backgroundColor: TEAL[3], borderRadius: 6, barPercentage: 0.5 },
        ],
      },
      options: { ...base, scales: { x: { ...xScale, ticks: { ...xScale.ticks, autoSkip: false } }, y: yScale } },
    });

    // Most borrowed
    destroy("most");
    const mostEl = document.getElementById("most");
    if (mostEl) charts.current["most"] = new C(mostEl, {
      type: "bar",
      data: {
        labels: d.mostBorrowed.map(e => e.name),
        datasets: [{ data: d.mostBorrowed.map(e => e.count), backgroundColor: d.mostBorrowed.map((_, i) => TEAL[i % TEAL.length]), borderRadius: 6, barPercentage: 0.6 }],
      },
      options: { ...base, indexAxis: "y", scales: { x: { ...xScale, beginAtZero: true }, y: { grid: { display: false }, ticks: { color: DARK, font: { size: 11 } } } } },
    });

    // Category donut
    destroy("category");
    const catEl = document.getElementById("category");
    if (catEl) charts.current["category"] = new C(catEl, {
      type: "doughnut",
      data: {
        labels: d.categoryUsage.map(c => c.category),
        datasets: [{ data: d.categoryUsage.map(c => c.count), backgroundColor: d.categoryUsage.map((_, i) => TEAL[i % TEAL.length]), borderColor: "#fff", borderWidth: 3, hoverOffset: 6 }],
      },
      options: { ...base, cutout: "62%" },
    });

    // Least borrowed
    destroy("least");
    const leastEl = document.getElementById("least");
    if (leastEl) charts.current["least"] = new C(leastEl, {
      type: "bar",
      data: {
        labels: d.leastBorrowed.map(e => e.name),
        datasets: [{ data: d.leastBorrowed.map(e => e.count), backgroundColor: "#fef3c7", borderColor: "#f59e0b", borderWidth: 1.5, borderRadius: 6, barPercentage: 0.5 }],
      },
      options: { ...base, indexAxis: "y", scales: { x: { ...xScale, beginAtZero: true }, y: { grid: { display: false }, ticks: { color: "#92400e", font: { size: 11 } } } } },
    });
  };

  const catLegend = data?.categoryUsage
    ? (() => {
        const total = data.categoryUsage.reduce((s, c) => s + c.count, 0);
        return data.categoryUsage.map((c, i) => ({
          color: TEAL[i % TEAL.length],
          label: `${c.category} ${total > 0 ? Math.round((c.count / total) * 100) : 0}%`,
        }));
      })()
    : [];

  const peakMonth = data?.monthlyTrend
    ? data.monthlyTrend.reduce((best, m) => m.borrows > (best?.borrows || 0) ? m : best, null)
    : null;

  const mostName  = data?.mostBorrowed?.[0]?.name  || "—";

  return (
    <div style={{ background: "#f4fffe", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: DARK, margin: "0 0 4px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "40px", height: "40px", background: "#ccfbf1", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📊</div>
              Equipment Usage Analytics
            </h1>
            <p style={{ fontSize: "13px", color: "#6b9e99", margin: 0 }}>
              Borrow trends, usage patterns and category breakdown — all from live database data
              {lastUpdated && <span style={{ marginLeft: "8px", fontSize: "11px" }}>· Updated {lastUpdated.toLocaleTimeString()}</span>}
            </p>
          </div>
          <button onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #99f6e4", background: "#fff", color: "#0d9488", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6b9e99" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>Loading analytics…
          </div>
        ) : !data ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6b9e99" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📭</div>No data yet.
          </div>
        ) : (
          <>
            {/* ── Summary Cards ────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "20px" }}>
              <StatCard icon="📦" value={data.summary.totalBorrows}   label="Total Borrows"   iconBg="#ccfbf1" />
              <StatCard icon="✅" value={data.summary.totalReturned}  label="Total Returned"  iconBg="#d1fae5" valueColor="#065f46" />
              <StatCard icon="⏰" value={data.summary.totalOverdue}   label="Overdue"         iconBg="#fee2e2" valueColor={data.summary.totalOverdue > 0 ? "#b91c1c" : "#115e59"} />
              <StatCard icon="🎓" value={data.summary.activeStudents} label="Active Students" iconBg="#dbeafe" valueColor="#1e40af" />
              <StatCard icon="🏆" value={mostName}  label="Most Borrowed" iconBg="#ccfbf1" small={mostName.length > 8} />
              <StatCard icon="📅" value={peakMonth ? peakMonth.month : "—"} label="Peak Month" iconBg="#d1fae5" valueColor="#065f46" small />
            </div>

            {/* ── Charts Grid ──────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

              {/* Monthly trend — full width */}
              <ChartCard fullWidth
                title="Monthly borrow trends"
                subtitle="Total equipment borrowed per month across all categories"
                legend={[{ color: TEAL[0], label: "Borrows" }, { color: TEAL[3], label: "Returns" }]}
              >
                <div style={{ position: "relative", width: "100%", height: "220px" }}>
                  <canvas id="monthly" />
                </div>
              </ChartCard>

              {/* Most borrowed */}
              <ChartCard title="Most borrowed equipment" subtitle="Top items by total borrow count">
                <div style={{ position: "relative", width: "100%", height: "260px" }}>
                  <canvas id="most" />
                </div>
              </ChartCard>

              {/* Category donut */}
              <ChartCard title="Usage by category" subtitle="Share of borrows per equipment category" legend={catLegend}>
                <div style={{ position: "relative", width: "100%", height: "220px" }}>
                  <canvas id="category" />
                </div>
              </ChartCard>

              {/* Least borrowed — full width */}
              <ChartCard fullWidth
                title="Least used equipment"
                subtitle="Items with fewest borrows — candidates for stock review"
              >
                <div style={{ position: "relative", width: "100%", height: "200px" }}>
                  <canvas id="least" />
                </div>
              </ChartCard>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;