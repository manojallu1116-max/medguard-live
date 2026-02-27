import React, { useState } from 'react';
import axios from 'axios';
import AddReminder from '../../components/AddReminder';

const FamilyDashboard = () => {
  const [phone, setPhone] = useState('');
  const [familyPin, setFamilyPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');
  const [showAddReminder, setShowAddReminder] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Uses the route you already built to verify PIN and get schedule!
      const res = await axios.post('http://localhost:5000/api/sync/family-schedule', { phone, familyPin });
      setSchedule(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Invalid Patient Phone or Secret Family PIN.');
    }
  };

  const refreshSchedule = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/sync/family-schedule', { phone, familyPin });
      setSchedule(res.data);
    } catch (err) { console.error(err); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-t-8 border-indigo-600">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">👨‍👩‍👧‍👦 Family Portal</h2>
          <p className="text-center text-slate-500 mb-6 font-bold">Monitor & Manage Prescriptions</p>
          
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg font-bold mb-4">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Patient Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50" required placeholder="e.g. 9876543210" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Secret Family PIN</label>
              <input type="password" value={familyPin} onChange={(e) => setFamilyPin(e.target.value)} className="w-full p-3 border rounded-xl font-bold text-center tracking-widest text-2xl bg-slate-50" required placeholder="••••" maxLength="4" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg mt-4 hover:bg-indigo-700 transition">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      <header className="bg-indigo-700 text-white p-6 md:p-8 shadow-lg rounded-b-3xl">
        <h1 className="text-3xl font-bold">Monitoring Patient</h1>
        <p className="text-indigo-200 font-bold mt-1">Status: Active & Protected</p>
      </header>

      {/* 🌟 Family Member's Add Medicine Pop-up */}
      {showAddReminder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md pt-10">
            <button onClick={() => setShowAddReminder(false)} className="absolute top-2 right-2 z-50 bg-red-500 text-white rounded-full w-8 h-8 font-bold shadow-lg">✕</button>
            <AddReminder patientPhone={phone} onSuccess={() => { setShowAddReminder(false); refreshSchedule(); }} />
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 mt-4">
        <button onClick={() => setShowAddReminder(true)} className="w-full bg-indigo-100 text-indigo-800 p-4 rounded-2xl font-bold text-xl border-2 border-indigo-300 border-dashed hover:bg-indigo-200 transition shadow-sm mb-6 flex justify-center items-center gap-2">
          ➕ Add New Medicine for Patient
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-4 px-2">Current Prescriptions</h2>
        
        {schedule.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl shadow"><p className="text-slate-500 font-bold">No medicines assigned.</p></div>
        ) : (
          schedule.map((slot) => (
            <div key={slot._id} className={`bg-white rounded-2xl shadow p-5 mb-4 border-l-8 ${slot.status === 'taken' ? 'border-green-500' : 'border-amber-400'}`}>
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <span className="font-bold text-xl text-slate-800">{slot.time_slot} ({slot.target_time})</span>
                <span className={`px-3 py-1 rounded-full font-bold text-sm ${slot.status === 'taken' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {slot.status.toUpperCase()}
                </span>
              </div>
              {(slot.medications || []).map((med, idx) => (
                <div key={idx} className="flex items-center gap-4 mt-4">
                  {/* 📸 Photos render perfectly here! */}
                  {slot.photo ? (
                    <img src={slot.photo} alt="Pill" className="w-20 h-20 object-cover rounded-xl shadow-sm border" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center text-3xl shadow-inner">💊</div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-slate-700">{med.name}</h3>
                    <p className="text-slate-500 font-bold">{med.qty} assigned</p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FamilyDashboard;