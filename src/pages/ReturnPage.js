import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function ReturnPage() {
  const navigate = useNavigate();

  const [borrowId,     setBorrowId]     = useState("");
  const [quantity,     setQuantity]     = useState("");
  const [borrowInfo,   setBorrowInfo]   = useState(null); // fetched borrow details
  const [fetchError,   setFetchError]   = useState("");
  const [message,      setMessage]      = useState({ text: "", type: "" });
  const [loading,      setLoading]      = useState(false);
  const [fetching,     setFetching]     = useState(false);

  // ── Fetch borrow info when ID is entered ──────────────────────────────
  const handleIdChange = (e) => {
    const val = e.target.value;
    setBorrowId(val);
    setBorrowInfo(null);
    setFetchError("");
    setMessage({ text: "", type: "" });
    setQuantity("");

    if (val.trim().length > 0) {
      setFetching(true);
      API.get(`/borrow/${val.trim()}`)
        .then((res) => {
          const b = res.data;
          const remaining = b.quantity - b.returnedQuantity;

          // Already fully returned
          if (remaining <= 0 || b.status === "RETURNED") {
            setFetchError("This borrow record is already fully returned.");
            setBorrowInfo(null);
          } else {
            setBorrowInfo({ ...b, remaining });
            setQuantity(String(remaining)); // pre-fill with max remaining
          }
        })
        .catch(() => {
          setFetchError("Borrow ID not found. Please check and try again.");
          setBorrowInfo(null);
        })
        .finally(() => setFetching(false));
    }
  };

  // ── Submit return ─────────────────────────────────────────────────────
  const handleReturn = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity);

    if (borrowInfo && qty > borrowInfo.remaining) {
      setMessage({
        text: `You can only return up to ${borrowInfo.remaining} unit(s). You currently have ${borrowInfo.remaining} remaining.`,
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await API.put(`/borrow/return/${borrowId}/${qty}`);

      // 200 OK with updated borrow record
      const updated     = res.data;
      const returned    = qty;
      const newReturned = updated.returnedQuantity;
      const stillLeft   = updated.quantity - newReturned;

      const successText = stillLeft > 0
        ? `${returned} unit(s) of ${updated.equipmentName} returned successfully. You still have ${stillLeft} unit(s) remaining.`
        : `All ${returned} unit(s) of ${updated.equipmentName} returned successfully. Thank you!`;

      setMessage({ text: successText, type: "success" });

      // Update borrow info panel with new remaining count
      if (stillLeft > 0) {
        setBorrowInfo(prev => prev ? {
          ...prev,
          returnedQuantity: newReturned,
          remaining: stillLeft,
          status: updated.status,
        } : null);
        setQuantity(String(stillLeft));
      } else {
        // Fully returned — clear form after short delay
        setTimeout(() => {
          setBorrowId("");
          setQuantity("");
          setBorrowInfo(null);
        }, 2500);
      }

    } catch (err) {
      // 400 Bad Request from backend means qty > remaining or invalid borrow ID
      const stillLeft = borrowInfo ? borrowInfo.remaining : null;
      setMessage({
        text: stillLeft !== null
          ? `You have ${stillLeft} unit(s) still with you. Please enter a value between 1 and ${stillLeft}.`
          : "Return failed. Please check your Borrow ID and try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const remaining = borrowInfo?.remaining ?? null;

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

            {/* Borrow ID */}
            <div className="sl-form-group">
              <label className="sl-label">Borrow ID *</label>
              <input
                type="number"
                className="sl-input"
                placeholder="Enter your borrow record ID"
                value={borrowId}
                onChange={handleIdChange}
                required
              />
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "5px", marginBottom: 0 }}>
                💡 Find your Borrow ID in Student History
              </p>
            </div>

            {/* Loading indicator while fetching */}
            {fetching && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                <span className="sl-spinner sl-spinner--teal" style={{ width: "14px", height: "14px" }} />
                Looking up borrow record…
              </div>
            )}

            {/* Fetch error */}
            {fetchError && (
              <div className="sl-toast sl-toast--error" style={{ marginBottom: "16px" }}>
                ⚠️ {fetchError}
              </div>
            )}

            {/* Borrow Info Panel */}
            {borrowInfo && (
              <div style={{
                background: "var(--teal-50)", border: "1.5px solid var(--border-mid)",
                borderRadius: "var(--radius-md)", padding: "14px 16px",
                marginBottom: "16px",
              }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary-dark)", marginBottom: "10px" }}>
                  📋 Borrow Record #{borrowInfo.id}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Equipment</span>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{borrowInfo.equipmentName}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Status</span>
                    <div>
                      <span style={{
                        background: borrowInfo.status === "OVERDUE" ? "#fee2e2" : "#fef3c7",
                        color:      borrowInfo.status === "OVERDUE" ? "#991b1b" : "#92400e",
                        padding: "2px 8px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: 700,
                      }}>
                        {borrowInfo.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Originally Borrowed</span>
                    <div style={{ fontWeight: 600 }}>{borrowInfo.quantity} unit(s)</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Already Returned</span>
                    <div style={{ fontWeight: 600 }}>{borrowInfo.returnedQuantity} unit(s)</div>
                  </div>
                </div>

                {/* Remaining highlight */}
                <div style={{
                  marginTop: "12px", padding: "10px 14px",
                  background: "#fff", borderRadius: "8px",
                  border: "1.5px solid var(--border-mid)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                    Units still with you
                  </span>
                  <span style={{
                    fontSize: "22px", fontWeight: 800,
                    color: "var(--primary-dark)",
                  }}>
                    {remaining}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity to return */}
            <div className="sl-form-group">
              <label className="sl-label">
                Quantity to Return *
                {remaining !== null && (
                  <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: "8px" }}>
                    (max {remaining})
                  </span>
                )}
              </label>
              <input
                type="number"
                min="1"
                max={remaining || undefined}
                className="sl-input"
                placeholder={remaining !== null ? `Enter 1–${remaining}` : "How many items are you returning?"}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            {message.text && (
              <div className={`sl-toast sl-toast--${message.type}`}>
                {message.type === "success" ? message.text : `⚠️ ${message.text}`}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                type="submit"
                className="sl-btn sl-btn--primary"
                disabled={loading || !!fetchError || fetching}
              >
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
              <li>Note the <strong>Borrow ID</strong> from the first column (e.g. #4)</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ReturnPage;