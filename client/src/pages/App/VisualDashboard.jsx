import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddReminder from '../../components/AddReminder'; 

const translations = {
  en: { greeting: "Good Morning", hub: "Here is your health hub.", quickActions: "Quick Actions", emergency: "Emergency Blood", family: "Family Observer", clinic: "Find Clinic", settings: "App Settings", addMed: "Add Medicine", schedule: "Today's Schedule", noMeds: "No medicines scheduled!", takeMeds: "Take", pills: "Pills", tookIt: "💊 I Took It", taken: "✅ Medicine Taken", sos: "SOS PANIC" },
  te: { greeting: "శుభోదయం", hub: "ఇది మీ హెల్త్ హబ్.", quickActions: "త్వరిత చర్యలు", emergency: "అత్యవసర రక్తం", family: "కుటుంబ పరిశీలకుడు", clinic: "క్లినిక్ కనుగొనండి", settings: "యాప్ సెట్టింగ్‌లు", addMed: "మందు జోడించండి", schedule: "నేటి షెడ్యూల్", noMeds: "మందులు లేవు!", takeMeds: "తీసుకోండి", pills: "మాత్రలు", tookIt: "💊 నేను తీసుకున్నాను", taken: "✅ మందు తీసుకున్నారు", sos: "SOS" },
  hi: { greeting: "सुप्रभात", hub: "यह आपका स्वास्थ्य केंद्र है।", quickActions: "त्वरित कार्रवाई", emergency: "आपातकालीन रक्त", family: "परिवार पर्यवेक्षक", clinic: "क्लीनिक खोजें", settings: "ऐप सेटिंग्स", addMed: "दवा जोड़ें", schedule: "आज की अनुसूची", noMeds: "कोई दवा नहीं!", takeMeds: "लें", pills: "गोलियां", tookIt: "💊 मैंने ले लिया", taken: "✅ दवा ले ली गई", sos: "आपातकालीन" }
};

