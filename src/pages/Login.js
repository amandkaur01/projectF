import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await API.post("/auth/login", { email, password });
      const user = response.data;

      if (!user) { setError("Invalid credentials. Please try again."); return; }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("studentName", user.name);

      if (user.role === "ADMIN") navigate("/admin");
      else                        navigate("/student");

    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sl-auth-page">
      <div className="sl-auth-card">
        {/* Logo */}
        <div className="sl-auth-logo">🔬</div>
        <h1 className="sl-auth-title">Welcome Back</h1>
        <p className="sl-auth-subtitle">Sign in to Smart Lab Equipment System</p>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div className="sl-form-group">
            <label className="sl-label">Email Address</label>
            <input
              type="email"
              className="sl-input"
              placeholder="admin@lab.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="sl-form-group">
            <label className="sl-label">Password</label>
            <input
              type="password"
              className="sl-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
            style={{ marginTop: "8px" }}
          >
            {loading ? <><span className="sl-spinner" /> Signing in…</> : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
          New user?{" "}
          <a href="/register" style={{ fontWeight: 600 }}>
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
