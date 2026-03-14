import React, { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function EquipmentList() {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    API.get("/equipment")
      .then((res) => setEquipment(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const getAvailabilityBadge = (available, total) => {
    const ratio = total > 0 ? available / total : 0;
    if (available === 0)   return <span className="sl-badge sl-badge--overdue">Out of Stock</span>;
    if (ratio < 0.3)       return <span className="sl-badge sl-badge--borrowed">Low Stock</span>;
    return                        <span className="sl-badge sl-badge--available">Available</span>;
  };

  return (
    <div className="sl-page">
      <Navbar />
      <div className="sl-content">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
          <div className="sl-page-header" style={{ marginBottom: 0 }}>
            <h1 className="sl-page-header__title">
              <div className="sl-page-header__title-icon">🔧</div>
              Equipment List
            </h1>
            <p className="sl-page-header__subtitle">
              {equipment.length} items in inventory
            </p>
          </div>

          {/* Search */}
          <div className="sl-search-wrap">
            <span className="sl-search-icon">🔍</span>
            <input
              type="text"
              className="sl-search"
              placeholder="Search by name or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="sl-card" style={{ padding: 0 }}>
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Equipment Name</th>
                  <th>Category</th>
                  <th>Total Qty</th>
                  <th>Available</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="sl-table-empty">
                      <span className="sl-spinner sl-spinner--teal" style={{ verticalAlign: "middle", marginRight: "8px" }} />
                      Loading equipment…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="sl-table-empty">
                      🔍 No equipment found matching "{search}"
                    </td>
                  </tr>
                ) : (
                  filtered.map((e, idx) => (
                    <tr key={e.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{e.name}</td>
                      <td>
                        <span style={{ background: "var(--teal-100)", color: "var(--teal-800)", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                          {e.category}
                        </span>
                      </td>
                      <td>{e.totalQuantity}</td>
                      <td style={{ fontWeight: 700, color: e.availableQuantity === 0 ? "#b91c1c" : "var(--primary-dark)" }}>
                        {e.availableQuantity}
                      </td>
                      <td>{e.location}</td>
                      <td>{getAvailabilityBadge(e.availableQuantity, e.totalQuantity)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {!loading && equipment.length > 0 && (
          <div style={{ marginTop: "16px", fontSize: "13px", color: "var(--text-muted)", display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <span>📦 Total Items: <strong>{equipment.length}</strong></span>
            <span>✅ In Stock: <strong>{equipment.filter(e => e.availableQuantity > 0).length}</strong></span>
            <span>❌ Out of Stock: <strong>{equipment.filter(e => e.availableQuantity === 0).length}</strong></span>
          </div>
        )}

      </div>
    </div>
  );
}

export default EquipmentList;
