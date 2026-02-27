import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [familyPin, setFamilyPin] = useState('');
  const [role, setRole] = useState('patient');
  const [shopId, setShopId] = useState('');
  
  // 🌟 Donor States
  const [isDonor, setIsDonor] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('O+');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('https://medguard-backend-rwlh.onrender.com/api/auth/login', { phone, password });
      const { user, token } = response.data;
      
      // Save info to local storage
      localStorage.setItem('token', token);
      localStorage.setItem('patientPhone', user.phone);
      localStorage.setItem('patientName', user.name);
      localStorage.setItem('role', user.role);
      
      if (user.role === 'clinic') {
        localStorage.setItem('shopId', user.shopId);
        navigate('/pos');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = { name, phone, password, familyPin, role, shopId: role === 'clinic' ? shopId : undefined, isDonor, bloodGroup: isDonor ? bloodGroup : '' };

    const sendToBackend = async (finalData) => {
      try {
        await axios.post('https://medguard-backend-rwlh.onrender.com/api/auth/register', finalData);
        alert("Registration Successful! Please login.");
        setIsLogin(true); // Switch back to login view
      } catch (error) {
        alert(error.response?.data?.message || "Registration failed");
      } finally {
        setIsLoading(false);
      }
    };

    // 🌟 If they are a donor, try to grab their GPS!
    if (isDonor && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userData.lat = position.coords.latitude;
          userData.lng = position.coords.longitude;
          sendToBackend(userData);
        },
        (error) => {
          console.error("GPS Denied", error);
          alert("GPS denied. You will be registered, but patients cannot find you on the map unless you update your location later.");
          sendToBackend(userData); // Save them without GPS
        },
        { timeout: 5000 }
      );
    } else {
      // Not a donor, or browser doesn't support GPS
      sendToBackend(userData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-4xl shadow-lg mb-4">🏥</div>
          <h1 className="text-3xl font-bold text-slate-800">MedGuard</h1>
          <p className="text-slate-500 font-medium mt-1">{isLogin ? "Welcome back!" : "Create your account"}</p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          
          {!isLogin && (
            <>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Type</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRole('patient')} className={`flex-1 py-3 rounded-xl font-bold border transition-colors ${role === 'patient' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>Patient</button>
                  <button type="button" onClick={() => setRole('clinic')} className={`flex-1 py-3 rounded-xl font-bold border transition-colors ${role === 'clinic' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>Pharmacy</button>
                </div>
              </div>

              {role === 'clinic' && (
                <div className="animate-fade-in">
                  <label className="block text-slate-700 font-bold mb-1">Pharmacy ID (e.g. MG-001)</label>
                  <input type="text" required value={shopId} onChange={(e) => setShopId(e.target.value)} className="w-full p-3 border border-emerald-300 rounded-xl bg-emerald-50 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              )}

              {role === 'patient' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Family PIN (4 Digits)</label>
                    <input type="password" required maxLength="4" placeholder="e.g. 1234" value={familyPin} onChange={(e) => setFamilyPin(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  {/* 🌟 EMERGENCY BLOOD DONOR SECTION */}
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={isDonor} onChange={(e) => setIsDonor(e.target.checked)} className="w-5 h-5 text-red-600 rounded border-red-300 focus:ring-red-500" />
                      <span className="font-bold text-red-800">I want to be an Emergency Blood Donor 🩸</span>
                    </label>
                    
                    {isDonor && (
                      <div className="mt-4 animate-fade-in">
                        <label className="block text-red-800 font-bold mb-1">My Blood Group</label>
                        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full p-3 border border-red-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 outline-none font-bold">
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                        <p className="text-xs text-red-600 mt-2 font-medium">By registering as a donor, your browser will ask for your location so patients nearby can find you in an emergency.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
            <input type="tel" required placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <button type="submit" disabled={isLoading} className={`w-full py-4 mt-4 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 ${role === 'clinic' && !isLogin ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isLoading ? "Processing..." : (isLogin ? "Secure Login" : "Create Account")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 font-bold hover:text-blue-600 transition-colors">
            {isLogin ? "New to MedGuard? Register here" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;