const VisualDashboard = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingSOS, setIsSendingSOS] = useState(false); 
  
  // Modals
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings State
  const [caretakerPhone, setCaretakerPhone] = useState('');
  const [reminderType, setReminderType] = useState('call');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Time Editor State
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [editHour, setEditHour] = useState('12');
  const [editMinute, setEditMinute] = useState('00');
  const [editAmpm, setEditAmpm] = useState('AM');

  // Language
  const [appLang, setAppLang] = useState(localStorage.getItem('appLang') || 'en');
  const t = translations[appLang] || translations['en'];
  
  const patientPhone = localStorage.getItem('patientPhone');
  const patientName = localStorage.getItem('patientName');

  useEffect(() => {
    if (!patientPhone) { navigate('/'); return; }
    fetchSchedule();
  }, [patientPhone, navigate]);

  const handleLanguageChange = (langCode) => {
    setAppLang(langCode);
    localStorage.setItem('appLang', langCode);
  };

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`https://medguard-backend-rwlh.onrender.com/api/sync/schedule/${patientPhone}`);
      setSchedule(response.data);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleTakeMedicine = async (id) => {
    try {
      await axios.patch(`https://medguard-backend-rwlh.onrender.com/api/sync/schedule/${id}/take`);
      fetchSchedule(); 
    } catch (error) { alert("Failed to update status."); }
  };

  const handleSOS = () => {
    setIsSendingSOS(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = `${position.coords.latitude},${position.coords.longitude}`;
          try {
            await axios.post('https://medguard-backend-rwlh.onrender.com/api/alerts/sos', { phone: patientPhone, location: coords });
            alert("🚨 SOS Sent! Your caretaker is being called and texted right now.");
          } catch (error) { alert("⚠️ Failed to send SOS. Check settings."); } 
          finally { setIsSendingSOS(false); }
        },
        (error) => { alert("⚠️ We need location permissions for SOS!"); setIsSendingSOS(false); }
      );
    } else {
      alert("⚠️ Geolocation is not supported by your browser.");
      setIsSendingSOS(false);
    }
  };

  const getLowStockAlerts = () => {
    const alerts = [];
    schedule.forEach(slot => {
      (slot.medications || []).forEach(med => {
        if (med.totalStock > 0 && med.totalStock <= (med.qty * 3)) {
          if (!alerts.find(a => a.name === med.name)) alerts.push({ name: med.name, stock: med.totalStock });
        }
      });
    });
    return alerts;
  };

  const lowStockAlerts = getLowStockAlerts();

  const openTimeEditor = (slot) => {
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
      const response = await axios.patch(`https://medguard-backend-rwlh.onrender.com/api/sync/schedule/${id}/time`, { newTime: formatted24h });
      setSchedule(schedule.map(slot => slot._id === id ? { ...slot, target_time: response.data.target_time } : slot));
      setEditingTimeId(null);
    } catch (error) { alert("Failed to update time."); }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await axios.put('https://medguard-backend-rwlh.onrender.com/api/auth/settings', { phone: patientPhone, caretakerPhone, reminderType });
      alert("✅ Preferences Saved!");
      setShowSettings(false);
    } catch (error) { alert("Failed to save settings."); } 
    finally { setIsSavingSettings(false); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 relative"> 
      {/* Increased padding-bottom to ensure the fixed bottom nav doesn't cover content */}
      
      {/* HEADER */}
      <header className="bg-blue-600 text-white p-6 md:p-8 rounded-b-3xl shadow-lg relative z-20">
        <div className="absolute top-6 right-6 flex bg-blue-700/50 rounded-lg p-1 border border-blue-500/50">
          <button onClick={() => handleLanguageChange('en')} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${appLang === 'en' ? 'bg-white text-blue-700' : 'text-blue-100 hover:text-white'}`}>EN</button>
          <button onClick={() => handleLanguageChange('te')} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${appLang === 'te' ? 'bg-white text-blue-700' : 'text-blue-100 hover:text-white'}`}>తె</button>
          <button onClick={() => handleLanguageChange('hi')} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${appLang === 'hi' ? 'bg-white text-blue-700' : 'text-blue-100 hover:text-white'}`}>हिं</button>
        </div>
        <h1 className="text-3xl font-bold pr-20">{t.greeting}, {patientName.split(' ')[0]}!</h1>
        <p className="text-blue-100 mt-1 text-lg">{t.hub}</p>
      </header>

      {/* 🌟 1. SOS BUTTON & ALERTS MOVED DIRECTLY TO THE TOP 🌟 */}
      <div className="max-w-2xl mx-auto px-4 mt-[-15px] relative z-30">
        
        {/* HUGE SOS BUTTON */}
        <button 
          onClick={handleSOS} 
          disabled={isSendingSOS}
          className={`w-full py-4 px-6 rounded-2xl border-4 flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all ${isSendingSOS ? 'bg-red-400 border-red-500' : 'bg-red-600 border-red-700 hover:bg-red-500 animate-pulse'}`}
        >
          <span className="text-4xl">{isSendingSOS ? "📡" : "🚨"}</span>
          <span className="text-2xl font-black text-white tracking-widest uppercase">
            {isSendingSOS ? "Calling..." : t.sos}
          </span>
        </button>

        {/* LOW STOCK WARNINGS */}
        {lowStockAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg p-4 mt-3 border-2 border-white">
            <h3 className="text-white font-black text-lg tracking-wide shadow-sm flex items-center gap-2">
              <span>⚠️</span> Refill Required
            </h3>
            <p className="text-red-50 font-medium mt-1 text-sm leading-tight">
              Medicines finishing in 2-3 days. Please consult doctor.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {lowStockAlerts.map((alert, i) => (
                <span key={i} className="bg-white text-red-700 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  {alert.name}: {alert.stock} left
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAddReminder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm pt-20 overflow-y-auto">
          <div className="relative w-full max-w-md">
            <button onClick={() => setShowAddReminder(false)} className="absolute -top-3 -right-3 z-50 bg-red-500 text-white rounded-full w-10 h-10 font-bold shadow-lg">✕</button>
            <AddReminder patientPhone={patientPhone} onSuccess={() => { setShowAddReminder(false); fetchSchedule(); }} />
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.settings}</h2>
            <form onSubmit={saveSettings} className="space-y-6 mt-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-slate-700 font-bold mb-2">Reminder Preference</label>
                <select value={reminderType} onChange={(e) => setReminderType(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl bg-white text-lg font-bold">
                  <option value="call">📞 Automated Voice Call</option>
                  <option value="notification">📱 Push Notification Only</option>
                  <option value="none">🔕 Do Not Disturb</option>
                </select>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <label className="block text-red-800 font-bold mb-2">Emergency Caretaker Phone</label>
                <input type="tel" placeholder="e.g. 9876543210" value={caretakerPhone} onChange={(e) => setCaretakerPhone(e.target.value)} className="w-full p-3 border border-red-200 rounded-xl bg-white text-lg font-mono font-bold" />
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

      {/* 🌟 2. SCHEDULE LIST TAKES UP THE MAIN VIEW 🌟 */}
      <main className="p-4 mt-2 max-w-2xl mx-auto space-y-6">
        <h2 className="text-xl font-black text-slate-800 px-2 tracking-wide uppercase">{t.schedule}</h2>
        
        {schedule.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-3xl shadow-sm border border-slate-100">
            <span className="text-4xl block mb-4">🎉</span>
            <h2 className="text-xl font-bold text-slate-500">{t.noMeds}</h2>
          </div>
        ) : (
          schedule.map((slot) => {
            const isOutOfStock = (slot.medications || []).every(med => med.totalStock < med.qty);

            return (
              <div key={slot._id} className={`bg-white rounded-3xl shadow-md overflow-hidden border-l-[8px] mb-4 ${slot.status === 'taken' ? 'border-green-500' : isOutOfStock ? 'border-red-500' : 'border-amber-400'}`}>
                
                {/* TIME HEADER */}
                <div className="p-4 bg-slate-50 flex justify-between items-center border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {slot.time_slot === "Morning" ? "☀️" : slot.time_slot === "Afternoon" ? "🌤️" : "🌙"} {slot.time_slot}
                  </h2>
                  
                  {editingTimeId === slot._id ? (
                    <div className="flex items-center bg-white p-1 rounded-lg shadow-inner border border-slate-200">
                      <select value={editHour} onChange={e => setEditHour(e.target.value)} className="p-1 bg-transparent font-bold outline-none cursor-pointer">
                        {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="font-bold text-slate-400 mx-0.5">:</span>
                      <select value={editMinute} onChange={e => setEditMinute(e.target.value)} className="p-1 bg-transparent font-bold outline-none cursor-pointer">
                        {Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={editAmpm} onChange={e => setEditAmpm(e.target.value)} className="p-1 bg-transparent font-bold text-blue-600 outline-none cursor-pointer">
                        <option value="AM">AM</option><option value="PM">PM</option>
                      </select>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => saveCustomTime(slot._id)} className="bg-blue-600 text-white px-2 py-1 rounded font-bold text-xs">Save</button>
                        <button onClick={() => setEditingTimeId(null)} className="bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold text-xs">✕</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => openTimeEditor(slot)} className="text-slate-600 font-bold hover:text-blue-600 bg-slate-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                      {slot.target_time || "12:00 AM"} <span className="text-xs opacity-50">✏️</span>
                    </button>
                  )}
                </div>

                {/* PILLS */}
                <div className="p-4 space-y-3">
                  {(slot.medications || []).map((med, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-xl">
                      {slot.photo ? (
                        <img src={slot.photo} alt="Pill" className="w-16 h-16 object-cover rounded-lg shadow-sm border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center text-3xl shrink-0">💊</div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">{med.name}</h3>
                        <div className="mt-1 flex gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">{med.qty} {t.pills}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${med.totalStock > 0 ? 'bg-slate-200 text-slate-600' : 'bg-red-100 text-red-600'}`}>Left: {med.totalStock}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ACTION BUTTON */}
                <div className="p-4 pt-0">
                  {isOutOfStock ? (
                    <div className="w-full py-3 text-center rounded-xl bg-red-100 border-2 border-red-200 text-red-700 font-bold uppercase tracking-wide">
                      ❌ Out of Stock
                    </div>
                  ) : slot.status !== 'taken' ? (
                    <button onClick={() => handleTakeMedicine(slot._id)} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-md active:scale-95 transition-transform">
                      {t.tookIt}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* 🌟 3. APP-STYLE BOTTOM NAVIGATION BAR 🌟 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe">
        <div className="flex justify-between items-center max-w-md mx-auto h-16">
          <button onClick={() => setShowAddReminder(true)} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-600 active:scale-90 transition-transform">
            <span className="text-2xl">➕</span>
            <span className="text-[10px] font-bold">Add Med</span>
          </button>
          
          <button onClick={() => navigate('/blood-network')} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-red-500 active:scale-90 transition-transform">
            <span className="text-2xl">🩸</span>
            <span className="text-[10px] font-bold">Blood</span>
          </button>

          <button onClick={() => navigate('/family')} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-500 active:scale-90 transition-transform">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <span className="text-[10px] font-bold">Family</span>
          </button>

          <button onClick={() => navigate('/find-clinic')} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-500 active:scale-90 transition-transform">
            <span className="text-2xl">🏥</span>
            <span className="text-[10px] font-bold">Clinic</span>
          </button>

          <button onClick={() => setShowSettings(true)} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800 active:scale-90 transition-transform">
            <span className="text-2xl">⚙️</span>
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      </nav>

    </div>
  );
};

export default VisualDashboard;