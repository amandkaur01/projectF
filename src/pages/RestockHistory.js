import React, { useState, useCallback } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import useAutoRefresh from "../hooks/useAutoRefresh";

function RestockHistory() {
  const [records,     setRecords]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRecords = useCallback(() => {
    API.get("/restock")
      .then((res) => {
        setRecords(res.data);
        setLastUpdated(new Date());
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  useAutoRefresh(fetchRecords, 30000);

  const filtered = records.filter((r) =>
    r.equipmentName?.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats
  const totalRestocks = records.length;
  const totalAdded    = records.reduce((sum, r) => sum + r.quantityAdded, 0);
  const uniqueItems   = new Set(records.map((r) => r.equipmentName)).size;
  const avgDays       = (() => {
    const withAlert = records.filter((r) => r.daysTaken !== null && r.daysTaken !== undefined);
    if (withAlert.length === 0) return null;
    return Math.round(withAlert.reduce((s, r) => s + r.daysTaken, 0) / withAlert.length);
  })();

  // Alert type badge
  const alertBadge = (alertType) => {
    if (!alertType) return <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>;
    const isOut = alertType === "OUT_OF_STOCK";
    return (
      <span style={{
        background: isOut ? "#fee2e2" : "#fef3c7",
        color:      isOut ? "#991b1b" : "#92400e",
        padding: "3px 10px", borderRadius: "20px",
        fontSize: "11px", fontWeight: 700,
      }}>
        {isOut ? "⛔ Out of Stock" : "⚠️ Low Stock"}
      </span>
    );
  };

  // Days taken badge
  const daysBadge = (days) => {
    if (days === null || days === undefined)
      return <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>No alert</span>;
    if (days === 0)
      return <span style={{ background: "#d1fae5", color: "#065f46", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>Same day ✅</span>;
    const color = days <= 3  ? { bg: "#d1fae5", text: "#065f46" }
                : days <= 7  ? { bg: "#fef3c7", text: "#92400e" }
                :              { bg: "#fee2e2", text: "#991b1b" };
    return (
      <span style={{
        background: color.bg, color: color.text,
        padding: "3px 10px", borderRadius: "20px",
        fontSize: "12px", fontWeight: 700,
      }}>
        {days} day{days !== 1 ? "s" : ""}
      </span>
    );
  };

  return (
    <div className="sl-page">
      <Navbar />
      <div className="sl-content">

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", flexWrap: "wrap",
          gap: "16px", marginBottom: "28px",
        }}>
          <div className="sl-page-header" style={{ marginBottom: 0 }}>
            <h1 className="sl-page-header__title">
              <div className="sl-page-header__title-icon">📦</div>
              Restock History
            </h1>
            <p className="sl-page-header__subtitle">
              Complete log of all equipment restocking events
              {lastUpdated && (
                <span style={{ marginLeft: "10px", fontSize: "11px", color: "var(--text-muted)" }}>
                  · Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button className="sl-btn sl-btn--ghost sl-btn--sm" onClick={fetchRecords}>
              🔄 Refresh
            </button>
            <div className="sl-search-wrap">
              <span className="sl-search-icon">🔍</span>
              <input
                type="text"
                className="sl-search"
                placeholder="Search equipment or category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && records.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px", marginBottom: "28px",
          }}>
            {[
              { label: "Total Restock Events", value: totalRestocks, icon: "📋", bg: "var(--teal-100)", text: "var(--teal-800)" },
              { label: "Units Added in Total",  value: totalAdded,   icon: "➕", bg: "#dbeafe",         text: "#1e3a8a" },
              { label: "Equipment Restocked",   value: uniqueItems,  icon: "🔧", bg: "#d1fae5",         text: "#065f46" },
              ...(avgDays !== null ? [{
                label: "Avg. Days to Restock", value: `${avgDays}d`,
                icon: "⏱️", bg: avgDays <= 3 ? "#d1fae5" : avgDays <= 7 ? "#fef3c7" : "#fee2e2",
                text: avgDays <= 3 ? "#065f46" : avgDays <= 7 ? "#92400e" : "#991b1b",
              }] : []),
            ].map((s) => (
              <div key={s.label} style={{
                background: "#fff", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "20px",
                display: "flex", alignItems: "center", gap: "14px",
                boxShadow: "var(--shadow-card)",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "var(--radius-md)",
                  background: s.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "20px", flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: s.text, lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500, marginTop: "4px" }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="sl-card" style={{ padding: 0 }}>
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Equipment Name</th>
                  <th>Category</th>
                  <th>Units Added</th>
                  <th>Stock Before → After</th>
                  <th>Alert Raised On</th>
                  <th>Alert Type</th>
                  <th>Restock Date</th>
                  <th>Days Taken</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="sl-table-empty">
                      <span className="sl-spinner sl-spinner--teal"
                        style={{ verticalAlign: "middle", marginRight: "8px" }} />
                      Loading restock history…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="sl-table-empty">
                      {records.length === 0
                        ? "📭 No restock records yet. History is logged when you restock existing equipment."
                        : `🔍 No records found matching "${search}"`}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => (
                    <tr key={r.id}>
                      <td>{idx + 1}</td>

                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {r.equipmentName}
                      </td>

                      <td>
                        <span style={{
                          background: "var(--teal-100)", color: "var(--teal-800)",
                          padding: "3px 10px", borderRadius: "20px",
                          fontSize: "12px", fontWeight: 600,
                        }}>
                          {r.category}
                        </span>
                      </td>

                      {/* Units added */}
                      <td>
                        <span style={{
                          background: "#d1fae5", color: "#065f46",
                          padding: "4px 12px", borderRadius: "20px",
                          fontSize: "13px", fontWeight: 700,
                        }}>
                          +{r.quantityAdded}
                        </span>
                      </td>

                      {/* Stock before → after */}
                      <td>
                        <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                          {r.stockBefore}
                        </span>
                        <span style={{ margin: "0 6px", color: "var(--text-muted)" }}>→</span>
                        <span style={{ fontWeight: 700, color: "var(--primary-dark)", fontSize: "13px" }}>
                          {r.stockAfter}
                        </span>
                      </td>

                      {/* Alert date — when the warning was first raised */}
                      <td>
                        {r.alertDate ? (
                          <div style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            background: "#fef3c7", color: "#92400e",
                            padding: "4px 10px", borderRadius: "20px",
                            fontSize: "12px", fontWeight: 600,
                          }}>
                            🔔 {r.alertDate}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>No alert</span>
                        )}
                      </td>

                      {/* Alert type */}
                      <td>{alertBadge(r.alertType)}</td>

                      {/* Restock date */}
                      <td>
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          background: "var(--teal-50)", color: "var(--teal-800)",
                          padding: "4px 10px", borderRadius: "20px",
                          fontSize: "12px", fontWeight: 600,
                        }}>
                          📅 {r.restockDate}
                        </div>
                      </td>

                      {/* Days taken — colour-coded green/amber/red */}
                      <td>{daysBadge(r.daysTaken)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop: "14px", fontSize: "12px", color: "var(--text-muted)", display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <span>🟢 Days Taken ≤ 3 — Excellent response</span>
          <span>🟡 4–7 days — Acceptable</span>
          <span>🔴 8+ days — Needs improvement</span>
        </div>

      </div>
    </div>
  );
}

export default RestockHistory;