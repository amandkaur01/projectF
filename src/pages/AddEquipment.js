import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const CATEGORIES = [
  "Microcontroller",
  "Sensor",
  "Measurement",
  "Power Supply",
  "Tool",
  "Module",
  "Display",
  "Other",
];

function AddEquipment() {
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState({
    name: "",
    category: "",
    totalQuantity: "",
    availableQuantity: "",
    location: "",
  });

  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const [successMsg, setSuccessMsg] = useState("");

  const isOther = equipment.category === "Other";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquipment({ ...equipment, [name]: value });

    // Reset custom category when user switches away from Other
    if (name === "category" && value !== "Other") {
      setCustomCategory("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Use custom category text if Other was selected
    const finalCategory = isOther
      ? customCategory.trim()
      : equipment.category;

    if (!finalCategory) {
      setError("Please enter a category name.");
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/equipment", { ...equipment, category: finalCategory });
      const msg = res.data
        ? `✅ "${res.data.name}" stock updated successfully! Redirecting…`
        : "✅ Equipment saved successfully! Redirecting…";
      setSuccessMsg(msg);
      setSuccess(true);
      setEquipment({
        name: "",
        category: "",
        totalQuantity: "",
        availableQuantity: "",
        location: "",
      });
      setCustomCategory("");
      setTimeout(() => navigate("/equipment"), 1500);
    } catch {
      setError("Failed to add equipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

              {/* Equipment Name — full width */}
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

              {/* Category dropdown */}
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
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
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

              {/* Custom category input — only shown when Other is selected */}
              {isOther && (
                <div
                  className="sl-form-group"
                  style={{
                    gridColumn: "1 / -1",
                    background: "var(--teal-50)",
                    border: "1.5px solid var(--border-mid)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <label className="sl-label" style={{ color: "var(--primary-dark)" }}>
                    ✏️ Enter Custom Category *
                  </label>
                  <input
                    className="sl-input"
                    placeholder="e.g. Communication Module, Robotics Kit…"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    autoFocus
                    required={isOther}
                  />
                  <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    This name will be saved as the category for this equipment.
                  </p>
                </div>
              )}

              {/* Total Quantity */}
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

              {/* Available Quantity */}
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
                {successMsg}
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

      {/* Fade-in animation for the custom category box */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default AddEquipment;