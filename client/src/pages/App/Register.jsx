import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', password: '', familyPin: '', language: 'Telugu', bloodGroup: 'O+', isDonor: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.familyPin.length !== 4) return alert("Family PIN must be exactly 4 digits.");
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("✅ Registration Successful!");
      navigate('/'); 
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">Join MedGuard</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" required className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input type="tel" placeholder="Phone Number" required className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input type="password" placeholder="Login Password" required className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          {/* 🔒 NEW FAMILY PIN INPUT */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-blue-800 font-bold mb-1 text-sm">Secret Family Access PIN</label>
            <p className="text-xs text-blue-600 mb-2">Share this 4-digit code with relatives so they can monitor your health.</p>
            <input type="text" maxLength="4" placeholder="e.g. 1234" required className="w-full p-3 border border-blue-200 rounded-xl text-center text-xl font-mono tracking-widest bg-white" onChange={e => setFormData({...formData, familyPin: e.target.value})} />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg mt-4">
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Register;