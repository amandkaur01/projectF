import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function AddEquipment() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState({
    name: "",
    category: "",
    totalQuantity: "",
    availableQuantity: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) =>
    setEquipment({ ...equipment, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await API.post("/equipment", equipment);
      setSuccess(true);
      setEquipment({ name: "", category: "", totalQuantity: "", availableQuantity: "", location: "" });
      setTimeout(() => navigate("/equipment"), 1500);
    } catch {
      setError("Failed to add equipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Microcontroller", "Sensor", "Measurement", "Power Supply", "Tool", "Module", "Display", "Other"];

  return (
    <div className="sl-page">
      <Navbar />
      <div className="sl-content" style={{ maxWidth: "680px" }}>

        {/* Header */}
        <div className="sl-page-header">
          <h1 className="sl-page-header__title">
            <div className="sl-page-header__title-icon">➕</div>
            Add Equipment
          </h1>
          <p className="sl-page-header__subtitle">
            Register new equipment to the lab inventory
          </p>
        </div>

        {/* Form Card */}
        <div className="sl-card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>

              <div className="sl-form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="sl-label">Equipment Name *</label>
                <input
                  name="name"
                  className="sl-input"
                  placeholder="e.g. Arduino Uno R3"
                  value={equipment.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sl-form-group">
                <label className="sl-label">Category *</label>
                <select
                  name="category"
                  className="sl-select"
                  value={equipment.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="sl-form-group">
                <label className="sl-label">Location *</label>
                <input
                  name="location"
                  className="sl-input"
                  placeholder="e.g. Shelf A-3"
                  value={equipment.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sl-form-group">
                <label className="sl-label">Total Quantity *</label>
                <input
                  name="totalQuantity"
                  type="number"
                  min="1"
                  className="sl-input"
                  placeholder="e.g. 10"
                  value={equipment.totalQuantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sl-form-group">
                <label className="sl-label">Available Quantity *</label>
                <input
                  name="availableQuantity"
                  type="number"
                  min="0"
                  className="sl-input"
                  placeholder="e.g. 10"
                  value={equipment.availableQuantity}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {success && (
              <div className="sl-toast sl-toast--success">
                ✅ Equipment added successfully! Redirecting…
              </div>
            )}
            {error && (
              <div className="sl-toast sl-toast--error">
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                type="submit"
                className="sl-btn sl-btn--primary"
                disabled={loading}
              >
                {loading ? <><span className="sl-spinner" /> Adding…</> : "➕ Add Equipment"}
              </button>
              <button
                type="button"
                className="sl-btn sl-btn--ghost"
                onClick={() => navigate("/equipment")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default AddEquipment;
