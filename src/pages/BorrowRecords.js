import React, { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function BorrowRecords() {
  const [records, setRecords] = useState([]);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/borrow")
      .then((res) => setRecords(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = {
      BORROWED: "sl-badge--borrowed",
      OVERDUE:  "sl-badge--overdue",
      RETURNED: "sl-badge--returned",
      PARTIAL:  "sl-badge--partial",
    };
    return <span className={`sl-badge ${map[status] || "sl-badge--available"}`}>{status}</span>;
  };

  const filtered = records.filter((r) => {
    const matchSearch =
      r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      r.equipmentName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    ALL:      records.length,
    BORROWED: records.filter((r) => r.status === "BORROWED").length,
    OVERDUE:  records.filter((r) => r.status === "OVERDUE").length,
    RETURNED: records.filter((r) => r.status === "RETURNED").length,
    PARTIAL:  records.filter((r) => r.status === "PARTIAL").length,
  };

  const filterTabs = [
    { key: "ALL",      label: "All",      dot: "#64748b" },
    { key: "BORROWED", label: "Borrowed", dot: "#f59e0b" },
    { key: "OVERDUE",  label: "Overdue",  dot: "#ef4444" },
    { key: "RETURNED", label: "Returned", dot: "#10b981" },
    { key: "PARTIAL",  label: "Partial",  dot: "#3b82f6" },
  ];

  return (
    <div className="sl-page">
      <Navbar />
      <div className="sl-content">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div className="sl-page-header" style={{ marginBottom: 0 }}>
            <h1 className="sl-page-header__title">
              <div className="sl-page-header__title-icon">📋</div>
              Borrow Records
            </h1>
            <p className="sl-page-header__subtitle">{records.length} total records</p>
          </div>
          <div className="sl-search-wrap">
            <span className="sl-search-icon">🔍</span>
            <input
              type="text"
              className="sl-search"
              placeholder="Search student or equipment…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {filterTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              style={{
                padding: "7px 16px",
                borderRadius: "20px",
                border: filter === t.key ? "2px solid var(--primary)" : "1.5px solid var(--border-mid)",
                background: filter === t.key ? "var(--primary)" : "var(--bg-card)",
                color: filter === t.key ? "#fff" : "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.dot, display: "inline-block" }} />
              {t.label}
              <span style={{
                background: filter === t.key ? "rgba(255,255,255,0.25)" : "var(--teal-100)",
                color: filter === t.key ? "#fff" : "var(--teal-800)",
                padding: "0 7px", borderRadius: "10px", fontSize: "11px",
              }}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="sl-card" style={{ padding: 0 }}>
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Equipment</th>
                  <th>Borrowed Qty</th>
                  <th>Returned Qty</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="sl-table-empty">
                      <span className="sl-spinner sl-spinner--teal" style={{ verticalAlign: "middle", marginRight: "8px" }} />
                      Loading records…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="sl-table-empty">
                      📭 No borrow records found
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--teal-100)", color: "var(--teal-700)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                            {b.studentName?.charAt(0).toUpperCase()}
                          </div>
                          {b.studentName}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{b.equipmentName}</td>
                      <td>{b.quantity}</td>
                      <td>{b.returnedQuantity ?? "—"}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{b.borrowDate}</td>
                      <td style={{ color: b.status === "OVERDUE" ? "#b91c1c" : "var(--text-muted)", fontSize: "13px", fontWeight: b.status === "OVERDUE" ? 600 : 400 }}>
                        {b.dueDate}
                      </td>
                      <td>{statusBadge(b.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BorrowRecords;
