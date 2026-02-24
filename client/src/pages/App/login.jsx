import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState(null); // 'patient' or 'clinic'
  
  // States for form inputs
  const [phone, setPhone] = useState('');
  const [shopId, setShopId] = useState('');
  const [password, setPassword] = useState('');

  const handlePatientLogin = (e) => {
    e.preventDefault();
    // In a real app, this checks the DB. For the hackathon, we just route them!
    alert(`Welcome back! Routing to Patient Dashboard...`);
    navigate('/patient');
  };

  const handleClinicLogin = (e) => {
    e.preventDefault();
    if (shopId === 'MG-001' && password === 'admin') {
      alert("Terminal Authenticated. Opening MedGuard POS...");
      navigate('/pos');
    } else {
      alert("Invalid Partner ID or Password. Try MG-001 / admin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      
      {/* The Main Selection Screen */}
      {!loginType && (
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2 text-center mb-8">
            <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-3xl shadow-inner inline-block mb-4">Mg</div>
            <h1 className="text-4xl font-bold text-slate-800">Welcome to MedGuard</h1>
            <p className="text-slate-500 mt-2 text-lg">Select your portal to continue</p>
          </div>

          {/* Patient Card */}
          <button 
            onClick={() => setLoginType('patient')}
            className="bg-white p-10 rounded-3xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all transform hover:-translate-y-2 flex flex-col items-center text-center group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📱</div>
            <h2 className="text-2xl font-bold text-slate-800">Patient & Family</h2>
            <p className="text-slate-500 mt-2">Access your schedule, health vault, and emergency network.</p>
          </button>

          {/* Clinic Card */}
          <button 
            onClick={() => setLoginType('clinic')}
            className="bg-slate-900 p-10 rounded-3xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all transform hover:-translate-y-2 flex flex-col items-center text-center group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🏥</div>
            <h2 className="text-2xl font-bold text-white">Pharmacy Partner</h2>
            <p className="text-slate-400 mt-2">Access the POS billing terminal and sync patient routines.</p>
          </button>
        </div>
      )}

      {/* Patient Login Form */}
      {loginType === 'patient' && (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
          <button onClick={() => setLoginType(null)} className="text-slate-400 hover:text-slate-600 mb-6 font-bold flex items-center gap-2">
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Patient Login</h2>
          <p className="text-slate-500 mb-8">Enter your registered phone number.</p>
          
          <form onSubmit={handlePatientLogin}>
            <input 
              type="tel" 
              placeholder="Phone Number (e.g., 9876543210)" 
              required 
              className="w-full p-4 border border-slate-300 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-mono"
              onChange={(e) => setPhone(e.target.value)}
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg">
              Send OTP / Login
            </button>
          </form>
          <div className="mt-6 text-center text-slate-500">
            New here? <span onClick={() => navigate('/register')} className="text-blue-600 font-bold cursor-pointer hover:underline">Create an account</span>
          </div>
        </div>
      )}

      {/* Clinic POS Login Form */}
      {loginType === 'clinic' && (
        <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in border border-slate-700">
          <button onClick={() => setLoginType(null)} className="text-slate-400 hover:text-white mb-6 font-bold flex items-center gap-2">
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">Terminal Login</h2>
          <p className="text-slate-400 mb-8">Authorized Pharmacy Partners Only.</p>
          
          <form onSubmit={handleClinicLogin}>
            <input 
              type="text" 
              placeholder="Partner ID (Try: MG-001)" 
              required 
              className="w-full p-4 bg-slate-800 text-white border border-slate-600 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              onChange={(e) => setShopId(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password (Try: admin)" 
              required 
              className="w-full p-4 bg-slate-800 text-white border border-slate-600 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-blue-900/50">
              Access POS
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default Login;