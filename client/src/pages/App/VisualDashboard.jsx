import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddReminder from '../../components/AddReminder'; 

const translations = {
  en: { 
    greeting: "Good Morning", hub: "Here is your health hub.", quickActions: "Quick Actions", 
    emergency: "Emergency Blood", family: "Family Observer", clinic: "Find Clinic", settings: "App Settings", 
    addMed: "Add Medicine", schedule: "Today's Schedule", noMeds: "No medicines scheduled!", 
    takeMeds: "Take", pills: "Pills", tookIt: "💊 I Took It", taken: "✅ Medicine Taken", sos: "SOS PANIC",
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
    takeMeds: "తీసుకోండి", pills: "మాత్రలు", tookIt: "💊 నేను తీసుకున్నాను", taken: "✅ మందు తీసుకున్నారు", sos: "SOS",
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
    takeMeds: "लें", pills: "गोलियां", tookIt: "💊 मैंने ले लिया", taken: "✅ दवा ले ली गई", sos: "आपातकालीन",
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
        reply = "पेट दर्द के लिए, गर्म पानी पिएं। मसालेदार खाना न खाएं। एसिडिटी हो越 तो एंटासिड ले सकते हैं।";
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
        reply = "बुखार के लिए, आराम करें और पानी पिएं। आप डोलो 650 ले सकते हैं। 3 दिन से ज्यादा हो तो डॉक्टर को दिखाएं।";
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

  // 🌟 HELPER TO FORMAT ANY TIME SAFELY 🌟
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

  // 🌟 FIXED TIME EDITOR PARSING 🌟
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

  // 🌟 FIXED SAVING LOGIC (Instant UI Update) 🌟
  const saveCustomTime = async (id) => {
    let h24 = parseInt(editHour, 10);
    if (editAmpm === 'PM' && h24 !== 12) h24 += 12;
    if (editAmpm === 'AM' && h24 === 12) h24 = 0;
    const formatted24h = `${h24.toString().padStart(2, '0')}:${editMinute}`;
    
    // Instantly update UI without waiting for backend to avoid blank states!
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24 relative"> 
      
      <header className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 md:p-8 rounded-b-[2.5rem] shadow-[0_10px_30px_rgba(79,70,229,0.2)] relative z-20 pb-12">
        <div className="absolute top-6 right-6 flex bg-black/10 rounded-full p-1 border border-white/20 backdrop-blur-sm">
          <button onClick={() => handleLanguageChange('en')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${appLang === 'en' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-50 hover:text-white'}`}>EN</button>
          <button onClick={() => handleLanguageChange('te')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${appLang === 'te' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-50 hover:text-white'}`}>తె</button>
          <button onClick={() => handleLanguageChange('hi')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${appLang === 'hi' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-50 hover:text-white'}`}>हिं</button>
        </div>
        <h1 className="text-3xl font-black pr-24 tracking-tight">{t.greeting}, <br/>{patientName.split(' ')[0]}!</h1>
        <p className="text-blue-100 mt-2 text-sm font-medium opacity-90">{t.hub}</p>
      </header>

      <div className="max-w-2xl mx-auto px-5 mt-[-2rem] relative z-30 flex flex-col gap-4">
        
        <button onClick={handleSOS} disabled={isSendingSOS} className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all duration-300 ${isSendingSOS ? 'bg-red-400 text-white' : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30 hover:shadow-red-500/50'}`}>
          <span className="text-3xl drop-shadow-md">{isSendingSOS ? "📡" : "🚨"}</span>
          <span className="text-xl font-black tracking-widest uppercase drop-shadow-md">{isSendingSOS ? t.calling : t.sos}</span>
        </button>

        <button onClick={() => setShowVoiceAssistant(true)} className="w-full py-4 px-6 rounded-2xl bg-white border border-indigo-50 flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.04)] active:scale-95 transition-all group hover:border-indigo-100">
          <div className="bg-indigo-50 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <span className="text-xl">🎙️</span>
          </div>
          <span className="text-lg font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">{t.askAi}</span>
        </button>

      </div>

      {showVoiceAssistant && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex justify-between items-center text-white shrink-0">
              <h2 className="text-xl font-black tracking-wide">🎙️ {t.aiTitle}</h2>
              <button onClick={() => { setShowVoiceAssistant(false); window.speechSynthesis.cancel(); }} className="bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center font-bold">✕</button>
            </div>
            
            <div className="p-6 flex flex-col items-center overflow-y-auto">
              <button onClick={handleVoiceSearch} className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all shrink-0 mt-2 ${isListening ? 'bg-red-500 animate-pulse scale-110 shadow-red-500/50' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/40'}`}>
                <span className="text-white">{isListening ? "👂" : "🎤"}</span>
              </button>
              
              <p className="mt-4 text-base font-bold text-slate-700 text-center min-h-[28px] px-4">
                {transcript || (appLang === 'te' ? "మైక్ నొక్కి మాట్లాడండి" : appLang === 'hi' ? "माइक दबाएं और बोलें" : "Tap the mic and say: 'I have a fever'")}
              </p>

              {aiResponse && (
                <div className="mt-5 p-5 bg-indigo-50 border border-indigo-100 rounded-3xl w-full flex flex-col items-center text-center animate-fade-in shadow-inner">
                  
                  {aiEmoji && (
                    <div className="bg-white w-16 h-16 rounded-full shadow-sm border-2 border-indigo-100 flex items-center justify-center mb-3 transform hover:scale-110 transition-transform">
                      <span className="text-4xl drop-shadow-sm">{aiEmoji}</span>
                    </div>
                  )}
                  
                  <p className="text-indigo-900 font-bold leading-relaxed">{aiResponse}</p>

                  {aiMedicines.length > 0 && (
                    <div className="mt-5 w-full bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm text-left">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span>🩺</span> {t.recommendedMeds}
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {aiMedicines.map((med, idx) => (
                          <a 
                            key={idx} 
                            href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(med.name + " medicine")}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl flex items-center gap-3 hover:bg-indigo-100 transition-colors cursor-pointer"
                          >
                            <div className="bg-white w-10 h-10 rounded-full shadow-sm flex items-center justify-center text-xl shrink-0 border border-slate-100">
                              💊
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-indigo-900 text-sm leading-tight">{med.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-tight">{med.desc}</p>
                            </div>
                            <div className="text-indigo-400 opacity-60 text-xl">
                              🖼️
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
            const localizedTimeSlot = slot.time_slot === "Morning" ? t.morning : slot.time_slot === "Afternoon" ? t.afternoon : t.night;
            const timeIcon = slot.time_slot === "Morning" ? "☀️" : slot.time_slot === "Afternoon" ? "🌤️" : "🌙";

            return (
              <div key={slot._id} className={`bg-white rounded-[1.5rem] shadow-[0_4px_15px_rgba(0,0,0,0.03)] overflow-hidden border border-slate-100 mb-5 relative`}>
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${slot.status === 'taken' ? 'bg-green-500' : isOutOfStock ? 'bg-red-500' : 'bg-amber-400'}`}></div>

                <div className="p-4 pl-6 bg-white flex justify-between items-center border-b border-slate-50">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    {timeIcon} {localizedTimeSlot}
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
                      {/* 🌟 THIS USES THE NEW HELPER TO FORMAT PROPERLY 🌟 */}
                      {formatDisplayTime(slot.target_time)} <span className="text-xs opacity-50">✏️</span>
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
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide ${med.totalStock > 0 ? 'bg-slate-200 text-slate-600' : 'bg-red-100 text-red-600'}`}>{t.left}: {med.totalStock}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 pl-6 pt-1">
                  {isOutOfStock ? (
                    <div className="w-full py-3.5 text-center rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold tracking-wide">
                      ❌ {t.outOfStock}
                    </div>
                  ) : slot.status !== 'taken' ? (
                    <button onClick={() => handleTakeMedicine(slot._id)} className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-lg shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2">
                      <span className="text-xl">✓</span> {t.tookIt}
                    </button>
                  ) : (
                    <div className="w-full py-3.5 text-center rounded-xl bg-green-50 text-green-600 font-bold tracking-wide flex items-center justify-center gap-2">
                      <span className="text-xl">✅</span> {t.taken}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-40 px-2 pb-safe">
        <div className="flex justify-between items-center max-w-md mx-auto h-16 px-2">
          <button onClick={() => setShowAddReminder(true)} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-600 active:scale-90 transition-transform">
            <span className="text-2xl">➕</span>
            <span className="text-[10px] font-bold">{t.navAddMed}</span>
          </button>
          
          <button onClick={() => navigate('/blood-network')} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-rose-500 active:scale-90 transition-transform">
            <span className="text-2xl">🩸</span>
            <span className="text-[10px] font-bold">{t.navBlood}</span>
          </button>

          <button onClick={() => navigate('/family')} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-500 active:scale-90 transition-transform">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <span className="text-[10px] font-bold">{t.navFamily}</span>
          </button>

          <button onClick={() => navigate('/find-clinic')} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-500 active:scale-90 transition-transform">
            <span className="text-2xl">🏥</span>
            <span className="text-[10px] font-bold">{t.navClinic}</span>
          </button>

          <button onClick={() => setShowSettings(true)} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-800 active:scale-90 transition-transform">
            <span className="text-2xl">⚙️</span>
            <span className="text-[10px] font-bold">{t.navSettings}</span>
          </button>
        </div>
      </nav>

    </div>
  );
};

export default VisualDashboard;
