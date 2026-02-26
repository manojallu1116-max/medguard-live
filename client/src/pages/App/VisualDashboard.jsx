import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const translations = {
  en: { greeting: "Good Morning", hub: "Here is your health hub.", quickActions: "Quick Actions", emergency: "Emergency Blood", family: "Family Observer", clinic: "Find Clinic", settings: "App Settings", schedule: "Today's Schedule", noMeds: "No medicines scheduled!", takeMeds: "Take", pills: "Pills", tookIt: "💊 I Took It", taken: "✅ Medicine Taken" },
  te: { greeting: "శుభోదయం", hub: "ఇది మీ హెల్త్ హబ్.", quickActions: "త్వరిత చర్యలు", emergency: "అత్యవసర రక్తం", family: "కుటుంబ పరిశీలకుడు", clinic: "క్లినిక్ కనుగొనండి", settings: "యాప్ సెట్టింగ్‌లు", schedule: "నేటి షెడ్యూల్", noMeds: "మందులు షెడ్యూల్ చేయబడలేదు!", takeMeds: "తీసుకోండి", pills: "మాత్రలు", tookIt: "💊 నేను తీసుకున్నాను", taken: "✅ మందు తీసుకున్నారు" },
  hi: { greeting: "सुप्रभात", hub: "यह आपका स्वास्थ्य केंद्र है।", quickActions: "त्वरित कार्रवाई", emergency: "आपातकालीन रक्त", family: "परिवार पर्यवेक्षक", clinic: "क्लीनिक खोजें", settings: "ऐप सेटिंग्स", schedule: "आज की अनुसूची", noMeds: "कोई दवा निर्धारित नहीं है!", takeMeds: "लें", pills: "गोलियां", tookIt: "💊 मैंने ले लिया", taken: "✅ दवा ले ली गई" }
};

