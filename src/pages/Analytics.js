import React, { useState, useCallback, useEffect, useRef } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import useAutoRefresh from "../hooks/useAutoRefresh";

// Teal colour ramp — consistent with the site theme
const TEAL = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#ccfbf1"];
const AMBER_BG   = "#fef3c7";
const AMBER_BDR  = "#f59e0b";
const AMBER_TEXT = "#92400e";
const GRID_COLOR = "rgba(13,148,136,0.08)";
const TICK_COLOR = "#6b9e99";
const DARK_TEXT  = "#0d3330";

// ── Mini Chart.js loader ─────────────────────────────────────────────────
let chartJsReady = false;
let chartJsCallbacks = [];

function loadChartJs(cb) {
  if (chartJsReady) { cb(); return; }
  chartJsCallbacks.push(cb);
  if (document.getElementById("chartjs-cdn")) return;
  const s = document.createElement("script");
  s.id  = "chartjs-cdn";
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
  s.onload = () => {
    chartJsReady = true;
    chartJsCallbacks.forEach(fn => fn());
    chartJsCallbacks = [];
  };
  document.head.appendChild(s);
}

// ── Reusable chart canvas ────────────────────────────────────────────────
function ChartCanvas({ id, height = 260 }) {
  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <canvas id={id} />
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, iconBg, valueColor }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #d1faf4",
      borderRadius: "12px", padding: "20px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        width: "44px", height: "44px", borderRadius: "10px",
        background: iconBg || "#ccfbf1",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "20px", marginBottom: "12px",
      }}>{icon}</div>
      <div style={{
        fontSize: "28px", fontWeight: 800,
        color: valueColor || "#115e59", lineHeight: 1, marginBottom: "5px",
      }}>{value}</div>
      <div style={{
        fontSize: "11px", fontWeight: 600, color: "#6b9e99",
        textTransform: "uppercase", letterSpacing: "0.5px",
      }}>{label}</div>
      <div style={{
        position: "absolute", bottom: "-20px", right: "-20px",
        width: "70px", height: "70px",
        background: iconBg || "#ccfbf1",
        borderRadius: "50%", opacity: 0.4,
      }} />
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, fullWidth }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #d1faf4",
      borderRadius: "14px", padding: "20px",
      gridColumn: fullWidth ? "1 / -1" : undefined,
    }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: DARK_TEXT, marginBottom: "2px" }}>
        {title}
      </div>
      <div style={{ fontSize: "12px", color: "#6b9e99", marginBottom: "14px" }}>
        {subtitle}
      </div>
      {children}
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────
function Legend({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
      {items.map((item) => (
        <span key={item.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#6b9e99" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: item.color, border: item.border || "none", display: "inline-block" }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
function Analytics() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const chartsRef = useRef({});

  const fetchData = useCallback(() => {
    API.get("/api/analytics")
      .then((res) => {
        setData(res.data);
        setLastUpdated(new Date());
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  useAutoRefresh(fetchData, 60000);

  // Destroy old charts before re-rendering
  const destroyChart = (id) => {
    if (chartsRef.current[id]) {
      chartsRef.current[id].destroy();
      delete chartsRef.current[id];
    }
  };

  useEffect(() => {
    if (!data) return;
    loadChartJs(() => renderCharts(data));
    return () => {
      ["monthlyChart", "mostChart", "categoryChart", "leastChart"]
        .forEach(destroyChart);
    };
  }, [data]);

  const renderCharts = (d) => {
    const Chart = window.Chart;
    if (!Chart) return;

    const baseScales = {
      x: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR, font: { size: 11 } } },
      y: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR, font: { size: 11 } }, beginAtZero: true },
    };

    // ── Monthly Trend ──────────────────────────────────────────────────
    destroyChart("monthlyChart");
    const mc = document.getElementById("monthlyChart");
    if (mc) {
      chartsRef.current["monthlyChart"] = new Chart(mc, {
        type: "bar",
        data: {
          labels: d.monthlyTrend.map(m => m.month),
          datasets: [
            {
              label: "Borrows",
              data: d.monthlyTrend.map(m => m.borrows),
              backgroundColor: TEAL[0],
              borderRadius: 6,
              barPercentage: 0.5,
            },
            {
              label: "Returns",
              data: d.monthlyTrend.map(m => m.returns),
              backgroundColor: TEAL[3],
              borderRadius: 6,
              barPercentage: 0.5,
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ...baseScales.x, ticks: { ...baseScales.x.ticks, autoSkip: false } },
            y: { ...baseScales.y },
          },
        },
      });
    }

    // ── Most Borrowed ──────────────────────────────────────────────────
    destroyChart("mostChart");
    const mostC = document.getElementById("mostChart");
    if (mostC) {
      chartsRef.current["mostChart"] = new Chart(mostC, {
        type: "bar",
        data: {
          labels: d.mostBorrowed.map(e => e.name),
          datasets: [{
            data: d.mostBorrowed.map(e => e.count),
            backgroundColor: d.mostBorrowed.map((_, i) => TEAL[i % TEAL.length]),
            borderRadius: 6,
            barPercentage: 0.6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: {
            x: { ...baseScales.x, beginAtZero: true },
            y: { grid: { display: false }, ticks: { color: DARK_TEXT, font: { size: 11 } } },
          },
        },
      });
    }

    // ── Category Donut ─────────────────────────────────────────────────
    destroyChart("categoryChart");
    const catC = document.getElementById("categoryChart");
    if (catC) {
      chartsRef.current["categoryChart"] = new Chart(catC, {
        type: "doughnut",
        data: {
          labels: d.categoryUsage.map(c => c.category),
          datasets: [{
            data: d.categoryUsage.map(c => c.count),
            backgroundColor: d.categoryUsage.map((_, i) => TEAL[i % TEAL.length]),
            borderColor: "#fff",
            borderWidth: 3,
            hoverOffset: 6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: "62%",
          plugins: { legend: { display: false } },
        },
      });
    }

    // ── Least Borrowed ─────────────────────────────────────────────────
    destroyChart("leastChart");
    const leastC = document.getElementById("leastChart");
    if (leastC) {
      chartsRef.current["leastChart"] = new Chart(leastC, {
        type: "bar",
        data: {
          labels: d.leastBorrowed.map(e => e.name),
          datasets: [{
            data: d.leastBorrowed.map(e => e.count),
            backgroundColor: AMBER_BG,
            borderColor: AMBER_BDR,
            borderWidth: 1.5,
            borderRadius: 6,
            barPercentage: 0.5,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: {
            x: { ...baseScales.x, beginAtZero: true },
            y: {
              grid: { display: false },
              ticks: { color: AMBER_TEXT, font: { size: 11 } },
            },
          },
        },
      });
    }
  };

  // ── Category legend labels ─────────────────────────────────────────────
  const categoryLegend = data?.categoryUsage
    ? (() => {
        const total = data.categoryUsage.reduce((s, c) => s + c.count, 0);
        return data.categoryUsage.map((c, i) => ({
          color: TEAL[i % TEAL.length],
          label: `${c.category} ${total > 0 ? Math.round((c.count / total) * 100) : 0}%`,
        }));
      })()
    : [];

  // ── Peak month helper ──────────────────────────────────────────────────
  const peakMonth = data?.monthlyTrend
    ? data.monthlyTrend.reduce((best, m) =>
        m.borrows > (best?.borrows || 0) ? m : best, null)
    : null;

  return (
    <div style={{ background: "#f4fffe", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: DARK_TEXT, margin: "0 0 4px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", background: "#ccfbf1", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                📊
              </div>
              Equipment Usage Analytics
            </h1>
            <p style={{ fontSize: "13px", color: "#6b9e99", margin: 0 }}>
              Live data from your database
              {lastUpdated && (
                <span style={{ marginLeft: "8px", fontSize: "11px" }}>
                  · Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchData}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "8px",
              border: "1.5px solid #99f6e4", background: "#fff",
              color: "#0d9488", fontSize: "13px", fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6b9e99" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
            Loading analytics data…
          </div>
        ) : !data ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6b9e99" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📭</div>
            No data available yet. Start by borrowing some equipment.
          </div>
        ) : (
          <>
            {/* ── Summary Cards ──────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <StatCard icon="📦" value={data.summary.totalBorrows}   label="Total Borrows"    iconBg="#ccfbf1" />
              <StatCard icon="✅" value={data.summary.totalReturned}  label="Total Returned"   iconBg="#d1fae5" valueColor="#065f46" />
              <StatCard icon="⏰" value={data.summary.totalOverdue}   label="Overdue"          iconBg="#fee2e2" valueColor={data.summary.totalOverdue > 0 ? "#b91c1c" : "#115e59"} />
              <StatCard icon="🎓" value={data.summary.activeStudents} label="Active Students"  iconBg="#dbeafe" valueColor="#1e40af" />
              <StatCard
                icon="🏆"
                value={data.mostBorrowed[0]?.name?.split(" ")[0] || "—"}
                label="Most Borrowed"
                iconBg="#ccfbf1"
              />
              <StatCard
                icon="📅"
                value={peakMonth ? peakMonth.month.split(" ")[0] : "—"}
                label="Peak Month"
                iconBg="#d1fae5"
                valueColor="#065f46"
              />
            </div>

            {/* ── Charts Grid ────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

              {/* Monthly Trend — full width */}
              <ChartCard
                fullWidth
                title="Monthly borrow trends"
                subtitle="Borrows vs returns per month over the last 6 months"
              >
                <Legend items={[
                  { color: TEAL[0], label: "Borrows" },
                  { color: TEAL[3], label: "Returns" },
                ]} />
                <ChartCanvas id="monthlyChart" height={220} />
              </ChartCard>

              {/* Most Borrowed */}
              <ChartCard
                title="Most borrowed equipment"
                subtitle="Top items ranked by total borrow count"
              >
                <ChartCanvas id="mostChart" height={270} />
              </ChartCard>

              {/* Category Donut */}
              <ChartCard
                title="Usage by category"
                subtitle="Share of borrows per equipment category"
              >
                <Legend items={categoryLegend} />
                <ChartCanvas id="categoryChart" height={220} />
              </ChartCard>

              {/* Least Borrowed — full width */}
              <ChartCard
                fullWidth
                title="Least used equipment"
                subtitle="Items with fewest borrows — review stock levels or usage promotion"
              >
                <ChartCanvas id="leastChart" height={200} />
              </ChartCard>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;