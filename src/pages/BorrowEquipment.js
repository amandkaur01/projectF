import React, { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useAutoRefresh from "../hooks/useAutoRefresh";

function BorrowEquipment() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [borrow,   setBorrow]   = useState({ studentName: "", equipmentName: "", quantity: "" });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");
  const [selected, setSelected] = useState(null);

  const fetchEquipment = useCallback(() => {
    API.get("/equipment")
      .then((res) => setEquipmentList(res.data))
      .catch((err) => console.log(err));
  }, []);

  useAutoRefresh(fetchEquipment, 60000);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setBorrow((prev) => ({ ...prev, studentName: user.name.trim().toLowerCase() }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBorrow({ ...borrow, [name]: value });
    setError("");
    setSuccess("");
    if (name === "equipmentName") {
      // Re-fetch latest equipment data to get accurate available qty
      const found = equipmentList.find((eq) => eq.name === value) || null;
      setSelected(found);
      setBorrow((prev) => ({ ...prev, equipmentName: value, quantity: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const qty = parseInt(borrow.quantity);

    // Client-side check before hitting backend
    if (selected && qty > selected.availableQuantity) {
      setError(`Only ${selected.availableQuantity} unit(s) available. Please reduce the quantity.`);
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/borrow", borrow);

      // 200 OK with saved borrow record
      const saved = res.data;
      setSuccess(`✅ Successfully borrowed ${saved.quantity} unit(s) of ${saved.equipmentName}! Due back by ${saved.dueDate}.`);

      // Refresh equipment list to show updated available qty
      fetchEquipment();
      setBorrow((prev) => ({ ...prev, equipmentName: "", quantity: "" }));
      setSelected(null);
      setTimeout(() => navigate("/student"), 2500);

    } catch (err) {
      // 400 from backend = out of stock or invalid
      if (selected) {
        setError(`Borrow failed. Only ${selected.availableQuantity} unit(s) available for ${selected.name}.`);
      } else {
        setError("Borrow failed. Item may be out of stock or unavailable.");
      }
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

            {/* Selected item info */}
            {selected && (
              <div style={{ background: "var(--teal-50)", border: "1px solid var(--border-mid)", borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: "16px", fontSize: "13px", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <span>📦 Category: <strong>{selected.category}</strong></span>
                  <span>📍 Location: <strong>{selected.location}</strong></span>
                  <span>✅ Available: <strong style={{ color: "var(--primary-dark)" }}>{selected.availableQuantity}</strong></span>
                </div>
              </div>
            )}

            <div className="sl-form-group">
              <label className="sl-label">
                Quantity *
                {selected && (
                  <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: "8px" }}>
                    (max {selected.availableQuantity})
                  </span>
                )}
              </label>
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
                {success}
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