const VisualDashboard = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [editHour, setEditHour] = useState('12');
  const [editMinute, setEditMinute] = useState('00');
  const [editAmpm, setEditAmpm] = useState('AM');

  const [showSettings, setShowSettings] = useState(false);
  const [caretakerPhone, setCaretakerPhone] = useState('');
  const [reminderType, setReminderType] = useState('call');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [appLang, setAppLang] = useState(localStorage.getItem('appLang') || 'en');
  
  // 🌟 SAFETY NET 1: Default to English if the dictionary is missing a word
  const t = translations[appLang] || translations['en'];

  const patientPhone = localStorage.getItem('patientPhone');
  const patientName = localStorage.getItem('patientName');

  const handleLanguageChange = (langCode) => {
    setAppLang(langCode);
    localStorage.setItem('appLang', langCode);
  };

  useEffect(() => {
    if (!patientPhone) { navigate('/'); return; }
    fetchSchedule();
  }, [patientPhone, navigate]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/sync/schedule/${patientPhone}`);
      setSchedule(response.data);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleTakeMedicine = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/sync/schedule/${id}/take`);
      setSchedule(schedule.map(slot => slot._id === id ? { ...slot, status: 'taken' } : slot));
    } catch (error) { alert("Failed to update status."); }
  };

  const openTimeEditor = (slot) => {
    // 🌟 SAFETY NET 2: Prevent crash if target_time is missing in an old DB entry
    if (!slot.target_time) return; 
    
    const [timeStr, ampmStr] = slot.target_time.split(' ');
    const [hStr, mStr] = timeStr.split(':');
    setEditHour(hStr.padStart(2, '0'));
    setEditMinute(mStr);
    setEditAmpm(ampmStr || 'AM');
    setEditingTimeId(slot._id);
  };

  const saveCustomTime = async (id) => {
    let h24 = parseInt(editHour, 10);
    if (editAmpm === 'PM' && h24 !== 12) h24 += 12;
    if (editAmpm === 'AM' && h24 === 12) h24 = 0;
    const formatted24h = `${h24.toString().padStart(2, '0')}:${editMinute}`;
    
    try {
      const response = await axios.patch(`http://localhost:5000/api/sync/schedule/${id}/time`, { newTime: formatted24h });
      setSchedule(schedule.map(slot => slot._id === id ? { ...slot, target_time: response.data.target_time } : slot));
      setEditingTimeId(null);
    } catch (error) { alert("Failed to update time."); }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await axios.put('http://localhost:5000/api/auth/settings', { phone: patientPhone, caretakerPhone, reminderType });
      alert("✅ Preferences Saved!");
      setShowSettings(false);
    } catch (error) { alert("Failed to save settings."); } 
    finally { setIsSavingSettings(false); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-slate-400">Loading your schedule...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10 relative">
      <header className="bg-blue-600 text-white p-6 md:p-8 rounded-b-3xl shadow-lg relative">
        <div className="absolute top-6 right-6 flex bg-blue-700/50 rounded-lg p-1 border border-blue-500/50">
          <button onClick={() => handleLanguageChange('en')} className={`px-3 py-1 rounded text-sm font-bold transition-colors ${appLang === 'en' ? 'bg-white text-blue-700' : 'text-blue-100 hover:text-white'}`}>EN</button>
          <button onClick={() => handleLanguageChange('te')} className={`px-3 py-1 rounded text-sm font-bold transition-colors ${appLang === 'te' ? 'bg-white text-blue-700' : 'text-blue-100 hover:text-white'}`}>తెలుగు</button>
          <button onClick={() => handleLanguageChange('hi')} className={`px-3 py-1 rounded text-sm font-bold transition-colors ${appLang === 'hi' ? 'bg-white text-blue-700' : 'text-blue-100 hover:text-white'}`}>हिंदी</button>
        </div>
        <h1 className="text-4xl font-bold pr-24">{t.greeting}, {patientName || 'User'}!</h1>
        <p className="text-blue-100 mt-2 text-xl">{t.hub}</p>
      </header>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.settings}</h2>
            <form onSubmit={saveSettings} className="space-y-6 mt-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-slate-700 font-bold mb-2">Reminder Preference</label>
                <select value={reminderType} onChange={(e) => setReminderType(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl bg-white text-lg">
                  <option value="call">📞 Automated Voice Call</option>
                  <option value="notification">📱 Push Notification Only</option>
                  <option value="none">🔕 Do Not Disturb</option>
                </select>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <label className="block text-red-800 font-bold mb-2">Emergency Caretaker Phone</label>
                <input type="tel" placeholder="e.g. 9876543210" value={caretakerPhone} onChange={(e) => setCaretakerPhone(e.target.value)} className="w-full p-3 border border-red-200 rounded-xl bg-white text-lg font-mono" />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowSettings(false)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" disabled={isSavingSettings} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg">{isSavingSettings ? "Saving..." : "Save Config"}</button>
              </div>
              <button type="button" onClick={handleLogout} className="w-full py-4 mt-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                <span className="text-xl">🚪</span> Secure Logout
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">{t.quickActions}</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/blood-network')} className="bg-red-50 hover:bg-red-100 p-6 rounded-3xl border border-red-100 flex flex-col items-center justify-center gap-3 shadow-sm active:scale-95 transition-transform">
            <span className="text-5xl mb-1">🩸</span><span className="text-sm font-bold text-red-700 text-center leading-tight">{t.emergency}</span>
          </button>
          <button onClick={() => navigate('/family')} className="bg-indigo-50 hover:bg-indigo-100 p-6 rounded-3xl border border-indigo-100 flex flex-col items-center justify-center gap-3 shadow-sm active:scale-95 transition-transform">
            <span className="text-5xl mb-1">👨‍👩‍👧‍👦</span><span className="text-sm font-bold text-indigo-700 text-center leading-tight">{t.family}</span>
          </button>
          <button onClick={() => navigate('/find-clinic')} className="bg-emerald-50 hover:bg-emerald-100 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center gap-3 shadow-sm active:scale-95 transition-transform">            <span className="text-5xl mb-1">🏥</span><span className="text-sm font-bold text-emerald-700 text-center leading-tight">{t.clinic}</span>
          </button>
          <button onClick={() => setShowSettings(true)} className="bg-slate-100 hover:bg-slate-200 p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-sm active:scale-95 transition-transform">
            <span className="text-5xl mb-1">⚙️</span><span className="text-sm font-bold text-slate-700 text-center leading-tight">{t.settings}</span>
          </button>
        </div>
      </div>

      <main className="p-4 mt-6 max-w-2xl mx-auto space-y-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2 px-2">{t.schedule}</h2>
        
        {schedule.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-3xl shadow text-slate-500 border border-slate-100">
            <span className="text-4xl block mb-4">🎉</span>
            <h2 className="text-2xl font-bold text-slate-700">{t.noMeds}</h2>
          </div>
        ) : (
          schedule.map((slot) => (
            <div key={slot._id} className={`bg-white rounded-3xl shadow-xl overflow-hidden border-l-[12px] ${slot.status === 'taken' ? 'border-green-500' : 'border-amber-400'}`}>
              
              <div className="p-4 sm:p-6 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
                  {slot.time_slot === "Morning" ? "☀️" : slot.time_slot === "Afternoon" ? "🌤️" : "🌙"} {slot.time_slot}
                </h2>
                
                {editingTimeId === slot._id ? (
                  <div className="flex items-center bg-white p-2 rounded-xl shadow-inner border border-slate-200">
                    <select value={editHour} onChange={e => setEditHour(e.target.value)} className="p-1 bg-transparent font-bold text-lg outline-none cursor-pointer">
                      {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="font-bold text-slate-400 mx-1">:</span>
                    <select value={editMinute} onChange={e => setEditMinute(e.target.value)} className="p-1 bg-transparent font-bold text-lg outline-none cursor-pointer">
                      {Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={editAmpm} onChange={e => setEditAmpm(e.target.value)} className="p-1 bg-transparent font-bold text-lg text-blue-600 outline-none cursor-pointer ml-1">
                      <option value="AM">AM</option><option value="PM">PM</option>
                    </select>
                    <div className="flex gap-1 ml-3">
                      <button onClick={() => saveCustomTime(slot._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold">Save</button>
                      <button onClick={() => setEditingTimeId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1.5 rounded-lg font-bold">✕</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => openTimeEditor(slot)} className="text-slate-600 font-bold text-xl hover:text-blue-600 bg-slate-200 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                    {slot.target_time || "12:00 AM"} <span className="text-sm opacity-50">✏️</span>
                  </button>
                )}
              </div>

              <div className="p-6 space-y-8">
                {/* 🌟 SAFETY NET 3: Prevent crash if an old DB entry is missing 'medications' array */}
                {(slot.medications || []).map((med, idx) => (
                  <div key={idx} className="flex flex-row items-center gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-200 rounded-2xl shadow-inner flex items-center justify-center text-4xl shrink-0">💊</div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">{med.name}</h3>
                      <div className="mt-3 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-xl">
                        {t.takeMeds} {med.qty} {t.pills}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white border-t border-slate-50">
                {slot.status === 'taken' ? (
                  <div className="w-full py-6 text-center rounded-2xl bg-green-100 text-green-700 font-bold text-2xl">
                    {t.taken}
                  </div>
                ) : (
                  <button onClick={() => handleTakeMedicine(slot._id)} className="w-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-3xl shadow-[0_8px_30px_rgb(37,99,235,0.3)] transition-transform active:scale-95 flex justify-center items-center gap-3">
                    {t.tookIt}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default VisualDashboard;