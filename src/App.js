import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./styles/theme.css";

import Login           from "./pages/Login";
import Register        from "./pages/Register";
import Dashboard       from "./pages/Dashboard";
import EquipmentList   from "./pages/EquipmentList";
import AddEquipment    from "./pages/AddEquipment";
import BorrowEquipment from "./pages/BorrowEquipment";
import StudentDashboard from "./pages/StudentDashboard";
import BorrowRecords   from "./pages/BorrowRecords";
import ReturnPage      from "./pages/ReturnPage";
import StudentHistory  from "./pages/StudentHistory";
import RestockHistory  from "./pages/RestockHistory";
import Analytics       from "./pages/Analytics";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/"        element={<Login />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route path="/admin"          element={<Dashboard />} />
        <Route path="/add-equipment"  element={<AddEquipment />} />
        <Route path="/equipment"      element={<EquipmentList />} />
        <Route path="/borrow-records" element={<BorrowRecords />} />
        <Route path="/restock-history" element={<RestockHistory />} />
        <Route path="/analytics"       element={<Analytics />} />

        {/* Borrow */}
        <Route path="/borrow" element={<BorrowEquipment />} />

        {/* Student */}
        <Route path="/student"         element={<StudentDashboard />} />
        <Route path="/return"          element={<ReturnPage />} />
        <Route path="/student-history" element={<StudentHistory />} />
      </Routes>
    </Router>
  );
}

export default App;