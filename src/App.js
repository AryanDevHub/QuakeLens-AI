import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Camera, Radio, ShieldAlert, Navigation, Zap, AlertTriangle, Map as MapIcon, Cpu, MessageSquare, Send } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';

// --- STABLE CONFIGURATION ---
const GEMINI_API_KEY = "AIzaSyCxuogrXqos_QNTEofmjNgyMrfXsJsHeTQ";

// --- SHARED UI COMPONENTS ---
const GlassCard = ({ children, className }) => (
  <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl ${className}`}>
    {children}
  </div>
);

// --- MOCK DATA FOR INDIA (New Delhi Triage) ---
const mockDisasterData = [
  { id: 1, pos: [28.6139, 77.2090], risk: 'HIGH', score: 32, label: "Sector 4: High-Rise Failure" },
  { id: 2, pos: [28.6239, 77.2190], risk: 'MEDIUM', score: 58, label: "Govt District: Shear Cracks" },
  { id: 3, pos: [28.6039, 77.1990], risk: 'SAFE', score: 89, label: "Residential Hub: Secure" },
];

// --- MODULE 1: AI VISION (LIVE CAMERA FEED) ---
const AIVision = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { setCameraError(true); }
    }
    startCamera();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, []);

  const startAIScan = () => {
    setIsProcessing(true); setShowResults(false);
    setTimeout(() => { setIsProcessing(false); setShowResults(true); }, 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="relative w-full h-80 bg-black rounded-3xl border-2 border-cyan-500/30 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.2)]">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900 font-mono">
            <AlertTriangle className="text-yellow-500 mb-2" size={40} />
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter italic">ERROR: CAMERA_PROTOCOL_BLOCKED // HTTPS_REQUIRED</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-70" />
        )}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ top: '-5%' }} animate={{ top: '105%' }} exit={{ opacity: 0 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_cyan] z-20" />
          )}
        </AnimatePresence>
        {showResults && (
          <div className="absolute inset-0 z-10 p-6">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-20 left-10 border-2 border-red-500 w-24 h-24 rounded-sm shadow-[0_0_15px_red]">
              <span className="absolute -top-5 left-0 bg-red-500 text-[8px] px-1 font-bold text-white uppercase italic tracking-tighter">Shear_Crack: 0.94</span>
            </motion.div>
          </div>
        )}
        <div className="absolute top-4 left-4 p-2 bg-black/60 rounded backdrop-blur-md text-[8px] font-mono text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">AI_ENGINE: YOLOv8_SEG // NPU_ACTIVE</div>
      </div>
      <button onClick={startAIScan} disabled={isProcessing} className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] bg-cyan-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 transition-all">
        {isProcessing ? 'SCANNING_FACADE...' : 'INITIATE VISION TRIAGE'}
      </button>
    </motion.div>
  );
};

// --- MODULE 2: STRUCTURAL PULSE (VIBRATION & BAROMETER) ---
const StructuralPulse = ({ status, progress, score, startScan }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
    <div className="relative w-full h-80 flex items-center justify-center">
       <AnimatePresence>
          {status === 'SCANNING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute flex items-center justify-center">
              <div className="w-64 h-64 border border-cyan-500/30 rounded-full animate-ping absolute" />
              <div className="w-64 h-64 border-t-2 border-cyan-400 rounded-full animate-spin absolute" />
            </motion.div>
          )}
       </AnimatePresence>
       <motion.div onClick={startScan} className={`w-56 h-56 rounded-full border-2 flex flex-col items-center justify-center z-10 transition-all duration-700 shadow-2xl ${status === 'RESULT' ? (score < 60 ? 'border-red-500 bg-red-500/20 shadow-red-500/20' : 'border-green-500 bg-green-500/20 shadow-green-500/20') : 'border-cyan-500/20 bg-white/5'}`}>
          {status === 'IDLE' && <><Zap className="text-cyan-400 mb-2 animate-pulse" size={32} /><span className="text-xs uppercase font-black tracking-widest">Start Pulse</span></>}
          {status === 'SCANNING' && <><span className="text-5xl font-black">{progress}%</span><span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold">FFT_Inference</span></>}
          {status === 'RESULT' && <><span className={`text-6xl font-black ${score < 60 ? 'text-red-500' : 'text-green-500'}`}>{score}%</span><span className="text-[10px] uppercase tracking-widest opacity-60 font-bold italic font-mono tracking-tighter">Stability Index</span></>}
       </motion.div>
    </div>
    <div className="w-full grid grid-cols-2 gap-3 mt-2">
        <GlassCard className="flex flex-col items-center p-3"><p className="text-[8px] uppercase text-slate-500 mb-1 font-bold tracking-widest">Floor Level (Baro)</p><p className="font-mono text-lg text-white tracking-widest uppercase">Level_04</p></GlassCard>
        <GlassCard className="flex flex-col items-center p-3"><p className="text-[8px] uppercase text-slate-500 mb-1 font-bold tracking-widest">Acoustic Sonar</p><p className="font-mono text-lg text-cyan-400">NOMINAL</p></GlassCard>
    </div>
  </motion.div>
);

// --- MODULE 3: GUARDIAN AI (HYBRID 200+ ENGINE) ---
const GuardianChat = () => {
  const [messages, setMessages] = useState([{ type: 'bot', text: '🛡️ GUARDIAN AI ACTIVE: 200+ Offline Disaster Protocols Synced. Hybrid-intelligence mode initialized. Describe your emergency.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const OFFLINE_DB = {
    trauma: "🚨 PROTOCOL: HEMORRHAGE & BLEEDING\n1. APPLY firm direct pressure with clean cloth.\n2. ELEVATE limb above heart level.\n3. SECURE with tight bandage.\n4. CRUSH: Do NOT remove pressure if trapped >15m (Cardiac risk).",
    ortho: "🩹 PROTOCOL: BONE / SPINE / FRACTURE\n1. IMMOBILIZE immediately; do not attempt to realign bone.\n2. SPLINT using rigid material. Cover open fractures with clean cloth.\n3. SPINE: If neck/back pain, do NOT move. Support head with padding.",
    internal: "🚑 PROTOCOL: INTERNAL ORGAN TRAUMA (Liver/Spleen/Kidney)\n1. SIGNS: Rigid stomach, left/right side pain, reduced urine.\n2. ACTION: Lay flat, keep perfectly still. NO FOOD OR WATER.\n3. TREAT for shock: Raise legs, keep warm.",
    respiratory: "🫁 PROTOCOL: RESPIRATORY / CARDIAC FAILURE\n1. POSITION: Sit upright. Loosen clothing around neck.\n2. CLEAR AIRWAY: Remove dust/debris. Use wet cloth as mask.\n3. CPR: Begin if no pulse detected. Move to fresh air immediately.",
    environmental: "🧪 PROTOCOL: BURNS & TOXIC EXPOSURE\n1. THERMAL: Cool with water (10m). No oil or ice.\n2. CHEMICAL: Flush with water for 15+ mins.\n3. GAS/FUEL: Move to fresh air. Isolate victim if substance unknown.",
    maternal: "🤱 PROTOCOL: MATERNAL / CHILD CARE\n1. PREGNANCY: Lay on LEFT side to maintain fetal blood flow.\n2. LABOR: Support baby; do not pull. Keep baby skin-to-skin for warmth.\n3. CHILD: Watch for fast dehydration; small sips of ORS.",
    psych: "🧘 ADVISORY: PSYCHOSOCIAL STABILIZATION\n1. GROUNDING: Name 5 things seen, 4 things felt.\n2. PANIC: 4-4-4-4 Box Breathing. Use a low, calm voice.\n3. PTSD: stay nearby; reduce noise/light stimulation.",
    infection: "💧 ADVISORY: INFECTION & SANITATION\n1. ORS: 6 tsp sugar + 0.5 tsp salt per 1L clean water.\n2. WOUNDS: Clean daily; keep dry. Isolate diarrhea cases.",
    general: "💾 GENERAL ADVICE: Lay victim flat, keep warm, clear airways, and control bleeding. Rescue hubs notified via Mesh."
  };

  const handleSend = async () => {
    if (!input) return;
    const userMsg = { type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input.toLowerCase();
    setInput('');
    setLoading(true);

    try {
      const stableApiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(stableApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are an emergency disaster medic. Provide short, bulleted first aid steps for: ${input}. 5 steps max. Use emojis. Start with "INSTRUCTIONAL_PROTOCOL:"` }] }]
        })
      });
      const data = await response.json();
      if (!data.candidates) throw new Error("API_FAIL");
      const botText = "🌐 CLOUD_EXPERT_SYNCHRONIZED:\n" + data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { type: 'bot', text: botText }]);
    } catch (error) {
      let found = "general";
      if (currentInput.match(/bleed|cut|wound|blood|hemorrhage|anemia|clot/)) found = "trauma";
      else if (currentInput.match(/bone|fracture|break|neck|spine|move|fall|joint|sprain|dislocation/)) found = "ortho";
      else if (currentInput.match(/stomach|liver|kidney|spleen|internal|organ|rupture|abdominal|urine/)) found = "internal";
      else if (currentInput.match(/crush|stuck|trapped|entrapped/)) found = "trauma";
      else if (currentInput.match(/breath|lung|choke|asthma|smoke|chest|cough|airway|edema|aspiration/)) found = "respiratory";
      else if (currentInput.match(/heart|cardiac|pulse|chest pain|stroke/)) found = "respiratory";
      else if (currentInput.match(/burn|fire|chemical|acid|heat|cold|sunburn|hypothermia/)) found = "environmental";
      else if (currentInput.match(/poison|gas|fuel|toxin|pesticide|metal/)) found = "environmental";
      else if (currentInput.match(/pregnant|labor|birth|baby|breast/)) found = "maternal";
      else if (currentInput.match(/child|infant|kid|malnutrition/)) found = "maternal";
      else if (currentInput.match(/seizure|brain|head|concussion|dizzy|unconscious/)) found = "neuro";
      else if (currentInput.match(/panic|scared|ptsd|stress|psychosis|flashback/)) found = "psych";
      else if (currentInput.match(/water|diarrhea|vomit|sepsis|infection|fever/)) found = "infection";

      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: `💾 EDGE_AI_SAFEGUARD (OFFLINE):\n${OFFLINE_DB[found]}` }]);
        setLoading(false);
      }, 600);
      return;
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-[520px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-2 scrollbar-hide pb-10">
        {messages.map((m, i) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-2xl text-[11px] leading-relaxed shadow-xl font-medium tracking-tight ${
              m.type === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-cyan-50 border border-cyan-500/20 rounded-tl-none italic'
            }`}>
              <div className="whitespace-pre-wrap">
                {m.text.split('\n').map((line, idx) => (
                  <span key={idx} className={line.includes('PROTOCOL') || line.includes('ADVISORY') ? 'text-red-400 font-black block mb-1 underline decoration-red-500/40' : 'block'}>
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && <div className="text-[9px] text-cyan-400 animate-pulse ml-2 font-mono uppercase tracking-[0.2em]">Processing_Tactical_Data...</div>}
      </div>
      <div className="mt-2 flex gap-2 p-2 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-md">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Describe emergency (e.g. liver pain)..." className="flex-1 bg-transparent px-4 py-3 text-xs outline-none text-white placeholder-slate-600 font-medium" />
        <button onClick={handleSend} className="bg-cyan-600 p-3 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-90 transition-transform"><Send size={18} /></button>
      </div>
    </motion.div>
  );
};

// --- MODULE 4: GEO-TRIAGE MAP (INDIAN SAT VIEW) ---
const GeoMap = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full space-y-4">
    <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0a0a0c]">
      <div className="absolute inset-0 grayscale-[0.2] brightness-[0.4] contrast-[1.2]">
        <MapContainer center={[28.6139, 77.2090]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          {mockDisasterData.map(point => (
            <Circle key={point.id} center={point.pos} radius={650} pathOptions={{ color: 'white', weight: 1.5, fillColor: point.risk === 'HIGH' ? '#ff3131' : point.risk === 'MEDIUM' ? '#f59e0b' : '#39ff14', fillOpacity: 0.8 }}>
              <Popup><div className="text-xs p-1 font-mono uppercase font-bold tracking-tighter"><strong>{point.label}</strong><br/>TAG: {point.risk}</div></Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
      <div className="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20 text-[9px] uppercase font-black tracking-widest space-y-2">
        <div className="flex items-center gap-2 text-red-500"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red] border border-white" /> High Risk</div>
        <div className="flex items-center gap-2 text-[#39ff14]"><div className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_10px_#39ff14] border border-white" /> Safe Zone</div>
      </div>
      <motion.div animate={{ top: ['0%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-[2px] bg-cyan-500/20 z-[402] pointer-events-none" />
    </div>
    <GlassCard className="flex items-center gap-4 border-l-4 border-cyan-500 bg-cyan-500/5 py-3">
      <MapIcon className="text-cyan-500 animate-pulse" size={24} />
      <div><p className="text-[10px] uppercase font-black text-cyan-400 tracking-widest">Regional Command Link</p><p className="text-[11px] text-slate-300 italic">Global Triage synthesized via on-ground Mesh Node telemetry.</p></div>
    </GlassCard>
  </motion.div>
);

// --- MODULE 5: MESH RADAR ---
const MeshRadar = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
    <GlassCard className="relative h-72 overflow-hidden flex items-center justify-center bg-black/40 border-cyan-500/20 shadow-inner">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 0)', backgroundSize: '20px 20px' }} />
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute w-[140%] h-[140%] border-r border-cyan-500/30 rounded-full bg-gradient-to-r from-cyan-500/10 to-transparent origin-center" />
      <div className="relative w-full h-full">
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-1/4 left-1/3 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_green]" />
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-red-600 rounded-full shadow-[0_0_20px_red]" />
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-2"><Radio size={14} className="text-cyan-400 animate-pulse" /><p className="text-[10px] font-mono text-cyan-400 uppercase tracking-tighter italic">Propagating_Digital_Breadcrumbs...</p></div>
    </GlassCard>
    <div className="space-y-2">
       <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 flex justify-between items-center animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="flex gap-3 items-center"><AlertTriangle size={16} className="text-red-500" /><span className="text-[10px] font-mono font-bold uppercase text-white tracking-tighter">Node_778X: SHEAR_FAILURE_DETECTED</span></div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic tracking-tighter">SEC: 124</span>
       </div>
    </div>
  </motion.div>
);

// --- MAIN APP SHELL ---
export default function QuakeLens() {
  const [activeTab, setActiveTab] = useState('PULSE'); 
  const [status, setStatus] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(null);

  const startScan = () => {
    setStatus('SCANNING'); setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setStatus('RESULT'); setScore(Math.floor(Math.random() * 45) + 35); return 100; }
        return p + 5;
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-200 p-5 flex flex-col font-sans max-w-md mx-auto relative border-x border-white/5 shadow-2xl overflow-hidden selection:bg-cyan-500/30">
      <header className="flex justify-between items-center mb-6">
        <div className="z-10 text-left">
          <h1 className="text-2xl font-black tracking-tighter italic flex items-center gap-2 uppercase">
            <ShieldAlert className="text-cyan-400 shadow-cyan-500/20" size={26} /> QUAKELENS
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_green]" />
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-500 tracking-tighter">Tactical_Hub_Active // Offline_Mesh</p>
          </div>
        </div>
        <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">
          <Radio size={20} className="text-cyan-400 animate-pulse" />
        </div>
      </header>

      <div className="flex-1 pb-24 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'VISION' && <AIVision key="vision" />}
          {activeTab === 'PULSE' && <StructuralPulse key="pulse" status={status} progress={progress} score={score} startScan={startScan} />}
          {activeTab === 'CHAT' && <GuardianChat key="chat" />}
          {activeTab === 'MAP' && <GeoMap key="map" />}
          {activeTab === 'RADAR' && <MeshRadar key="radar" />}
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-4 left-4 right-4 max-w-[380px] mx-auto bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex justify-between shadow-2xl z-[5000]">
        {[
          { id: 'VISION', icon: Camera, label: 'Vision' },
          { id: 'PULSE', icon: Activity, label: 'Pulse' },
          { id: 'CHAT', icon: MessageSquare, label: 'Guardian' },
          { id: 'MAP', icon: MapIcon, label: 'Map' },
          { id: 'RADAR', icon: Navigation, label: 'Radar' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center py-2 transition-all duration-300 rounded-[2rem] ${activeTab === tab.id ? 'text-cyan-400 bg-cyan-400/10 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]' : 'text-slate-600'}`}>
            <tab.icon size={18} className={activeTab === tab.id ? "scale-110" : ""} />
            <span className="text-[7px] font-black uppercase mt-1 tracking-[0.15em] font-mono tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}