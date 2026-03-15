import React from "react";
import { Link, useNavigate } from "react-router-dom";

// Inline SVG icons
const Icons = {
  Lab: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.427 13.927L14 8.5V4h1a1 1 0 000-2H9a1 1 0 000 2h1v4.5l-5.427 5.427A2 2 0 006 17.5V19a2 2 0 002 2h8a2 2 0 002-2v-1.5a2 2 0 00-.573-1.573zM8 19v-1.5L12.5 13l4.5 4.5V19H8z" />
    </svg>
  ),

  Home: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),

  Equipment: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  ),

  Records: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),

  Analytics: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),

  Restock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),

  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),

  Borrow: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),

  History: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),

  Return: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  ),
};

function Navbar() {
  const navigate = useNavigate();

  let user = null;

  if (typeof window !== "undefined") {
    user = JSON.parse(localStorage.getItem("user") || "null");
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("studentName");
    navigate("/login");
  };

  const isAdmin = user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";
  const isAuth = !!user;

  return (
    <nav className="sl-navbar">
      <div className="sl-navbar__brand">
        <div className="sl-navbar__brand-icon">
          <Icons.Lab />
        </div>
        Smart Lab System
      </div>

      {isAuth && (
        <div className="sl-navbar__links">

          {isAdmin && (
            <>
              <Link className="sl-navbar__link" to="/admin">
                <Icons.Home /> Dashboard
              </Link>

              <Link className="sl-navbar__link" to="/equipment">
                <Icons.Equipment /> Equipment
              </Link>

              <Link className="sl-navbar__link" to="/borrow-records">
                <Icons.Records /> Records
              </Link>

              <Link className="sl-navbar__link" to="/restock-history">
                <Icons.Restock /> Restock Log
              </Link>

              <Link className="sl-navbar__link" to="/analytics">
                <Icons.Analytics /> Analytics
              </Link>
            </>
          )}

          {isStudent && (
            <>
              <Link className="sl-navbar__link" to="/student">
                <Icons.Home /> Dashboard
              </Link>

              <Link className="sl-navbar__link" to="/equipment">
                <Icons.Equipment /> Equipment
              </Link>

              <Link className="sl-navbar__link" to="/borrow">
                <Icons.Borrow /> Borrow
              </Link>

              <Link className="sl-navbar__link" to="/return">
                <Icons.Return /> Return
              </Link>

              <Link className="sl-navbar__link" to="/student-history">
                <Icons.History /> History
              </Link>
            </>
          )}

          <button className="sl-navbar__logout" onClick={handleLogout}>
            <Icons.Logout /> Logout
          </button>

        </div>
      )}
    </nav>
  );
}

export default Navbar;