import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Simple inline SVG icons — no extra dependency needed
const Icons = {
  lab:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.427 13.927L14 8.5V4h1a1 1 0 000-2H9a1 1 0 000 2h1v4.5l-5.427 5.427A2 2 0 006 17.5V19a2 2 0 002 2h8a2 2 0 002-2v-1.5a2 2 0 00-.573-1.573zM8 19v-1.5L12.5 13l4.5 4.5V19H8z"/></svg>,
  home:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  equipment: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  records:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  logout:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  borrow:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  history:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  return:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("studentName");
    navigate("/login");
  };

  const isAdmin   = user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";
  const isAuth    = !!user;

  return (
    <nav className="sl-navbar">
      {/* Brand */}
      <div className="sl-navbar__brand">
        <div className="sl-navbar__brand-icon">
          <Icons.lab />
        </div>
        Smart Lab System
      </div>

      {/* Nav Links */}
      {isAuth && (
        <div className="sl-navbar__links">
          {isAdmin && (
            <>
              <Link className="sl-navbar__link" to="/admin">
                <Icons.home /> Dashboard
              </Link>
              <Link className="sl-navbar__link" to="/equipment">
                <Icons.equipment /> Equipment
              </Link>
              <Link className="sl-navbar__link" to="/borrow-records">
                <Icons.records /> Records
              </Link>
            </>
          )}

          {isStudent && (
            <>
              <Link className="sl-navbar__link" to="/student">
                <Icons.home /> Dashboard
              </Link>
              <Link className="sl-navbar__link" to="/equipment">
                <Icons.equipment /> Equipment
              </Link>
              <Link className="sl-navbar__link" to="/borrow">
                <Icons.borrow /> Borrow
              </Link>
              <Link className="sl-navbar__link" to="/return">
                <Icons.return /> Return
              </Link>
              <Link className="sl-navbar__link" to="/student-history">
                <Icons.history /> History
              </Link>
            </>
          )}

          <button className="sl-navbar__logout" onClick={handleLogout}>
            <Icons.logout />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
