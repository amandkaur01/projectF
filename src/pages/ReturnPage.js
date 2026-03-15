import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function ReturnPage() {
  const navigate = useNavigate();

  const [borrowId, setBorrowId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [borrowInfo, setBorrowInfo] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // ── Fetch borrow info ─────────────────────────────────────────
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

          if (remaining <= 0 || b.status === "RETURNED") {
            setFetchError("This borrow record is already fully returned.");
            setBorrowInfo(null);
            return;
          }

          setBorrowInfo({
            ...b,
            remaining,
          });

          // Pre-fill quantity with remaining
          setQuantity(String(remaining));
        })
        .catch(() => {
          setFetchError("Borrow ID not found. Please check and try again.");
          setBorrowInfo(null);
        })
        .finally(() => setFetching(false));
    }
  };

  // ── Submit Return ─────────────────────────────────────────────
  const handleReturn = async (e) => {
    e.preventDefault();

    if (!borrowInfo) return;

    const qty = parseInt(quantity);

    // FRONTEND VALIDATION
    if (isNaN(qty) || qty <= 0) {
      setMessage({
        text: "Please enter a valid quantity.",
        type: "error",
      });
      return;
    }

    if (qty > borrowInfo.remaining) {
      setMessage({
        text: `You only have ${borrowInfo.remaining} unit(s) remaining.`,
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await API.put(`/borrow/return/${borrowId}/${qty}`);

      const updated = res.data;

      const newReturned = updated.returnedQuantity;
      const remaining = updated.quantity - newReturned;

      const successText =
        remaining > 0
          ? `✅ ${qty} unit(s) of ${updated.equipmentName} returned successfully. ${remaining} unit(s) still pending to return.`
          : `✅ All ${updated.quantity} unit(s) of ${updated.equipmentName} returned successfully.`;

      setMessage({
        text: successText,
        type: "success",
      });

      // Update borrow panel
      if (remaining > 0) {
        setBorrowInfo((prev) => ({
          ...prev,
          returnedQuantity: newReturned,
          remaining: remaining,
          status: updated.status,
        }));

        setQuantity(String(remaining));
      } else {
        // Clear form after full return
        setTimeout(() => {
          setBorrowId("");
          setQuantity("");
          setBorrowInfo(null);
        }, 2000);
      }
    } catch (err) {
      const remaining = borrowInfo?.remaining;

      setMessage({
        text:
          remaining !== null
            ? `You have ${remaining} unit(s) still with you. Enter between 1 and ${remaining}.`
            : "Return failed. Please try again.",
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

              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "5px",
                  marginBottom: 0,
                }}
              >
                💡 Find your Borrow ID in Student History
              </p>
            </div>

            {/* Loading */}
            {fetching && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  marginBottom: "16px",
                }}
              >
                <span
                  className="sl-spinner sl-spinner--teal"
                  style={{ width: "14px", height: "14px" }}
                />
                Looking up borrow record…
              </div>
            )}

            {/* Fetch Error */}
            {fetchError && (
              <div className="sl-toast sl-toast--error" style={{ marginBottom: "16px" }}>
                ⚠️ {fetchError}
              </div>
            )}

            {/* Borrow Info */}
            {borrowInfo && (
              <div
                style={{
                  background: "var(--teal-50)",
                  border: "1.5px solid var(--border-mid)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--primary-dark)",
                    marginBottom: "10px",
                  }}
                >
                  📋 Borrow Record #{borrowInfo.id}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Equipment</span>
                    <div style={{ fontWeight: 600 }}>
                      {borrowInfo.equipmentName}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Status</span>
                    <div>
                      <span
                        style={{
                          background:
                            borrowInfo.status === "OVERDUE"
                              ? "#fee2e2"
                              : "#fef3c7",
                          color:
                            borrowInfo.status === "OVERDUE"
                              ? "#991b1b"
                              : "#92400e",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {borrowInfo.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)" }}>
                      Originally Borrowed
                    </span>
                    <div style={{ fontWeight: 600 }}>
                      {borrowInfo.quantity} unit(s)
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)" }}>
                      Already Returned
                    </span>
                    <div style={{ fontWeight: 600 }}>
                      {borrowInfo.returnedQuantity} unit(s)
                    </div>
                  </div>
                </div>

                {/* Remaining */}
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px 14px",
                    background: "#fff",
                    borderRadius: "8px",
                    border: "1.5px solid var(--border-mid)",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    Units still with you
                  </span>

                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "var(--primary-dark)",
                    }}
                  >
                    {remaining}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="sl-form-group">
              <label className="sl-label">
                Quantity to Return *
                {remaining !== null && (
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--text-muted)",
                      marginLeft: "8px",
                    }}
                  >
                    (max {remaining})
                  </span>
                )}
              </label>

              <input
                type="number"
                min="1"
                max={remaining || undefined}
                className="sl-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            {message.text && (
              <div className={`sl-toast sl-toast--${message.type}`}>
                {message.text}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                type="submit"
                className="sl-btn sl-btn--primary"
                disabled={loading || !!fetchError || fetching}
              >
                {loading ? (
                  <>
                    <span className="sl-spinner" /> Returning…
                  </>
                ) : (
                  "🔄 Return Equipment"
                )}
              </button>

              <button
                type="button"
                className="sl-btn sl-btn--ghost"
                onClick={() => navigate("/student")}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>

        {/* Helper Card */}
        <div
          className="sl-card"
          style={{
            marginTop: "16px",
            borderColor: "var(--border-mid)",
            background: "var(--teal-50)",
          }}
        >
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            <strong>📋 How to find your Borrow ID:</strong>
            <ol
              style={{
                marginTop: "8px",
                paddingLeft: "18px",
                lineHeight: "1.8",
              }}
            >
              <li>Go to <strong>Student History</strong></li>
              <li>Find the equipment</li>
              <li>Note the <strong>Borrow ID</strong> (#4)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReturnPage;