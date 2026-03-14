import React, { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function StudentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      API.get(`/borrow/student/${user.name.trim().toLowerCase()}`)
        .then((res) => setHistory(res.data))
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    }
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

  const counts = {
    active:   history.filter((r) => r.status === "BORROWED" || r.status === "PARTIAL").length,
    overdue:  history.filter((r) => r.status === "OVERDUE").length,
    returned: history.filter((r) => r.status === "RETURNED").length,
  };

  return (
    <div className="sl-page">
      <Navbar />
      <div className="sl-content">

        <div className="sl-page-header">
          <h1 className="sl-page-header__title">
            <div className="sl-page-header__title-icon">📋</div>
            My Borrow History
          </h1>
          <p className="sl-page-header__subtitle">
            Track all your equipment borrowing records
          </p>
        </div>

        {/* Quick Stats */}
        {!loading && history.length > 0 && (
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px" }}>
            {[
              { label: "Active Borrows", value: counts.active,   color: "#fef3c7", text: "#92400e" },
              { label: "Overdue",        value: counts.overdue,  color: "#fee2e2", text: "#991b1b" },
              { label: "Returned",       value: counts.returned, color: "#d1fae5", text: "#065f46" },
            ].map((s) => (
              <div key={s.label} style={{ background: s.color, borderRadius: "var(--radius-md)", padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "22px", fontWeight: 800, color: s.text }}>{s.value}</span>
                <span style={{ fontSize: "13px", color: s.text, fontWeight: 600 }}>{s.label}</span>
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
                  <th>ID</th>
                  <th>Equipment</th>
                  <th>Qty Borrowed</th>
                  <th>Qty Returned</th>
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
                      Loading your history…
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="sl-table-empty">
                      📭 You haven't borrowed any equipment yet
                    </td>
                  </tr>
                ) : (
                  history.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <span style={{ background: "var(--teal-100)", color: "var(--teal-800)", padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                          #{b.id}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{b.equipmentName}</td>
                      <td>{b.quantity}</td>
                      <td>{b.returnedQuantity ?? "—"}</td>
                      <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>{b.borrowDate}</td>
                      <td style={{ fontSize: "13px", color: b.status === "OVERDUE" ? "#b91c1c" : "var(--text-muted)", fontWeight: b.status === "OVERDUE" ? 600 : 400 }}>
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

export default StudentHistory;
