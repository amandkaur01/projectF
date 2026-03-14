import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [user, setUser]     = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/register", user);
      alert("Registration successful! Please sign in.");
      navigate("/login");
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sl-auth-page">
      <div className="sl-auth-card">
        <div className="sl-auth-logo">📋</div>
        <h1 className="sl-auth-title">Create Account</h1>
        <p className="sl-auth-subtitle">Register for Smart Lab Equipment System</p>

        <form onSubmit={handleRegister}>
          <div className="sl-form-group">
            <label className="sl-label">Full Name</label>
            <input
              name="name"
              className="sl-input"
              placeholder="Enter your full name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="sl-form-group">
            <label className="sl-label">Email Address</label>
            <input
              name="email"
              type="email"
              className="sl-input"
              placeholder="your@email.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className="sl-form-group">
            <label className="sl-label">Password</label>
            <input
              name="password"
              type="password"
              className="sl-input"
              placeholder="Create a password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="sl-form-group">
            <label className="sl-label">Role</label>
            <select name="role" className="sl-select" onChange={handleChange}>
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && (
            <div className="sl-toast sl-toast--error" style={{ marginBottom: "16px", marginTop: 0 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="sl-btn sl-btn--primary sl-btn--full sl-btn--lg"
            disabled={loading}
          >
            {loading ? <><span className="sl-spinner" /> Registering…</> : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <a href="/login" style={{ fontWeight: 600 }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
