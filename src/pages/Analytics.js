import React, { useState, useCallback, useEffect, useRef } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import useAutoRefresh from "../hooks/useAutoRefresh";

const TEAL = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#ccfbf1"];
const AMBER_BG = "#fef3c7";
const AMBER_BDR = "#f59e0b";
const AMBER_TEXT = "#92400e";
const GRID_COLOR = "rgba(13,148,136,0.08)";
const TICK_COLOR = "#6b9e99";
const DARK_TEXT = "#0d3330";

let chartJsReady = false;
let chartJsCallbacks = [];

function loadChartJs(cb) {
  if (chartJsReady) {
    cb();
    return;
  }
  chartJsCallbacks.push(cb);
  if (document.getElementById("chartjs-cdn")) return;

  const s = document.createElement("script");
  s.id = "chartjs-cdn";
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
  s.onload = () => {
    chartJsReady = true;
    chartJsCallbacks.forEach((fn) => fn());
    chartJsCallbacks = [];
  };
  document.head.appendChild(s);
}

function ChartCanvas({ id, height = 260 }) {
  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <canvas id={id} />
    </div>
  );
}

function StatCard({ icon, value, label, iconBg, valueColor }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #d1faf4",
        borderRadius: "12px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          background: iconBg || "#ccfbf1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: valueColor || "#115e59",
          lineHeight: 1,
          marginBottom: "5px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#6b9e99",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, fullWidth }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #d1faf4",
        borderRadius: "14px",
        padding: "20px",
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: DARK_TEXT,
          marginBottom: "2px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#6b9e99",
          marginBottom: "14px",
        }}
      >
        {subtitle}
      </div>

      {children}
    </div>
  );
}

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartsRef = useRef({});

  const fetchData = useCallback(() => {
    API.get("/api/analytics")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  useAutoRefresh(fetchData, 60000);

  const destroyChart = (id) => {
    if (chartsRef.current[id]) {
      chartsRef.current[id].destroy();
      delete chartsRef.current[id];
    }
  };

  const renderCharts = useCallback((d) => {
    const Chart = window.Chart;
    if (!Chart) return;

    const baseScales = {
      x: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR } },
      y: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR }, beginAtZero: true },
    };

    destroyChart("monthlyChart");

    const mc = document.getElementById("monthlyChart");

    if (mc) {
      chartsRef.current["monthlyChart"] = new Chart(mc, {
        type: "bar",
        data: {
          labels: d.monthlyTrend.map((m) => m.month),
          datasets: [
            {
              label: "Borrows",
              data: d.monthlyTrend.map((m) => m.borrows),
              backgroundColor: TEAL[0],
            },
            {
              label: "Returns",
              data: d.monthlyTrend.map((m) => m.returns),
              backgroundColor: TEAL[3],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: baseScales,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!data) return;

    loadChartJs(() => renderCharts(data));

    return () => {
      ["monthlyChart", "mostChart", "categoryChart", "leastChart"].forEach(
        destroyChart
      );
    };
  }, [data, renderCharts]);

  return (
    <div style={{ background: "#f4fffe", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 800,
            color: DARK_TEXT,
            marginBottom: "20px",
          }}
        >
          Equipment Usage Analytics
        </h1>

        {loading ? (
          <p>Loading analytics...</p>
        ) : (
          <>
            <ChartCard
              title="Monthly Borrow Trends"
              subtitle="Borrows vs Returns"
              fullWidth
            >
              <ChartCanvas id="monthlyChart" height={250} />
            </ChartCard>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;