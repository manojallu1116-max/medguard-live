import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    language: 'Telugu',
    isDonor: false,
    bloodGroup: ''
  });

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Registration Data Payload:", formData);
    alert("Account Created! Routing to Patient Dashboard...");
    navigate('/patient');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">Join MedGuard</h1>
        <p className="text-slate-500 text-center mb-8">Set up your automated care profile.</p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Name</label>
            <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Phone Number (QR ID)</label>
            <input type="tel" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
              onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Voice Call Language</label>
            <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={e => setFormData({...formData, language: e.target.value})}>
              <option>Telugu</option>
              <option>Hindi</option>
              <option>English</option>
            </select>
          </div>

          {/* Emergency Network Opt-In */}
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl mt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-6 h-6 text-red-600 rounded focus:ring-red-500"
                onChange={e => setFormData({...formData, isDonor: e.target.checked})} />
              <span className="font-bold text-red-800 text-lg">Join Emergency Blood Network?</span>
            </label>
            
            {formData.isDonor && (
              <div className="mt-4 animate-fade-in">
                <label className="block text-red-700 font-bold mb-1">Your Blood Group</label>
                <select required={formData.isDonor} className="w-full p-3 border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                  <option value="">Select Group...</option>
                  <option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option>
                  <option>O+</option><option>O-</option>
                  <option>AB+</option><option>AB-</option>
                </select>
                <p className="text-xs text-red-500 mt-2">By joining, you agree to receive SMS pings if someone within 20km needs your blood type.</p>
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl shadow-lg mt-8 transition-transform active:scale-95">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;