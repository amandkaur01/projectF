import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function ReturnPage() {
  const navigate  = useNavigate();
  const [borrowId, setBorrowId]   = useState("");
  const [quantity, setQuantity]   = useState("");
  const [message, setMessage]     = useState({ text: "", type: "" });
  const [loading, setLoading]     = useState(false);

  const handleReturn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      await API.put(`/borrow/return/${borrowId}/${quantity}`);
      setMessage({ text: "Equipment returned successfully! Thank you.", type: "success" });
      setBorrowId("");
      setQuantity("");
    } catch {
      setMessage({ text: "Return failed. Please verify the Borrow ID and quantity.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sl-page">
      <Navbar />
      <div className="sl-content" style={{ maxWidth: "560px" }}>

        <div className="sl-page-header">
          <h1 className="sl-page-header__title">
            <div className="sl-page-header__title-icon">🔄</div>
            Return Equipment
          </h1>
          <p className="sl-page-header__subtitle">
            Enter your borrow ID to return equipment to the lab
          </p>
        </div>

        <div className="sl-card">
          <form onSubmit={handleReturn}>

            <div className="sl-form-group">
              <label className="sl-label">Borrow ID *</label>
              <input
                type="number"
                className="sl-input"
                placeholder="Enter your borrow record ID"
                value={borrowId}
                onChange={(e) => setBorrowId(e.target.value)}
                required
              />
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "5px", marginBottom: 0 }}>
                💡 Find your Borrow ID in Student History
              </p>
            </div>

            <div className="sl-form-group">
              <label className="sl-label">Quantity to Return *</label>
              <input
                type="number"
                min="1"
                className="sl-input"
                placeholder="How many items are you returning?"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            {message.text && (
              <div className={`sl-toast sl-toast--${message.type}`}>
                {message.type === "success" ? "✅" : "⚠️"} {message.text}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button type="submit" className="sl-btn sl-btn--primary" disabled={loading}>
                {loading ? <><span className="sl-spinner" /> Returning…</> : "🔄 Return Equipment"}
              </button>
              <button type="button" className="sl-btn sl-btn--ghost" onClick={() => navigate("/student")}>
                Cancel
              </button>
            </div>

          </form>
        </div>

        {/* Helper Card */}
        <div className="sl-card" style={{ marginTop: "16px", borderColor: "var(--border-mid)", background: "var(--teal-50)" }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            <strong>📋 How to find your Borrow ID:</strong>
            <ol style={{ marginTop: "8px", paddingLeft: "18px", lineHeight: "1.8" }}>
              <li>Go to <strong>Student History</strong> from the navigation</li>
              <li>Find the equipment you want to return</li>
              <li>Note the <strong>Borrow ID</strong> from the first column</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ReturnPage;
