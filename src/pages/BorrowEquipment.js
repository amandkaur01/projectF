import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function BorrowEquipment() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [borrow, setBorrow] = useState({ studentName: "", equipmentName: "", quantity: "" });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    API.get("/equipment")
      .then((res) => setEquipmentList(res.data))
      .catch((err) => console.log(err));

    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setBorrow((prev) => ({ ...prev, studentName: user.name.trim().toLowerCase() }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBorrow({ ...borrow, [name]: value });
    if (name === "equipmentName") {
      setSelected(equipmentList.find((eq) => eq.name === value) || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await API.post("/borrow", borrow);
      setSuccess(true);
      setBorrow((prev) => ({ ...prev, equipmentName: "", quantity: "" }));
      setSelected(null);
      setTimeout(() => navigate("/student"), 1800);
    } catch {
      setError("Borrow failed. Item may be out of stock or unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const available = equipmentList.filter((e) => e.availableQuantity > 0);

  return (
    <div className="sl-page">
      <Navbar />
      <div className="sl-content" style={{ maxWidth: "620px" }}>

        <div className="sl-page-header">
          <h1 className="sl-page-header__title">
            <div className="sl-page-header__title-icon">📤</div>
            Borrow Equipment
          </h1>
          <p className="sl-page-header__subtitle">
            Select an item from the lab inventory to borrow
          </p>
        </div>

        <div className="sl-card">
          <form onSubmit={handleSubmit}>

            <div className="sl-form-group">
              <label className="sl-label">Student Name</label>
              <input
                name="studentName"
                className="sl-input sl-input--readonly"
                value={borrow.studentName}
                readOnly
              />
            </div>

            <div className="sl-form-group">
              <label className="sl-label">Select Equipment *</label>
              <select
                name="equipmentName"
                className="sl-select"
                value={borrow.equipmentName}
                onChange={handleChange}
                required
              >
                <option value="">— Choose equipment —</option>
                {available.map((e) => (
                  <option key={e.id} value={e.name}>
                    {e.name} ({e.availableQuantity} available)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected item info card */}
            {selected && (
              <div style={{ background: "var(--teal-50)", border: "1px solid var(--border-mid)", borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: "16px", fontSize: "13px", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>📦 Category: <strong>{selected.category}</strong></span>
                  <span>📍 Location: <strong>{selected.location}</strong></span>
                  <span>✅ Available: <strong style={{ color: "var(--primary-dark)" }}>{selected.availableQuantity}</strong></span>
                </div>
              </div>
            )}

            <div className="sl-form-group">
              <label className="sl-label">Quantity *</label>
              <input
                name="quantity"
                type="number"
                min="1"
                max={selected?.availableQuantity || undefined}
                className="sl-input"
                placeholder="How many do you need?"
                value={borrow.quantity}
                onChange={handleChange}
                required
              />
            </div>

            {success && (
              <div className="sl-toast sl-toast--success">
                ✅ Equipment borrowed successfully! Redirecting…
              </div>
            )}
            {error && (
              <div className="sl-toast sl-toast--error">
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button type="submit" className="sl-btn sl-btn--primary" disabled={loading}>
                {loading ? <><span className="sl-spinner" /> Borrowing…</> : "📤 Borrow Equipment"}
              </button>
              <button type="button" className="sl-btn sl-btn--ghost" onClick={() => navigate("/student")}>
                Cancel
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default BorrowEquipment;
