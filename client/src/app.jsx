import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

import Login from './pages/App/login';
import Register from './pages/App/Register';
import PosDashboard from './pages/POS/PosDashboard';
import VisualDashboard from './pages/App/VisualDashboard';
import ObserverDashboard from './pages/App/ObserverDashboard';
import BloodFinder from './pages/App/BloodFinder';
import HealthVault from './pages/App/HealthVault';
import PartnerLocator from './pages/App/PartnerLocator';

// A tiny component to hide the navbar on the Login and POS screens
const PatientNavbar = () => {
  const location = useLocation();
  // Don't show this navbar on the Login, Register, or POS screens!
  if (['/', '/register', '/pos'].includes(location.pathname)) return null;

  return (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <div className="font-bold text-xl flex items-center gap-2">
        <span className="bg-blue-600 px-2 py-1 rounded">Mg</span> MedGuard
      </div>
      <div className="flex gap-4 overflow-x-auto text-sm font-medium">
        <Link to="/patient" className="hover:text-blue-400 px-2 py-1">Dashboard</Link>
        <Link to="/observe" className="hover:text-blue-400 px-2 py-1">Family</Link>
        <Link to="/blood" className="hover:text-red-400 px-2 py-1">Emergency</Link>
        <Link to="/vault" className="hover:text-teal-400 px-2 py-1">Vault</Link>
        <Link to="/shops" className="hover:text-indigo-400 px-2 py-1">Shops</Link>
        {/* Logout button just takes them back to the login screen */}
        <Link to="/" className="text-slate-400 hover:text-white px-2 py-1 ml-4 border-l border-slate-700 pl-4">Logout</Link>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <PatientNavbar />
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pos" element={<PosDashboard />} />
            
            {/* Patient App Routes */}
            <Route path="/patient" element={<VisualDashboard />} />
            <Route path="/observe" element={<ObserverDashboard />} />
            <Route path="/blood" element={<BloodFinder />} />
            <Route path="/vault" element={<HealthVault />} />
            <Route path="/shops" element={<PartnerLocator />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;