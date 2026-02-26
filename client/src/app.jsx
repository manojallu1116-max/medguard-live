import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all your pages!
import Login from './pages/App/login'; 
import VisualDashboard from './pages/App/VisualDashboard';
import FamilyDashboard from './pages/App/FamilyDashboard';
import PosDashboard from './pages/POS/PosDashboard';
import BloodNetwork from './pages/App/BloodNetwork';
import FindClinic from './pages/App/FindClinic';
function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication (Using the new combined Login/Register file) */}
        <Route path="/" element={<Login />} />

        {/* 🌟 THE FIX: Changed from "/patient" to "/dashboard" to match the Login button! */}
        <Route path="/dashboard" element={<VisualDashboard />} />
        
        {/* The rest of your awesome modules! */}
        <Route path="/pos" element={<PosDashboard />} />
        <Route path="/family" element={<FamilyDashboard />} />
        <Route path="/blood-network" element={<BloodNetwork />} />
        <Route path="/find-clinic" element={<FindClinic />} />
        {/* 🌟 SAFETY NET: If a wrong URL is typed, go back to Login instead of a white screen */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;