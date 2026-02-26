import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FamilyDashboard = () => {
  const navigate = useNavigate();
  const [searchPhone, setSearchPhone] = useState('');
  const [familyPin, setFamilyPin] = useState(''); // 🔒 NEW STATE
  const [trackedPhone, setTrackedPhone] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrackPatient = async (e) => {
    e.preventDefault();
    if (searchPhone.length < 10) return alert("Enter valid phone.");
    if (familyPin.length !== 4) return alert("Enter the 4-digit PIN.");
    
    setIsLoading(true);
    try {
      // 🔒 Send both Phone and PIN securely via POST request
      const response = await axios.post(`http://localhost:5000/api/sync/family-schedule`, {
        phone: searchPhone,
        familyPin: familyPin
      });
      setSchedule(response.data);
      setTrackedPhone(searchPhone);
      setHasSearched(true);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to access records.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <header className="bg-slate-900 text-white p-6 md:p-8 rounded-b-3xl shadow-lg flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Family Observer</h1><p className="text-slate-400 mt-1">Secure Patient Tracking</p></div>
        <button onClick={() => navigate('/')} className="text-slate-400 font-bold bg-slate-800 px-4 py-2 rounded-lg">Exit</button>
      </header>

      <main className="p-4 mt-6 max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
          <form onSubmit={handleTrackPatient} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="tel" placeholder="Patient Phone" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="flex-1 p-4 border rounded-xl font-mono text-lg" />
              <input type="password" maxLength="4" placeholder="4-Digit PIN" value={familyPin} onChange={(e) => setFamilyPin(e.target.value)} className="w-full sm:w-32 p-4 border rounded-xl font-mono text-center text-lg" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg">
              {isLoading ? "Verifying..." : "🔒 Access Records"}
            </button>
          </form>
        </div>

        {hasSearched && !isLoading && (
           <div className="space-y-6 animate-fade-in">
            {schedule.length === 0 ? (
              <div className="text-center p-10 bg-white rounded-3xl shadow text-slate-500">No active prescriptions.</div>
            ) : (
              schedule.map((slot) => (
                <div key={slot._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{slot.time_slot} ({slot.target_time})</h3>
                    <p className="text-slate-500 text-sm mt-1">{slot.medications.length} Medicines</p>
                  </div>
                  {slot.status === 'taken' ? (
                    <span className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded-lg">✅ Taken</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 font-bold px-4 py-2 rounded-lg">⏳ Pending</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default FamilyDashboard;