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
  
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiImage, setAiImage] = useState(null);

  const [caretakerPhone, setCaretakerPhone] = useState('');
  const [reminderType, setReminderType] = useState('call');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [editingTimeId, setEditingTimeId] = useState(null);
  const [editHour, setEditHour] = useState('12');
  const [editMinute, setEditMinute] = useState('00');
  const [editAmpm, setEditAmpm] = useState('AM');

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

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support voice recognition.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    // CRITICAL: Tells the browser which language to listen for based on your top-right toggle!
    recognition.lang = appLang === 'hi' ? 'hi-IN' : (appLang === 'te' ? 'te-IN' : 'en-US');
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    setIsListening(true);
    setTranscript(appLang === 'te' ? "వింటున్నాను... మాట్లాడండి" : appLang === 'hi' ? "सुन रहा हूँ..." : "Listening...");
    setAiResponse("");
    setAiImage(null); 
    window.speechSynthesis.cancel(); 

    recognition.start();

    recognition.onresult = (event) => {
      // Clean punctuation so matching never fails
      let text = event.results[0][0].transcript.toLowerCase();
      text = text.replace(/[.,?!]/g, ""); 
      
      setTranscript(`"${text}"`);
      generateAiResponse(text);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setTranscript(appLang === 'te' ? "సరిగ్గా వినపడలేదు. మళ్ళీ మైక్ నొక్కండి." : "Could not hear you. Please try again.");
      setIsListening(false);
    };
  };

  // 🌟 BULLETPROOF MULTILINGUAL MATCHER 🌟
  const generateAiResponse = (text) => {
    let reply = "";
    let image = null;
    
    const isMatch = (keywords) => keywords.some(word => text.includes(word));

    // 1. STOMACH ACHE (Must check before headache to avoid overlap!)
    if (isMatch(["stomach", "pet dard", "पेट", "కడుపు", "కడుపునొప్పి", "kadupu", "kadupulo", "acidity", "gas"])) {
      image = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Pill_bottle_and_pills.jpg/640px-Pill_bottle_and_pills.jpg"; 
      if (appLang === 'te') reply = "కడుపు నొప్పికి, గోరువెచ్చని నీరు త్రాగండి. కారం తక్కువగా తినండి. గ్యాస్ అనిపిస్తే యాంటాసిడ్ తీసుకోండి.";
      else if (appLang === 'hi') reply = "पेट दर्द के लिए, गर्म पानी पिएं। मसालेदार खाना न खाएं। एसिडिटी हो तो एंटासिड ले सकते हैं।";
      else reply = "For a stomach ache, drink warm water or chamomile tea. Avoid spicy foods. An antacid might help if it feels like acidity.";
    } 
    // 2. HEADACHE
    else if (isMatch(["headache", "head ache", "sir dard", "सिर", "తలనొప్పి", "తల నొప్పి", "tala", "thalanoppi"])) {
      image = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Paracetamol_tablets.jpg/640px-Paracetamol_tablets.jpg"; 
      if (appLang === 'te') reply = "తలనొప్పికి, నిశ్శబ్దంగా ఉన్న గదిలో విశ్రాంతి తీసుకోండి మరియు నీరు త్రాగండి. నొప్పి ఎక్కువగా ఉంటే పారాసెటమాల్ వేసుకోండి.";
      else if (appLang === 'hi') reply = "सिर दर्द के लिए, आराम करें और पानी पिएं। अगर दर्द ज्यादा है, तो पेरासिटामोल ले सकते हैं।";
      else reply = "For a headache, try resting in a quiet dark room and drinking a glass of water. If severe, a basic painkiller like Paracetamol can help.";
    } 
    // 3. FEVER
    else if (isMatch(["fever", "temperature", "bukhar", "बुखार", "జ్వరం", "jwaram", "jaram", "vediga"])) {
      image = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Paracetamol_tablets.jpg/640px-Paracetamol_tablets.jpg"; 
      if (appLang === 'te') reply = "జ్వరానికి, బాగా విశ్రాంతి తీసుకోండి మరియు నీరు త్రాగండి. జ్వరం తగ్గడానికి డోలో 650 (Dolo 650) వేసుకోండి. మూడు రోజుల కంటే ఎక్కువ ఉంటే డాక్టర్‌ను సంప్రదించండి.";
      else if (appLang === 'hi') reply = "बुखार के लिए, आराम करें और पानी पिएं। आप डोलो 650 (Dolo 650) ले सकते हैं। 3 दिन से ज्यादा हो तो डॉक्टर को दिखाएं।";
      else reply = "For a fever, get plenty of rest and stay hydrated. You can take Dolo 650 to bring the temperature down. See a doctor if it lasts over 3 days.";
    } 
    // 4. COLD & COUGH
    else if (isMatch(["cold", "cough", "khasi", "khaasi", "खांसी", "దగ్గు", "జలుబు", "daggu", "jalubu", "sneeze", "tummulu"])) {
      image = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Cough_Medicine_in_Measuring_Cup.jpg/640px-Cough_Medicine_in_Measuring_Cup.jpg"; 
      if (appLang === 'te') reply = "జలుబు లేదా దగ్గు కోసం, ఆవిరి పట్టుకోండి మరియు గోరువెచ్చని ఉప్పు నీటితో పుక్కిలించండి. అల్లం మరియు తేనె కూడా మంచిది.";
      else if (appLang === 'hi') reply = "सर्दी या खांसी के लिए, भाप लें और गर्म नमक पानी से गरारे करें। अदरक और शहद भी आराम देगा।";
      else reply = "For a cold or cough, do steam inhalation and gargle with warm salt water. Honey and ginger can also soothe your throat.";
    } 
    // 5. WOUND / BLEEDING
    else if (isMatch(["cut", "bleeding", "blood", "khoon", "खून", "రక్తం", "గాయం", "debba", "raktam", "gayam"])) {
      image = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Adhesive_bandage_-_20111124.jpg/640px-Adhesive_bandage_-_20111124.jpg"; 
      if (appLang === 'te') reply = "గాయాన్ని వెంటనే శుభ్రమైన నీటితో కడగండి, యాంటిసెప్టిక్ రాయండి మరియు కట్టు కట్టండి. రక్తం ఆగకపోతే డాక్టర్‌ను కలవండి.";
      else if (appLang === 'hi') reply = "घाव को तुरंत साफ पानी से धो लें, एंटीसेप्टिक लगाएं और पट्टी बांधें। खून न रुके तो डॉक्टर के पास जाएं।";
      else reply = "Wash the wound immediately with clean water, apply an antiseptic, and bandage it tightly. Seek medical help if the bleeding does not stop.";
    } 
    // DEFAULT FALLBACK
    else {
      image = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Pills_1.jpg/640px-Pills_1.jpg"; 
      if (appLang === 'te') reply = "నేను విశ్రాంతి తీసుకోవాలని మరియు ద్రవాలు త్రాగాలని సిఫార్సు చేస్తున్నాను. లక్షణాలు తగ్గకపోతే, దయచేసి వైద్యుడిని సంప్రదించండి.";
      else if (appLang === 'hi') reply = "मैं आराम करने और पानी पीने की सलाह देता हूं। यदि समस्या बनी रहती है, तो कृपया डॉक्टर से परामर्श लें।";
      else reply = "I recommend resting and drinking plenty of fluids. If symptoms persist, please consult a doctor.";
    }

    setAiResponse(reply);
    setAiImage(image);

    const utterance = new SpeechSynthesisUtterance(reply);
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    if (appLang === 'te') {
      utterance.lang = 'te-IN';
      selectedVoice = voices.find(v => v.lang.includes('te'));
    } else if (appLang === 'hi') {
      utterance.lang = 'hi-IN';
      selectedVoice = voices.find(v => v.lang.includes('hi'));
    } else {
      utterance.lang = 'en-IN';
      selectedVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'en-US');
    }
    
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
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
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24 relative"> 
      
      {/* HEADER */}
      <header className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 md:p-8 rounded-b-[2.5rem] shadow-[0_10px_30px_rgba(79,70,229,0.2)] relative z-20 pb-12">
        <div className="absolute top-6 right-6 flex bg-black/10 rounded-full p-1 border border-white/20 backdrop-blur-sm">
          <button onClick={() => handleLanguageChange('en')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${appLang === 'en' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-50 hover:text-white'}`}>EN</button>
          <button onClick={() => handleLanguageChange('te')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${appLang === 'te' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-50 hover:text-white'}`}>తె</button>
          <button onClick={() => handleLanguageChange('hi')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${appLang === 'hi' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-50 hover:text-white'}`}>हिं</button>
        </div>
        <h1 className="text-3xl font-black pr-24 tracking-tight">{t.greeting}, <br/>{patientName.split(' ')[0]}!</h1>
        <p className="text-blue-100 mt-2 text-sm font-medium opacity-90">{t.hub}</p>
      </header>

      {/* ACTION CARDS */}
      <div className="max-w-2xl mx-auto px-5 mt-[-2rem] relative z-30 flex flex-col gap-4">
        
        <button 
          onClick={handleSOS} 
          disabled={isSendingSOS}
          className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all duration-300 ${isSendingSOS ? 'bg-red-400 text-white' : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30 hover:shadow-red-500/50'}`}
        >
          <span className="text-3xl drop-shadow-md">{isSendingSOS ? "📡" : "🚨"}</span>
          <span className="text-xl font-black tracking-widest uppercase drop-shadow-md">
            {isSendingSOS ? "Calling..." : t.sos}
          </span>
        </button>

        <button 
          onClick={() => setShowVoiceAssistant(true)} 
          className="w-full py-4 px-6 rounded-2xl bg-white border border-indigo-50 flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.04)] active:scale-95 transition-all group hover:border-indigo-100"
        >
          <div className="bg-indigo-50 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <span className="text-xl">🎙️</span>
          </div>
          <span className="text-lg font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">Ask AI Assistant</span>
        </button>

        {lowStockAlerts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-5 border-l-4 border-orange-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-500 text-xl">⚠️</span>
              <h3 className="text-slate-800 font-bold text-base">Refill Required Soon</h3>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-3">
              Medicines finishing in 2-3 days. Please consult your doctor.
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockAlerts.map((alert, i) => (
                <span key={i} className="bg-orange-50 text-orange-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-orange-100">
                  {alert.name} • {alert.stock} left
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VOICE ASSISTANT MODAL */}
      {showVoiceAssistant && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex justify-between items-center text-white">
              <h2 className="text-xl font-black tracking-wide">🎙️ Health Assistant</h2>
              <button onClick={() => { setShowVoiceAssistant(false); window.speechSynthesis.cancel(); }} className="bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center font-bold">✕</button>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center min-h-[350px]">
              <button 
                onClick={handleVoiceSearch}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all ${isListening ? 'bg-red-500 animate-pulse scale-110 shadow-red-500/50' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/40'}`}
              >
                <span className="text-white">{isListening ? "👂" : "🎤"}</span>
              </button>
              
              <p className="mt-6 text-lg font-bold text-slate-700 text-center min-h-[28px]">
                {transcript || (appLang === 'te' ? "మైక్ నొక్కి మాట్లాడండి" : appLang === 'hi' ? "माइक दबाएं और बोलें" : "Tap the mic and say: 'I have a fever'")}
              </p>

              {aiResponse && (
                <div className="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl w-full flex flex-col items-center text-center animate-fade-in">
                  {aiImage && (
                    <img 
                      src={aiImage} 
                      alt="Recommended Remedy" 
                      className="w-full h-36 object-cover rounded-xl mb-4 shadow-md border border-indigo-200"
                    />
                  )}
                  <p className="text-indigo-900 font-bold leading-relaxed">{aiResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                <button type="submit" disabled={isSavingSettings} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg">{isSavingSettings ? "Saving..." : "Save Config"}</button>
              </div>
              <button type="button" onClick={handleLogout} className="w-full py-4 mt-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2">
                <span className="text-xl">🚪</span> Secure Logout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE LIST */}
      <main className="p-5 mt-2 max-w-2xl mx-auto space-y-5">
        <h2 className="text-sm font-black text-slate-400 tracking-widest uppercase ml-1">{t.schedule}</h2>
        
        {schedule.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-3xl shadow-sm border border-slate-100">
            <span className="text-4xl block mb-4">🎉</span>
            <h2 className="text-lg font-bold text-slate-400">{t.noMeds}</h2>
          </div>
        ) : (
          schedule.map((slot) => {
            const isOutOfStock = (slot.medications || []).every(med => med.totalStock < med.qty);

            return (
              <div key={slot._id} className={`bg-white rounded-[1.5rem] shadow-[0_4px_15px_rgba(0,0,0,0.03)] overflow-hidden border border-slate-100 mb-5 relative`}>
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${slot.status === 'taken' ? 'bg-green-500' : isOutOfStock ? 'bg-red-500' : 'bg-amber-400'}`}></div>

                <div className="p-4 pl-6 bg-white flex justify-between items-center border-b border-slate-50">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    {slot.time_slot === "Morning" ? "☀️" : slot.time_slot === "Afternoon" ? "🌤️" : "🌙"} {slot.time_slot}
                  </h2>
                  
                  {editingTimeId === slot._id ? (
                    <div className="flex items-center bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <select value={editHour} onChange={e => setEditHour(e.target.value)} className="p-1 bg-transparent font-bold text-sm outline-none cursor-pointer">
                        {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="font-bold text-slate-400 mx-0.5">:</span>
                      <select value={editMinute} onChange={e => setEditMinute(e.target.value)} className="p-1 bg-transparent font-bold text-sm outline-none cursor-pointer">
                        {Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={editAmpm} onChange={e => setEditAmpm(e.target.value)} className="p-1 bg-transparent font-bold text-sm text-indigo-600 outline-none cursor-pointer">
                        <option value="AM">AM</option><option value="PM">PM</option>
                      </select>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => saveCustomTime(slot._id)} className="bg-indigo-600 text-white px-2 py-1 rounded md font-bold text-xs">Save</button>
                        <button onClick={() => setEditingTimeId(null)} className="bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-bold text-xs">✕</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => openTimeEditor(slot)} className="text-indigo-600 font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 bg-indigo-50/50">
                      {slot.target_time || "12:00 AM"} <span className="text-xs opacity-50">✏️</span>
                    </button>
                  )}
                </div>

                <div className="p-4 pl-6 space-y-3">
                  {(slot.medications || []).map((med, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      {slot.photo ? (
                        <img src={slot.photo} alt="Pill" className="w-14 h-14 object-cover rounded-xl shadow-sm border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-2xl shrink-0">💊</div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-slate-800 leading-tight">{med.name}</h3>
                        <div className="mt-1.5 flex gap-2">
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide">{med.qty} {t.pills}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide ${med.totalStock > 0 ? 'bg-slate-200 text-slate-600' : 'bg-red-100 text-red-600'}`}>Left: {med.totalStock}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 pl-6 pt-1">
                  {isOutOfStock ? (
                    <div className="w-full py-3.5 text-center rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold tracking-wide">
                      ❌ Out of Stock
                    </div>
                  ) : slot.status !== 'taken' ? (
                    <button onClick={() => handleTakeMedicine(slot._id)} className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-lg shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2">
                      <span className="text-xl">✓</span> {t.tookIt}
                    </button>
                  ) : (
                    <div className="w-full py-3.5 text-center rounded-xl bg-green-50 text-green-600 font-bold tracking-wide flex items-center justify-center gap-2">
                      <span className="text-xl">✅</span> Medicine Taken
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* SLEEK BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-40 px-2 pb-safe">
        <div className="flex justify-between items-center max-w-md mx-auto h-16 px-2">
          <button onClick={() => setShowAddReminder(true)} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-600 active:scale-90 transition-transform">
            <span className="text-2xl">➕</span>
            <span className="text-[10px] font-bold">Add Med</span>
          </button>
          
          <button onClick={() => navigate('/blood-network')} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-rose-500 active:scale-90 transition-transform">
            <span className="text-2xl">🩸</span>
            <span className="text-[10px] font-bold">Blood</span>
          </button>

          <button onClick={() => navigate('/family')} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-500 active:scale-90 transition-transform">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <span className="text-[10px] font-bold">Family</span>
          </button>

          <button onClick={() => navigate('/find-clinic')} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-500 active:scale-90 transition-transform">
            <span className="text-2xl">🏥</span>
            <span className="text-[10px] font-bold">Clinic</span>
          </button>

          <button onClick={() => setShowSettings(true)} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-800 active:scale-90 transition-transform">
            <span className="text-2xl">⚙️</span>
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      </nav>

    </div>
  );
};

export default VisualDashboard;