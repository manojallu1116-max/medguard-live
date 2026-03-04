import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

// పర్యావరణంలో (environment) బయటి ఫైల్స్ సపోర్ట్ చేయనందున AddReminder ని ఇక్కడే మాక్ (mock) చేస్తున్నాను
const AddReminder = ({ patientPhone, onSuccess }) => {
  return (
    <div className="p-8 md:p-10 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-2xl">
      <div className="w-16 h-1 bg-slate-200 rounded-full mx-auto mb-8"></div>
      <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-3 tracking-tight">Add New Medicine</h3>
      <p className="text-sm md:text-base text-slate-500 mb-8 font-medium leading-relaxed">This is a mock component for preview purposes. External imports are not allowed in this environment.</p>
      <div className="flex justify-end gap-3">
        <button onClick={onSuccess} className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20">
          Save Medicine
        </button>
      </div>
    </div>
  );
};

const translations = {
  en: { 
    greeting: "Good Morning", hub: "Here is your health hub.", quickActions: "Quick Actions", 
    emergency: "Emergency Blood", family: "Family Observer", clinic: "Find Clinic", settings: "App Settings", 
    addMed: "Add Medicine", schedule: "Today's Schedule", noMeds: "No medicines scheduled!", 
    takeMeds: "Take", pills: "Pills", tookIt: "I Took It", taken: "Medicine Taken", sos: "SOS PANIC",
    askAi: "Ask AI Assistant", calling: "Calling...", 
    refillTitle: "Refill Required Soon", refillDesc: "Medicines finishing in 2-3 days. Please consult your doctor.",
    left: "Left", outOfStock: "Out of Stock",
    morning: "Morning", afternoon: "Afternoon", night: "Night",
    navAddMed: "Add Med", navBlood: "Blood", navFamily: "Family", navClinic: "Clinic", navSettings: "Settings",
    aiTitle: "Health Assistant", recommendedMeds: "Recommended Over-The-Counter Medicines:"
  },
  te: { 
    greeting: "శుభోదయం", hub: "ఇది మీ హెల్త్ హబ్.", quickActions: "త్వరిత చర్యలు", 
    emergency: "అత్యవసర రక్తం", family: "కుటుంబ పరిశీలకుడు", clinic: "క్లినిక్ కనుగొనండి", settings: "యాప్ సెట్టింగ్‌లు", 
    addMed: "మందు జోడించండి", schedule: "నేటి షెడ్యూల్", noMeds: "మందులు లేవు!", 
    takeMeds: "తీసుకోండి", pills: "మాత్రలు", tookIt: "నేను తీసుకున్నాను", taken: "మందు తీసుకున్నారు", sos: "SOS",
    askAi: "AI అసిస్టెంట్‌ని అడగండి", calling: "కాల్ చేస్తోంది...", 
    refillTitle: "త్వరలో రీఫిల్ అవసరం", refillDesc: "మందులు 2-3 రోజుల్లో పూర్తవుతాయి. దయచేసి మీ డాక్టర్‌ని సంప్రదించండి.",
    left: "మిగిలినవి", outOfStock: "స్టాక్ లేదు",
    morning: "ఉదయం", afternoon: "మధ్యాహ్నం", night: "రాత్రి",
    navAddMed: "మందులు", navBlood: "రక్తం", navFamily: "కుటుంబం", navClinic: "క్లినిక్", navSettings: "సెట్టింగ్స్",
    aiTitle: "హెల్త్ అసిస్టెంట్", recommendedMeds: "సూచించబడిన సాధారణ మందులు:"
  },
  hi: { 
    greeting: "सुप्रभात", hub: "यह आपका स्वास्थ्य केंद्र है।", quickActions: "त्वरित कार्रवाई", 
    emergency: "आपातकालीन रक्त", family: "परिवार पर्यवेक्षक", clinic: "क्लीनिक खोजें", settings: "ऐप सेटिंग्स", 
    addMed: "दवा जोड़ें", schedule: "आज की अनुसूची", noMeds: "कोई दवा नहीं!", 
    takeMeds: "लें", pills: "गोलियां", tookIt: "मैंने ले लिया", taken: "दवा ले ली गई", sos: "आपातकालीन",
    askAi: "AI असिस्टेंट से पूछें", calling: "कॉल कर रहा है...", 
    refillTitle: "जल्द ही रीफिल की आवश्यकता है", refillDesc: "दवाएं 2-3 दिनों में खत्म हो रही हैं। कृपया अपने डॉक्टर से सलाह लें।",
    left: "बचे हैं", outOfStock: "स्टॉक खत्म",
    morning: "सुबह", afternoon: "दोपहर", night: "रात",
    navAddMed: "दवाएं", navBlood: "रक्त", navFamily: "परिवार", navClinic: "क्लीनिक", navSettings: "सेटिंग्स",
    aiTitle: "हेल्थ असिस्टेंट", recommendedMeds: "अनुशंसित सामान्य दवाएं:"
  }
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
  const [aiEmoji, setAiEmoji] = useState(null); 
  const [aiMedicines, setAiMedicines] = useState([]); 

  const [caretakerPhone, setCaretakerPhone] = useState('');
  const [reminderType, setReminderType] = useState('call');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [editingTimeId, setEditingTimeId] = useState(null);
  const [editHour, setEditHour] = useState('12');
  const [editMinute, setEditMinute] = useState('00');
  const [editAmpm, setEditAmpm] = useState('AM');

  const [appLang, setAppLang] = useState(localStorage.getItem('appLang') || 'en');
  const t = translations[appLang] || translations['en'];
  
  const patientPhone = localStorage.getItem('patientPhone') || '1234567890';
  const patientName = localStorage.getItem('patientName') || 'Guest User';

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
          } catch (error) { alert("⚠️ Failed to send SOS."); } 
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
    recognition.lang = appLang === 'hi' ? 'hi-IN' : (appLang === 'te' ? 'te-IN' : 'en-US');
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    setIsListening(true);
    setTranscript(appLang === 'te' ? "వింటున్నాను... మాట్లాడండి" : appLang === 'hi' ? "सुन रहा हूँ..." : "Listening...");
    setAiResponse("");
    setAiEmoji(null); 
    setAiMedicines([]); 
    window.speechSynthesis.cancel(); 

    recognition.start();

    recognition.onresult = (event) => {
      let text = event.results[0][0].transcript.toLowerCase();
      text = text.replace(/[.,?!]/g, ""); 
      setTranscript(`"${text}"`);
      generateAiResponse(text, appLang);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setTranscript(appLang === 'te' ? "సరిగ్గా వినపడలేదు. మళ్ళీ మైక్ నొక్కండి." : "Could not hear you. Please try again.");
      setIsListening(false);
    };
  };

  const generateAiResponse = (text, currentLang) => {
    let reply = "";
    let emoji = "🏥"; 
    let recommendedMeds = []; 
    
    const isMatch = (keywords) => keywords.some(word => text.includes(word));

    if (isMatch(["stomach", "pet dard", "पेट", "కడుపు", "కడుపునొప్పి", "kadupu", "kadupulo", "acidity", "gas"])) {
      emoji = "🤢"; 
      if (currentLang === 'te') {
        reply = "కడుపు నొప్పికి, గోరువెచ్చని నీరు త్రాగండి. కారం తక్కువగా తినండి. గ్యాస్ అనిపిస్తే యాంటాసిడ్ తీసుకోండి.";
        recommendedMeds = [{ name: "Gelusil / Digene", desc: "గ్యాస్ మరియు ఎసిడిటీ నుండి ఉపశమనానికి." }, { name: "Pudin Hara", desc: "కడుపు నొప్పి మరియు జీర్ణక్రియ కోసం." }, { name: "Eno", desc: "తక్షణ గుండె మంట ఉపశమనం కోసం." }];
      } else if (currentLang === 'hi') {
        reply = "पेट दर्द के लिए, गर्म पानी पिएं। मसालेदार खाना न खाएं। एसिडिटी हो तो एंटासिड ले सकते हैं।";
        recommendedMeds = [{ name: "Gelusil / Digene", desc: "गैस और एसिडिटी से तुरंत राहत।" }, { name: "Pudin Hara", desc: "पेट दर्द और पाचन के लिए आयुर्वेदिक दवा।" }, { name: "Eno", desc: "सीने की जलन से तुरंत राहत।" }];
      } else {
        reply = "For a stomach ache, drink warm water or chamomile tea. Avoid spicy foods. An antacid might help if it feels like acidity.";
        recommendedMeds = [{ name: "Gelusil / Digene", desc: "Antacid liquid for quick gas and acidity relief." }, { name: "Pudin Hara", desc: "Ayurvedic pearls for stomach ache and digestion." }, { name: "Eno", desc: "Fruit salt for instant heartburn relief." }];
      }
    } 
    else if (isMatch(["headache", "head ache", "sir dard", "सिर", "తలనొప్పి", "తల నొప్పి", "tala", "thalanoppi", "noppi"])) {
      emoji = "🤕"; 
      if (currentLang === 'te') {
        reply = "తలనొప్పికి, నిశ్శబ్దంగా ఉన్న గదిలో విశ్రాంతి తీసుకోండి మరియు నీరు త్రాగండి. నొప్పి ఎక్కువగా ఉంటే పారాసెటమాల్ వేసుకోండి.";
        recommendedMeds = [{ name: "Saridon", desc: "తీవ్రమైన తలనొప్పికి తక్షణ నివారణ." }, { name: "Crocin", desc: "సాధారణ తలనొప్పికి పారాసెటమాల్ టాబ్లెట్." }, { name: "Disprin", desc: "తక్షణ ఉపశమనం కోసం నీటిలో కరిగే టాబ్లెట్." }];
      } else if (currentLang === 'hi') {
        reply = "सिर दर्द के लिए, आराम करें और पानी पिएं। अगर दर्द ज्यादा है, तो पेरासिटामोल ले सकते हैं।";
        recommendedMeds = [{ name: "Saridon", desc: "गंभीर सिरदर्द के लिए तेजी से काम करने वाली दवा।" }, { name: "Crocin", desc: "सामान्य सिरदर्द के लिए पेरासिटामोल गोली।" }, { name: "Disprin", desc: "तुरंत राहत के लिए पानी में घुलनशील गोली।" }];
      } else {
        reply = "For a headache, try resting in a quiet dark room and drinking a glass of water. If severe, a basic painkiller like Paracetamol can help.";
        recommendedMeds = [{ name: "Saridon", desc: "Fast-acting remedy for severe headaches." }, { name: "Crocin", desc: "Paracetamol-based tablet for standard headaches." }, { name: "Disprin", desc: "Water-soluble tablet for instant relief." }];
      }
    } 
    else if (isMatch(["fever", "temperature", "bukhar", "बुखार", "జ్వరం", "jwaram", "jaram", "vediga"])) {
      emoji = "🤒"; 
      if (currentLang === 'te') {
        reply = "జ్వరానికి, బాగా విశ్రాంతి తీసుకోండి మరియు నీరు త్రాగండి. జ్వరం తగ్గడానికి డోలో 650 వేసుకోండి. మూడు రోజుల కంటే ఎక్కువ ఉంటే డాక్టర్‌ను సంప్రదించండి.";
        recommendedMeds = [{ name: "Dolo 650", desc: "అధిక జ్వరం మరియు ఒళ్ళు నొప్పులకు ఉత్తమమైనది." }, { name: "Paracetamol", desc: "జ్వరం తగ్గించడానికి సాధారణ మందు." }, { name: "Calpol", desc: "జ్వరానికి ప్రత్యామ్నాయ మందు." }];
      } else if (currentLang === 'hi') {
        reply = "बुखार के लिए, आराम करें और पानी पिएं। आप डोलो 650 ले सकते हैं। 3 दिन से ज्यादा हो调 तो डॉक्टर को दिखाएं।";
        recommendedMeds = [{ name: "Dolo 650", desc: "तेज बुखार और बदन दर्द के लिए सबसे अच्छा।" }, { name: "Paracetamol", desc: "मानक बुखार कम करने वाली दवा।" }, { name: "Calpol", desc: "बुखार के लिए वैकल्पिक पेरासिटामोल गोली।" }];
      } else {
        reply = "For a fever, get plenty of rest and stay hydrated. You can take Dolo 650 to bring the temperature down. See a doctor if it lasts over 3 days.";
        recommendedMeds = [{ name: "Dolo 650", desc: "Best for high fever and body ache." }, { name: "Paracetamol", desc: "Standard fever reducer." }, { name: "Calpol", desc: "Alternative paracetamol tablet for fever." }];
      }
    } 
    else if (isMatch(["cold", "cough", "khasi", "khaasi", "खांसी", "దగ్గు", "జలుబు", "daggu", "jalubu", "sneeze", "tummulu"])) {
      emoji = "🤧"; 
      if (currentLang === 'te') {
        reply = "జలుబు లేదా దగ్గు కోసం, ఆవిరి పట్టుకోండి మరియు గోరువెచ్చని ఉప్పు నీటితో పుక్కిలించండి. అల్లం మరియు తేనె కూడా మంచిది.";
        recommendedMeds = [{ name: "Honitus Syrup", desc: "గొంతు ఉపశమనం కోసం ఆయుర్వేద సిరప్." }, { name: "Vicks Action 500", desc: "ముక్కు దిబ్బడ మరియు జలుబు కోసం టాబ్లెట్." }, { name: "Benadryl", desc: "పొడి దగ్గు మరియు అలెర్జీలకు సిరప్." }];
      } else if (currentLang === 'hi') {
        reply = "सर्दी या खांसी के लिए, भाप लें और गर्म नमक पानी से गरारे करें। अदरक और शहद भी आराम देगा।";
        recommendedMeds = [{ name: "Honitus Syrup", desc: "गले की राहत के लिए आयुर्वेदिक सिरप।" }, { name: "Vicks Action 500", desc: "बंद नाक और सर्दी के लिए गोली।" }, { name: "Benadryl", desc: "सूखी खांसी और एलर्जी के लिए सिरप।" }];
      } else {
        reply = "For a cold or cough, do steam inhalation and gargle with warm salt water. Honey and ginger can also soothe your throat.";
        recommendedMeds = [{ name: "Honitus Syrup", desc: "Ayurvedic cough syrup for throat relief." }, { name: "Vicks Action 500", desc: "Tablet for blocked nose and cold." }, { name: "Benadryl", desc: "Syrup for dry cough and allergies." }];
      }
    } 
    else if (isMatch(["cut", "bleeding", "blood", "khoon", "खून", "రక్తం", "గాయం", "debba", "raktam", "gayam"])) {
      emoji = "🩹"; 
      if (currentLang === 'te') {
        reply = "గాయాన్ని వెంటనే శుభ్రమైన నీటితో కడగండి, యాంటిసెప్టిక్ రాయండి మరియు కట్టు కట్టండి. రక్తం ఆగకపోతే డాక్టర్‌ను కలవండి.";
        recommendedMeds = [{ name: "Betadine Ointment", desc: "గాయాల కోసం యాంటిసెప్టిక్ క్రీమ్." }, { name: "Dettol Liquid", desc: "గాయాన్ని కడగడానికి మరియు శుభ్రం చేయడానికి." }, { name: "Band-Aid", desc: "గాయాన్ని కప్పడానికి అంటుకునే బ్యాండేజ్." }];
      } else if (currentLang === 'hi') {
        reply = "घाव को तुरंत साफ पानी से धो लें, एंटीसेप्टिक लगाएं और पट्टी बांधें। खून न रुके तो डॉक्टर के पास जाएं।";
        recommendedMeds = [{ name: "Betadine Ointment", desc: "घावों के लिए एंटीसेप्टिक क्रीम।" }, { name: "Dettol Liquid", desc: "घाव धोने और साफ करने के लिए।" }, { name: "Band-Aid", desc: "घाव को ढकने के लिए पट्टी।" }];
      } else {
        reply = "Wash the wound immediately with clean water, apply an antiseptic, and bandage it tightly. Seek medical help if the bleeding does not stop.";
        recommendedMeds = [{ name: "Betadine Ointment", desc: "Medical antiseptic cream for wounds." }, { name: "Dettol Antiseptic Liquid", desc: "Used to wash and clean the cut." }, { name: "Band-Aid Washproof", desc: "Adhesive bandage to cover the wound." }];
      }
    } 
    else {
      emoji = "💊"; 
      recommendedMeds = []; 
      if (currentLang === 'te') reply = "నేను విశ్రాంతి తీసుకోవాలని మరియు ద్రవాలు త్రాగాలని సిఫార్సు చేస్తున్నాను. లక్షణాలు తగ్గకపోతే, దయచేసి వైద్యుడిని సంప్రదించండి.";
      else if (currentLang === 'hi') reply = "मैं आराम करने और पानी पीने की सलाह देता हूं। यदि समस्या बनी रहती है, तो कृपया डॉक्टर से परामर्श लें।";
      else reply = "I recommend resting and drinking plenty of fluids. If symptoms persist, please consult a doctor.";
    }

    setAiResponse(reply);
    setAiEmoji(emoji); 
    setAiMedicines(recommendedMeds); 

    const utterance = new SpeechSynthesisUtterance(reply);
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    if (currentLang === 'te') {
      utterance.lang = 'te-IN';
      selectedVoice = voices.find(v => v.lang.includes('te'));
    } else if (currentLang === 'hi') {
      utterance.lang = 'hi-IN';
      selectedVoice = voices.find(v => v.lang.includes('hi'));
    } else {
      utterance.lang = 'en-IN';
      selectedVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'en-US');
    }
    
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "12:00 AM";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hInt = parseInt(parts[0], 10);
    const mStr = parts[1];
    const ampm = hInt >= 12 ? 'PM' : 'AM';
    if (hInt > 12) hInt -= 12;
    if (hInt === 0) hInt = 12;
    return `${hInt.toString().padStart(2, '0')}:${mStr} ${ampm}`;
  };

  const openTimeEditor = (slot) => {
    let target = slot.target_time || "12:00"; 
    let hr = "12", min = "00", ampm = "AM";

    if (target.includes("AM") || target.includes("PM")) {
      const [timePart, ampmPart] = target.split(' ');
      const [h, m] = timePart.split(':');
      hr = h; min = m; ampm = ampmPart;
    } else {
      const [h, m] = target.split(':');
      let hInt = parseInt(h, 10);
      if (!isNaN(hInt)) {
        if (hInt >= 12) { ampm = "PM"; if (hInt > 12) hInt -= 12; } 
        else { ampm = "AM"; if (hInt === 0) hInt = 12; }
        hr = hInt.toString();
      }
      min = m || "00";
    }

    setEditHour(hr.padStart(2, '0'));
    setEditMinute(min.padStart(2, '0'));
    setEditAmpm(ampm);
    setEditingTimeId(slot._id);
  };

  const saveCustomTime = async (id) => {
    let h24 = parseInt(editHour, 10);
    if (editAmpm === 'PM' && h24 !== 12) h24 += 12;
    if (editAmpm === 'AM' && h24 === 12) h24 = 0;
    const formatted24h = `${h24.toString().padStart(2, '0')}:${editMinute}`;
    
    setSchedule(schedule.map(slot => slot._id === id ? { ...slot, target_time: formatted24h } : slot));
    setEditingTimeId(null);
    
    try {
      await axios.patch(`https://medguard-backend-rwlh.onrender.com/api/sync/schedule/${id}/time`, { newTime: formatted24h });
    } catch (error) { console.error("Failed to sync new time to server."); }
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

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-xl text-indigo-900/60 tracking-widest uppercase">Loading Hub...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-indigo-50 font-sans pb-32 relative selection:bg-indigo-200 overflow-x-hidden"> 
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-[600px] h-[600px] bg-purple-300/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-50 animate-blob animation-delay-4000"></div>

      {/* Modern Glass Header */}
      <header className="relative z-20 px-6 pt-12 pb-8 md:p-14 md:pb-12 max-w-7xl mx-auto md:mt-6 backdrop-blur-3xl bg-white/40 border border-white/60 md:rounded-[3rem] rounded-b-[3rem] shadow-[0_8px_32px_rgba(31,38,135,0.05)]">
        <div className="absolute top-6 right-6 flex bg-white/50 rounded-full p-1.5 border border-white/80 backdrop-blur-xl shadow-sm z-30">
          <button onClick={() => handleLanguageChange('en')} className={`px-4 py-2 rounded-full text-xs font-black transition-all duration-300 ${appLang === 'en' ? 'bg-slate-800 text-white shadow-md scale-105' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>EN</button>
          <button onClick={() => handleLanguageChange('te')} className={`px-4 py-2 rounded-full text-xs font-black transition-all duration-300 ${appLang === 'te' ? 'bg-slate-800 text-white shadow-md scale-105' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>తె</button>
          <button onClick={() => handleLanguageChange('hi')} className={`px-4 py-2 rounded-full text-xs font-black transition-all duration-300 ${appLang === 'hi' ? 'bg-slate-800 text-white shadow-md scale-105' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>हिं</button>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100/50 border border-indigo-200/50 text-indigo-800 text-xs font-black tracking-widest uppercase mb-4 backdrop-blur-sm">
            Health Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 pr-24 tracking-tighter leading-[1.1] drop-shadow-sm">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600">{t.greeting},</span> <br className="md:hidden" />{patientName.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 mt-4 text-base md:text-xl font-medium max-w-md leading-relaxed">{t.hub}</p>
        </div>
      </header>

      {/* Floating Action Cards */}
      <div className="max-w-5xl mx-auto px-5 mt-[-2.5rem] md:mt-[-3.5rem] relative z-30 flex flex-col md:flex-row gap-4 md:gap-6">
        <button onClick={handleSOS} disabled={isSendingSOS} className={`group flex-1 py-5 md:py-8 px-6 rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] hover:-translate-y-1.5 transition-all duration-400 overflow-hidden relative ${isSendingSOS ? 'bg-red-400 text-white' : 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/30'}`}>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          <span className="text-4xl md:text-5xl drop-shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-300">{isSendingSOS ? "📡" : "🚨"}</span>
          <span className="text-xl md:text-2xl font-black tracking-widest uppercase drop-shadow-md relative z-10">{isSendingSOS ? t.calling : t.sos}</span>
        </button>

        <button onClick={() => setShowVoiceAssistant(true)} className="group flex-1 py-5 md:py-8 px-6 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/80 flex items-center justify-center gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] active:scale-[0.98] hover:-translate-y-1.5 transition-all duration-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10">
            <span className="text-xl md:text-2xl text-white">🎙️</span>
          </div>
          <span className="text-lg md:text-2xl font-black text-slate-700 group-hover:text-indigo-900 transition-colors relative z-10">{t.askAi}</span>
        </button>
      </div>

      {/* AI Voice Assistant Modal - Soft Glass UI */}
      {showVoiceAssistant && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-end md:items-center justify-center p-0 md:p-6 backdrop-blur-md transition-all">
          <div className="bg-white/90 backdrop-blur-3xl rounded-t-[2.5rem] md:rounded-[3rem] border border-white shadow-2xl w-full max-w-xl overflow-hidden animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)] flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 pb-0 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl shadow-inner">✨</div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.aiTitle}</h2>
              </div>
              <button onClick={() => { setShowVoiceAssistant(false); window.speechSynthesis.cancel(); }} className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full w-10 h-10 flex items-center justify-center font-bold transition-colors">✕</button>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col items-center overflow-y-auto">
              <div className="relative">
                {isListening && <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 scale-150"></div>}
                <button onClick={handleVoiceSearch} className={`relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-2xl transition-all duration-300 shrink-0 ${isListening ? 'bg-indigo-600 scale-105 shadow-indigo-600/50' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30 hover:scale-105'}`}>
                  <span className="text-white drop-shadow-md">{isListening ? "👂" : "🎤"}</span>
                </button>
              </div>
              
              <p className="mt-8 text-lg md:text-xl font-bold text-slate-500 text-center min-h-[32px] px-4 max-w-sm leading-relaxed">
                {transcript || (appLang === 'te' ? "మైక్ నొక్కి మాట్లాడండి" : appLang === 'hi' ? "माइक दबाएं और बोलें" : "Tap the mic and say: 'I have a fever'")}
              </p>

              {aiResponse && (
                <div className="mt-8 p-6 md:p-8 bg-indigo-50/50 backdrop-blur-sm border border-indigo-100/60 rounded-[2rem] w-full flex flex-col items-center text-center shadow-inner transition-all">
                  
                  {aiEmoji && (
                    <div className="bg-white w-20 h-20 md:w-24 md:h-24 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center mb-6 transform hover:scale-110 transition-transform duration-300">
                      <span className="text-5xl md:text-6xl drop-shadow-sm">{aiEmoji}</span>
                    </div>
                  )}
                  
                  <p className="text-slate-800 font-bold leading-relaxed text-base md:text-lg max-w-md">{aiResponse}</p>

                  {aiMedicines.length > 0 && (
                    <div className="mt-8 w-full bg-white/80 p-5 md:p-6 rounded-[1.5rem] border border-white shadow-sm text-left">
                      <p className="text-xs md:text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 md:mb-5 flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-50 rounded-lg">🩺</span> {t.recommendedMeds}
                      </p>
                      <div className="flex flex-col gap-3">
                        {aiMedicines.map((med, idx) => (
                          <a 
                            key={idx} 
                            href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(med.name + " medicine")}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                          >
                            <div className="bg-white w-12 h-12 rounded-[1rem] shadow-sm flex items-center justify-center text-2xl shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
                              💊
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-700 transition-colors">{med.name}</p>
                              <p className="text-xs font-bold text-slate-400 mt-1.5 leading-tight">{med.desc}</p>
                            </div>
                            <div className="text-slate-300 group-hover:text-indigo-400 transition-colors text-2xl">
                              ↗
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminder && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all">
          <div className="relative w-full max-w-xl animate-[slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <button onClick={() => setShowAddReminder(false)} className="absolute -top-5 -right-5 z-50 bg-slate-900 hover:bg-slate-800 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-xl transition-transform hover:scale-110 border-4 border-white">✕</button>
            <AddReminder patientPhone={patientPhone} onSuccess={() => { setShowAddReminder(false); fetchSchedule(); }} />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-2xl p-8 md:p-10 max-w-xl w-full animate-[slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="w-16 h-1 bg-slate-200 rounded-full mx-auto mb-8"></div>
            <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">{t.settings}</h2>
            <form onSubmit={saveSettings} className="space-y-6">
              <div className="bg-slate-50/80 backdrop-blur-sm p-5 md:p-6 rounded-[1.5rem] border border-slate-200/60 transition-colors focus-within:border-indigo-300 focus-within:bg-white shadow-sm">
                <label className="block text-slate-600 font-bold mb-3 uppercase tracking-widest text-xs">Reminder Preference</label>
                <select value={reminderType} onChange={(e) => setReminderType(e.target.value)} className="w-full p-0 bg-transparent text-lg font-bold text-slate-800 outline-none cursor-pointer">
                  <option value="call">📞 Automated Voice Call</option>
                  <option value="notification">📱 Push Notification Only</option>
                  <option value="none">🔕 Do Not Disturb</option>
                </select>
              </div>
              <div className="bg-rose-50/50 backdrop-blur-sm p-5 md:p-6 rounded-[1.5rem] border border-rose-100 transition-colors focus-within:border-rose-300 focus-within:bg-white shadow-sm">
                <label className="block text-rose-600 font-bold mb-3 uppercase tracking-widest text-xs">Emergency Caretaker</label>
                <input type="tel" placeholder="e.g. 9876543210" value={caretakerPhone} onChange={(e) => setCaretakerPhone(e.target.value)} className="w-full p-0 bg-transparent text-lg font-mono font-bold text-slate-800 outline-none placeholder:text-slate-300" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowSettings(false)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-[1.25rem] transition-colors">Cancel</button>
                <button type="submit" disabled={isSavingSettings} className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-[1.25rem] shadow-xl shadow-slate-900/20 transition-all active:scale-95">{isSavingSettings ? "Saving..." : "Save Config"}</button>
              </div>
              <button type="button" onClick={handleLogout} className="w-full py-4 mt-2 bg-red-50/50 hover:bg-red-50 border border-red-100 text-red-500 font-bold rounded-[1.25rem] flex items-center justify-center gap-3 transition-colors">
                <span className="text-xl">🚪</span> Secure Logout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Section - Premium Glass Cards */}
      <main className="p-5 md:p-8 mt-4 md:mt-8 max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-4 mb-6 md:mb-8 ml-2">
          <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
          <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">{t.schedule}</h2>
        </div>
        
        {schedule.length === 0 ? (
          <div className="text-center p-12 md:p-20 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] max-w-2xl mx-auto">
            <span className="text-6xl block mb-6 drop-shadow-sm">🎉</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-600 tracking-tight">{t.noMeds}</h2>
            <p className="text-slate-400 mt-2 font-medium">You have a free schedule today!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {schedule.map((slot) => {
              const isOutOfStock = (slot.medications || []).every(med => med.totalStock < med.qty);
              const localizedTimeSlot = slot.time_slot === "Morning" ? t.morning : slot.time_slot === "Afternoon" ? t.afternoon : t.night;
              const timeIcon = slot.time_slot === "Morning" ? "☀️" : slot.time_slot === "Afternoon" ? "🌤️" : "🌙";
              
              // Dynamic Backgrounds for Time of Day
              const bgClass = slot.time_slot === "Morning" ? "bg-amber-50/30" : slot.time_slot === "Afternoon" ? "bg-orange-50/30" : "bg-indigo-50/30";

              return (
                <div key={slot._id} className={`rounded-[2.5rem] backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 relative flex flex-col h-full group overflow-hidden ${bgClass}`}>
                  
                  {/* Status Indicator Pip */}
                  <div className={`absolute right-6 top-6 w-3 h-3 rounded-full shadow-sm z-20 ${slot.status === 'taken' ? 'bg-emerald-400' : isOutOfStock ? 'bg-rose-400' : 'bg-amber-400 animate-pulse'}`}></div>

                  <div className="p-6 md:p-8 pb-4 relative z-10 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                      <span className="p-2.5 bg-white rounded-2xl shadow-sm">{timeIcon}</span> 
                      {localizedTimeSlot}
                    </h2>
                  </div>

                  {/* Time Editor / Display */}
                  <div className="px-6 md:px-8 mb-4 relative z-10">
                    {editingTimeId === slot._id ? (
                      <div className="flex items-center bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white shadow-sm inline-flex">
                        <select value={editHour} onChange={e => setEditHour(e.target.value)} className="p-1.5 bg-transparent font-black text-slate-700 text-base outline-none cursor-pointer appearance-none text-center">
                          {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="font-black text-slate-300 mx-1">:</span>
                        <select value={editMinute} onChange={e => setEditMinute(e.target.value)} className="p-1.5 bg-transparent font-black text-slate-700 text-base outline-none cursor-pointer appearance-none text-center">
                          {Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select value={editAmpm} onChange={e => setEditAmpm(e.target.value)} className="p-1.5 bg-transparent font-black text-indigo-600 text-base outline-none cursor-pointer appearance-none text-center ml-1">
                          <option value="AM">AM</option><option value="PM">PM</option>
                        </select>
                        <div className="flex gap-1.5 ml-3">
                          <button onClick={() => saveCustomTime(slot._id)} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-md">Save</button>
                          <button onClick={() => setEditingTimeId(null)} className="bg-white hover:bg-slate-100 text-slate-500 px-3 py-2 rounded-xl font-bold text-xs transition-colors border border-slate-200">✕</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => openTimeEditor(slot)} className="text-indigo-600 font-black hover:bg-white/60 px-4 py-2 rounded-2xl transition-all flex items-center gap-3 bg-white/40 border border-white/50 shadow-sm backdrop-blur-sm group/btn">
                        {formatDisplayTime(slot.target_time)} 
                        <span className="text-sm opacity-40 group-hover/btn:opacity-100 transition-opacity bg-white p-1 rounded-md shadow-sm">✏️</span>
                      </button>
                    )}
                  </div>

                  {/* Medications List */}
                  <div className="px-6 md:px-8 space-y-4 flex-grow relative z-10">
                    {(slot.medications || []).map((med, idx) => (
                      <div key={idx} className="flex items-center gap-5 bg-white/60 hover:bg-white/90 backdrop-blur-md p-4 rounded-[1.5rem] border border-white shadow-sm transition-all duration-300">
                        {slot.photo ? (
                          <img src={slot.photo} alt="Pill" className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-[1.25rem] shadow-sm shrink-0 bg-white p-1" />
                        ) : (
                          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[1.25rem] shadow-inner border border-white flex items-center justify-center text-3xl shrink-0">💊</div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 leading-tight tracking-tight">{med.name}</h3>
                          <div className="mt-2.5 flex gap-2 flex-wrap">
                            <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-widest shadow-sm">{med.qty} {t.pills}</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-widest shadow-sm ${med.totalStock > 0 ? 'bg-white text-slate-600 border border-slate-100' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>{t.left}: {med.totalStock}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button Area */}
                  <div className="p-6 md:p-8 pt-6 mt-auto relative z-10">
                    {isOutOfStock ? (
                      <div className="w-full py-4 md:py-5 text-center rounded-[1.5rem] bg-rose-50/80 backdrop-blur-sm border border-rose-200/60 text-rose-600 font-black tracking-widest uppercase text-sm shadow-sm">
                        ❌ {t.outOfStock}
                      </div>
                    ) : slot.status !== 'taken' ? (
                      <button onClick={() => handleTakeMedicine(slot._id)} className="w-full py-4 md:py-5 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl shadow-slate-900/20 active:scale-[0.98] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group/take">
                        <span className="text-2xl group-hover/take:scale-125 transition-transform duration-300">✓</span> {t.tookIt}
                      </button>
                    ) : (
                      <div className="w-full py-4 md:py-5 text-center rounded-[1.5rem] bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 text-emerald-600 font-black tracking-widest uppercase text-sm shadow-sm flex items-center justify-center gap-3">
                        <span className="text-xl">✅</span> {t.taken}
                      </div>
                    )}
                  </div>

                  {/* Soft Background Gradient Overlay per card */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-[2.5rem]"></div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Ultra-Modern Floating Dock Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 md:bottom-10 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 transition-all duration-300">
        <div className="bg-white/70 backdrop-blur-3xl border border-white/80 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-[2rem] md:rounded-full px-2 md:px-4 py-2 md:py-3 mx-auto max-w-md w-full flex justify-between items-center gap-1 md:gap-3">
          
          <button onClick={() => setShowAddReminder(true)} className="flex-1 md:flex-none md:w-[4.5rem] md:h-[4.5rem] py-3 md:py-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-slate-800 active:scale-95 hover:bg-white/80 rounded-[1.5rem] md:rounded-full transition-all group relative">
            <span className="text-2xl md:text-3xl group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm">➕</span>
            <span className="text-[10px] font-bold tracking-wide opacity-0 group-hover:opacity-100 absolute bottom-1 md:-bottom-6 md:bg-slate-800 md:text-white md:px-3 md:py-1.5 md:rounded-lg md:shadow-lg transition-all duration-300 whitespace-nowrap pointer-events-none md:scale-90 group-hover:scale-100 hidden md:block">
              {t.navAddMed}
            </span>
            <span className="text-[10px] font-bold md:hidden group-hover:text-slate-800">{t.navAddMed}</span>
          </button>
          
          <button onClick={() => navigate('/blood-network')} className="flex-1 md:flex-none md:w-[4.5rem] md:h-[4.5rem] py-3 md:py-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-rose-500 active:scale-95 hover:bg-rose-50/80 rounded-[1.5rem] md:rounded-full transition-all group relative">
            <span className="text-2xl md:text-3xl group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm">🩸</span>
            <span className="text-[10px] font-bold tracking-wide opacity-0 group-hover:opacity-100 absolute bottom-1 md:-bottom-6 md:bg-rose-600 md:text-white md:px-3 md:py-1.5 md:rounded-lg md:shadow-lg transition-all duration-300 whitespace-nowrap pointer-events-none md:scale-90 group-hover:scale-100 hidden md:block">
              {t.navBlood}
            </span>
            <span className="text-[10px] font-bold md:hidden group-hover:text-rose-500">{t.navBlood}</span>
          </button>

          <button onClick={() => navigate('/family')} className="flex-1 md:flex-none md:w-[4.5rem] md:h-[4.5rem] py-3 md:py-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-blue-500 active:scale-95 hover:bg-blue-50/80 rounded-[1.5rem] md:rounded-full transition-all group relative">
            <span className="text-2xl md:text-3xl group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm">👨‍👩‍👧‍👦</span>
            <span className="text-[10px] font-bold tracking-wide opacity-0 group-hover:opacity-100 absolute bottom-1 md:-bottom-6 md:bg-blue-600 md:text-white md:px-3 md:py-1.5 md:rounded-lg md:shadow-lg transition-all duration-300 whitespace-nowrap pointer-events-none md:scale-90 group-hover:scale-100 hidden md:block">
              {t.navFamily}
            </span>
            <span className="text-[10px] font-bold md:hidden group-hover:text-blue-500">{t.navFamily}</span>
          </button>

          <button onClick={() => navigate('/find-clinic')} className="flex-1 md:flex-none md:w-[4.5rem] md:h-[4.5rem] py-3 md:py-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-emerald-500 active:scale-95 hover:bg-emerald-50/80 rounded-[1.5rem] md:rounded-full transition-all group relative">
            <span className="text-2xl md:text-3xl group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm">🏥</span>
            <span className="text-[10px] font-bold tracking-wide opacity-0 group-hover:opacity-100 absolute bottom-1 md:-bottom-6 md:bg-emerald-600 md:text-white md:px-3 md:py-1.5 md:rounded-lg md:shadow-lg transition-all duration-300 whitespace-nowrap pointer-events-none md:scale-90 group-hover:scale-100 hidden md:block">
              {t.navClinic}
            </span>
            <span className="text-[10px] font-bold md:hidden group-hover:text-emerald-500">{t.navClinic}</span>
          </button>

          <button onClick={() => setShowSettings(true)} className="flex-1 md:flex-none md:w-[4.5rem] md:h-[4.5rem] py-3 md:py-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-slate-800 active:scale-95 hover:bg-slate-100/80 rounded-[1.5rem] md:rounded-full transition-all group relative">
            <span className="text-2xl md:text-3xl group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm">⚙️</span>
            <span className="text-[10px] font-bold tracking-wide opacity-0 group-hover:opacity-100 absolute bottom-1 md:-bottom-6 md:bg-slate-800 md:text-white md:px-3 md:py-1.5 md:rounded-lg md:shadow-lg transition-all duration-300 whitespace-nowrap pointer-events-none md:scale-90 group-hover:scale-100 hidden md:block">
              {t.navSettings}
            </span>
            <span className="text-[10px] font-bold md:hidden group-hover:text-slate-800">{t.navSettings}</span>
          </button>

        </div>
      </nav>

    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<VisualDashboard />} />
      </Routes>
    </Router>
  );
}