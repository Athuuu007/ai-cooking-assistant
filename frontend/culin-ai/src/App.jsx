import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChefHat, User, Clock, Flame, Star, UtensilsCrossed, BrainCircuit, ChevronDown, Check, ArrowRight, ArrowLeft, Mic, Sun, Moon, Loader2, Play, X, Volume2, SkipBack, SkipForward, RotateCcw, Eye, EyeOff, Camera, Zap, History, MessageSquare, Info, Mail, Send, Settings, LogOut } from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const API_URL = "https://ai-cooking-assistant-dsnh.onrender.com";

const ASSETS = {
  bgs: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000",
    "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?q=80&w=2000",
    "https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=2000",
    "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070",
    "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=2000"
  ],
  googleIcon: "https://www.svgrepo.com/show/475656/google-color.svg",
  fallbackFood: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800"
};

const INGREDIENT_CATEGORIES = {
  Essentials: ["Onion", "Garlic", "Tomato", "Potato", "Ginger", "Chili", "Lemon", "Salt", "Oil", "Butter"],
  Vegetables: ["Carrot", "Broccoli", "Spinach", "Bell Pepper", "Mushroom", "Brinjal", "Cauliflower", "Cabbage", "Peas", "Zucchini"],
  Proteins: ["Chicken", "Egg", "Beef", "Fish", "Paneer", "Yogurt", "Lentils", "Tofu", "Prawns", "Chickpeas"],
  Spices: ["Turmeric", "Cumin", "Coriander", "Garam Masala", "Black Pepper", "Cinnamon", "Cardamom", "Mustard Seeds"],
  Grains: ["Rice", "Wheat Flour", "Pasta", "Oats", "Quinoa", "Bread"]
};

const MODES = [
  { id: 'lazy', title: "Lazy Mode", subtitle: "Simple & Light", tag: "South Indian", image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=600" },
  { id: 'quick', title: "Quick Fix", subtitle: "Rich Curries", tag: "North Indian", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=600" },
  { id: 'pro', title: "Pro Chef", subtitle: "Meat & Grills", tag: "Non Vegetarian", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600" },
  { id: 'healthy', title: "Healthy", subtitle: "Pure Veg", tag: "Vegetarian", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600" }
];

const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      let naturalVoice = voices.find(v => v.lang === "en-IN" || v.name.includes("India"));
      if (!naturalVoice) naturalVoice = voices.find(v => v.lang === "en-US");
      setVoice(naturalVoice || voices[0]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };
  const stop = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };
  return { speak, stop, isSpeaking };
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);
  return (
    <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-all text-gray-800 dark:text-white shadow-sm">
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
};

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-orange-500 rounded-full pointer-events-none z-[9999]"
        animate={{ x: mousePosition.x - 6, y: mousePosition.y - 6 }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.1 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-orange-500/50 rounded-full pointer-events-none z-[9998]"
        animate={{ x: mousePosition.x - 20, y: mousePosition.y - 20 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.5 }}
      />
    </>
  );
};

const BackgroundCarousel = ({ images, overlayType = "dashboard" }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!images || images.length === 0) return;
    const timer = setInterval(() => { setIndex((prev) => (prev + 1) % images.length); }, 10000);
    return () => clearInterval(timer);
  }, [images]);

  const overlays = {
    dashboard: "from-white/90 via-white/80 to-gray-50 dark:from-[#050505]/90 dark:via-[#050505]/80 dark:to-[#050505]",
    landing: "from-black/60 via-black/80 to-[#050505]",
    auth: "from-white/70 via-white/80 to-gray-50 dark:from-[#050505]/70 dark:via-[#050505]/80 dark:to-[#050505] backdrop-blur-sm"
  };

  if (!images || images.length === 0) return <div className={`absolute inset-0 bg-gradient-to-b ${overlays[overlayType]}`} />;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.img key={index} src={images[index]} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }} className="absolute inset-0 w-full h-full object-cover" />
      </AnimatePresence>
      <div className={`absolute inset-0 bg-gradient-to-b ${overlays[overlayType]} transition-colors duration-500`} />
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, recentRecipes, onSelectRecipe }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-3xl border-r border-gray-200 dark:border-white/10 z-50 flex flex-col shadow-[30px_0_60px_rgba(0,0,0,0.5)]">
                    <div className="p-8 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
                        <span className="font-black text-gray-900 dark:text-white text-xl flex items-center gap-3"><Clock size={22} className="text-orange-500"/> Recently Viewed</span>
                        <button onClick={onClose} className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"><X size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 mt-2">
                        {recentRecipes.length === 0 ? (
                            <div className="text-center mt-20 text-gray-400 dark:text-gray-600 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center"><Search size={28} className="opacity-50" /></div>
                                <p className="text-sm font-medium">No recent recipes.</p>
                            </div>
                        ) : (
                            recentRecipes.map((recipe, i) => (
                                <motion.button whileHover={{ scale: 1.02, x: 4 }} key={i} onClick={() => { onSelectRecipe(recipe); onClose(); }} className="w-full text-left p-4 rounded-2xl hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center justify-between transition-all group shadow-sm hover:shadow-md">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <img src={recipe.image || ASSETS.fallbackFood} alt={recipe.title} className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-white/10" />
                                        <span className="truncate">{recipe.title}</span>
                                    </div>
                                    <ArrowRight size={16} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300"/>
                                </motion.button>
                            ))
                        )}
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

const Navbar = ({ user, onLogout, onToggleSidebar, activePage, setPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 w-full z-40 px-4 py-6 transition-all duration-300">
            <div className="max-w-7xl mx-auto bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-lg shadow-black/5 dark:shadow-black/50">
                <div className="flex items-center gap-4">
                    <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-800 dark:text-white transition-colors"><History size={22} /></button>
                    <div onClick={() => setPage('home')} className="flex items-center gap-2 text-2xl font-black tracking-tighter text-gray-900 dark:text-white cursor-pointer hover:scale-105 transition-transform duration-300"><ChefHat size={28} className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]" /> AI Cooking Assistant</div>
                </div>
                
                <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500 dark:text-gray-400">
                    <button onClick={() => setPage('home')} className={`transition-all duration-300 hover:text-orange-500 hover:-translate-y-0.5 ${activePage === 'home' ? 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]' : ''}`}>Home</button>
                    <button onClick={() => setPage('about')} className={`transition-all duration-300 hover:text-orange-500 hover:-translate-y-0.5 ${activePage === 'about' ? 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]' : ''}`}>About</button>
                    <button onClick={() => setPage('contact')} className={`transition-all duration-300 hover:text-orange-500 hover:-translate-y-0.5 ${activePage === 'contact' ? 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]' : ''}`}>Contact</button>
                </div>

                <div className="relative flex items-center" ref={menuRef}>
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:border-orange-500/30 transition-all duration-300 text-gray-800 dark:text-white"
                    >
                        {user.picture ? <img src={user.picture} alt="profile" className="w-6 h-6 rounded-full object-cover"/> : <User size={16} />}
                        {user.name.split(" ")[0]} 
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180 text-orange-500' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                animate={{ opacity: 1, y: 0, scale: 1 }} 
                                exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                                className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
                            >
                                <div className="p-2 space-y-1">
                                    <button 
                                        onClick={() => { setPage('profile'); setIsMenuOpen(false); }} 
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                                    >
                                        <User size={18} /> Profile Dashboard
                                    </button>
                                    
                                    <div className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        <span className="flex items-center gap-3"><Settings size={18} /> Theme</span>
                                        <ThemeToggle />
                                    </div>
                                    
                                    <div className="h-px bg-gray-200 dark:bg-white/5 my-2 mx-3"></div>
                                    
                                    <button 
                                        onClick={onLogout} 
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut size={18} /> Logout
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
};

// --- ANIMATED PROFILE PAGE ---
const ProfilePage = ({ user, recentRecipes, onSelectRecipe, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');

    useEffect(() => {
        if (user) setEditName(user.name);
    }, [user]);

    const handleSave = () => {
        if (editName.trim() === '') return;
        onUpdateUser({ ...user, name: editName });
        setIsEditing(false);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-40 px-6 max-w-5xl mx-auto text-gray-900 dark:text-white min-h-screen relative z-10 pb-20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4 group">
                    <User className="text-orange-500 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" size={40}/>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Dashboard</h1>
                </div>
                
                <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                    className={`px-6 py-2.5 rounded-full font-bold transition-all duration-300 text-sm flex items-center gap-2 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] ${isEditing ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-white/10 hover:bg-orange-500 hover:text-white'}`}
                >
                    {isEditing ? <><Check size={16} /> Save Profile</> : <><Settings size={16} /> Edit Profile</>}
                </button>
            </div>
            
            <div className="relative bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl p-10 rounded-[32px] border border-gray-200 dark:border-white/10 shadow-2xl mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 transition-all overflow-hidden group hover:border-orange-500/30">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative z-10">
                    <img src={user.picture || ASSETS.fallbackFood} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-white dark:border-[#18181b] rounded-full"></div>
                </div>
                <div className="text-center md:text-left flex-1 w-full z-10">
                    
                    {isEditing ? (
                        <div className="mb-4 flex flex-col md:flex-row items-center md:items-start gap-3 w-full">
                            <input 
                                type="text" 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-5 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-gray-900 dark:text-white font-black text-2xl w-full max-w-sm transition-all shadow-inner"
                                autoFocus
                            />
                            <button onClick={() => { setIsEditing(false); setEditName(user.name); }} className="text-sm font-bold text-gray-500 hover:text-red-500 px-4 py-3 bg-gray-100 dark:bg-white/5 rounded-2xl transition-colors">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <h2 className="text-3xl font-black mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-500 transition-all duration-500">{user.name}</h2>
                    )}
                    
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">{user.email}</p>
                    <div className="flex justify-center md:justify-start gap-6">
                        <div className="bg-gray-50 dark:bg-white/5 px-6 py-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center min-w-[120px] hover:scale-105 hover:-translate-y-1 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg cursor-default">
                            <p className="text-3xl font-black text-orange-500 mb-1 drop-shadow-sm">{recentRecipes.length}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Viewed</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 px-6 py-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center min-w-[120px] hover:scale-105 hover:-translate-y-1 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg cursor-default">
                            <p className="text-3xl font-black text-orange-500 mb-1 drop-shadow-sm">PRO</p>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plan</p>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-black mb-6 flex items-center gap-2"><Clock className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]"/> Recently Viewed Recipes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentRecipes.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-white/5 rounded-[32px] border border-dashed border-gray-300 dark:border-white/10">
                        <Search className="mx-auto mb-4 opacity-50" size={40} />
                        <p className="font-bold">No recent cooking history.</p>
                        <p className="text-sm">Start exploring recipes to build your dashboard!</p>
                    </div>
                ) : (
                    recentRecipes.map((recipe, i) => (
                        <motion.div 
                            whileHover={{ y: -8 }} 
                            key={i} 
                            onClick={() => onSelectRecipe(recipe)} 
                            className="relative bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl p-5 rounded-[24px] border border-gray-200 dark:border-white/10 cursor-pointer hover:border-orange-500/50 transition-all duration-500 shadow-sm hover:shadow-[0_20px_40px_rgba(249,115,22,0.15)] flex items-center gap-5 group overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/20 blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            
                            <img src={recipe.image || ASSETS.fallbackFood} className="relative z-10 w-20 h-20 rounded-[16px] object-cover shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500" />
                            <div className="relative z-10 flex-1 overflow-hidden">
                                <h4 className="font-bold text-lg line-clamp-1 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-500 transition-all duration-300">{recipe.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    <span className="flex items-center gap-1"><Clock size={12} className="group-hover:text-orange-500 transition-colors"/> {recipe.time}</span>
                                    <span className="flex items-center gap-1"><Flame size={12} className="group-hover:text-orange-500 transition-colors"/> {recipe.diet}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

// --- ANIMATED ABOUT PAGE ---
const AboutPage = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-40 px-6 max-w-5xl mx-auto text-gray-900 dark:text-white min-h-screen relative z-10">
        <div className="flex items-center gap-4 mb-8">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                <Info className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" size={48}/>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">About CulinAI</h1>
        </div>
        <div className="bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl p-10 md:p-16 rounded-[40px] border border-gray-200 dark:border-white/10 shadow-2xl space-y-8 text-lg text-gray-700 dark:text-gray-300 leading-relaxed relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[100px] pointer-events-none"></div>
            
            <p className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white">Welcome to <strong>AI Cooking Assistant</strong>, your intelligent culinary companion. We built this platform to revolutionize how you approach cooking.</p>
            <p>Using advanced <strong>YOLOv8 Computer Vision</strong>, our app can look at the ingredients in your fridge and instantly suggest delicious recipes. We've also integrated <strong>Natural Language Processing</strong> so you can talk to the app and have it read instructions back to you hands-free while you cook.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-gray-50 dark:bg-[#121212] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)] hover:border-orange-500/30 transition-all duration-500">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <Camera className="text-orange-500 mb-6 transform group-hover:scale-110 transition-transform duration-500" size={40}/>
                    <h3 className="text-xl text-gray-900 dark:text-white font-black mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-500 transition-all">Vision AI</h3>
                    <p className="text-sm">Auto-detect ingredients from your photos instantly.</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#121212] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)] hover:border-orange-500/30 transition-all duration-500">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <Mic className="text-orange-500 mb-6 transform group-hover:scale-110 transition-transform duration-500" size={40}/>
                    <h3 className="text-xl text-gray-900 dark:text-white font-black mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-500 transition-all">Voice Assistant</h3>
                    <p className="text-sm">Hands-free recipe navigation and step-by-step guidance.</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#121212] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)] hover:border-orange-500/30 transition-all duration-500">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <Zap className="text-orange-500 mb-6 transform group-hover:scale-110 transition-transform duration-500" size={40}/>
                    <h3 className="text-xl text-gray-900 dark:text-white font-black mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-500 transition-all">Smart Search</h3>
                    <p className="text-sm">Find meals perfectly tailored by diet, time, or cuisine.</p>
                </div>
            </div>
        </div>
    </motion.div>
);

// --- ANIMATED CONTACT PAGE ---
const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle');

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch("https://formsubmit.co/ajax/atharvaborsutkar@gmail.com", {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    _subject: "New Feedback from AI Cooking Assistant!",
                    Name: formData.name,
                    Email: formData.email,
                    Message: formData.message
                })
            });
            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else setStatus('error');
        } catch (err) { setStatus('error'); }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-40 px-6 max-w-2xl mx-auto text-gray-900 dark:text-white min-h-screen relative z-10">
            <div className="flex items-center gap-4 mb-8">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                    <Mail className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" size={40}/>
                </motion.div>
                <h1 className="text-5xl font-black tracking-tight">Get in Touch</h1>
            </div>
            
            <div className="relative bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl p-10 rounded-[40px] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">
                {/* Glowing Ambient Background Orbs */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10">
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl text-green-600 font-bold flex items-center gap-3">
                                <Check size={20} /> Message sent successfully!
                            </motion.div>
                        )}
                        {status === 'error' && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 font-bold flex items-center gap-3">
                                <X size={20} /> Failed to send message. Please try again.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="group">
                            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 group-focus-within:text-orange-500 transition-colors">Your Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-gray-900 dark:text-white" required/>
                        </div>
                        <div className="group">
                            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 group-focus-within:text-orange-500 transition-colors">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-gray-900 dark:text-white" required/>
                        </div>
                        <div className="group">
                            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 group-focus-within:text-orange-500 transition-colors">Message</label>
                            <textarea rows="4" name="message" value={formData.message} onChange={handleChange} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-gray-900 dark:text-white" required></textarea>
                        </div>
                        
                        <button disabled={status === 'loading'} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black text-lg py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_10px_30px_rgba(249,115,22,0.4)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3">
                            {status === 'loading' ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className="transform group-hover:translate-x-1 transition-transform" />}
                            {status === 'loading' ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

const CookingLoader = () => (
  <div className="flex flex-col items-center justify-center py-20 min-h-[400px] relative z-10">
    <div className="relative w-40 h-40 mb-8">
      <motion.div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-orange-500 border-r-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.5)]" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute inset-4 rounded-full border-[4px] border-transparent border-b-gray-400 dark:border-b-white border-l-gray-400 dark:border-l-white opacity-50" animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 1.5, repeat: Infinity }}>🥘</motion.div>
    </div>
    <p className="text-gray-800 dark:text-white text-xl font-bold tracking-[0.2em] animate-pulse">GENERATING RECIPES</p>
  </div>
);

// --- ANIMATED CINEMATIC CARDS ---
const CinematicCard = ({ title, subtitle, tag, image, onClick }) => (
  <motion.div 
      whileHover={{ scale: 1.02, y: -8 }} 
      onClick={onClick} 
      className="relative h-72 md:h-80 rounded-[32px] overflow-hidden cursor-pointer group shadow-lg hover:shadow-[0_20px_40px_rgba(249,115,22,0.15)] border border-gray-200/50 dark:border-white/5 hover:border-orange-500/50 transition-all duration-500 bg-[#121212]"
  >
    <div className="absolute inset-0">
        <img src={image && image.startsWith('http') ? image : ASSETS.fallbackFood} 
             onError={(e) => { e.target.onerror = null; e.target.src = ASSETS.fallbackFood; }}
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1 opacity-90 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-500" />
    </div>
    
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/30 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

    <div className="relative z-10 h-full flex flex-col justify-end p-8">
      {tag && (
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full w-fit mb-4 shadow-lg border border-white/20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              {tag}
          </span>
      )}
      <h3 className="text-2xl md:text-3xl font-black text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-300 group-hover:to-red-400 transition-all duration-300">{title}</h3>
      
      <div className="relative h-6 overflow-hidden mt-1">
          <p className="text-gray-300 text-sm font-medium absolute inset-0 transform translate-y-0 group-hover:-translate-y-full transition-transform duration-500">{subtitle}</p>
          <p className="text-orange-400 text-sm font-bold absolute inset-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2">
              Explore Recipe <ArrowRight size={14} />
          </p>
      </div>
    </div>
  </motion.div>
);

// --- ANIMATED RECIPE CARDS (SEARCH RESULTS) ---
const RecipeCard = ({ recipe, index, onClick }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: index * 0.1 }} 
        onClick={onClick} 
        className="relative rounded-[32px] overflow-hidden bg-white/90 dark:bg-[#121212]/90 backdrop-blur-lg border border-gray-200 dark:border-white/5 group cursor-pointer hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(249,115,22,0.15)] flex flex-col h-full"
    >
        {/* Hidden Glowing Orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>

        <div className="h-56 relative overflow-hidden z-10">
            <img src={recipe.image && recipe.image.startsWith('http') ? recipe.image : ASSETS.fallbackFood} 
                 onError={(e) => { e.target.onerror = null; e.target.src = ASSETS.fallbackFood; }}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-gray-900 dark:text-white flex gap-1.5 items-center shadow-lg"><Star size={14} className="text-yellow-500 fill-yellow-500"/> 4.5</div>
        </div>
        <div className="p-6 relative z-10 flex flex-col flex-1 justify-between">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 transition-all duration-300">{recipe.title}</h3>
            
            <div className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-auto">
                <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-orange-500"/> {recipe.time}</span>
                    <span className="flex items-center gap-1.5"><Flame size={14} className="text-orange-500"/> {recipe.diet}</span>
                </div>
                <button className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-orange-500 text-gray-900 dark:text-white group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1 shadow-sm group-hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)]">
                    <ArrowRight size={18} className="transform group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    </motion.div>
);

const IngredientDropdown = ({ isOpen, onClose, selectedIngredients, toggleIngredient }) => (
    <AnimatePresence>{isOpen && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 mt-4 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-3xl rounded-[32px] border border-gray-200 dark:border-white/10 shadow-2xl z-[999] overflow-hidden"><div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-6">{Object.entries(INGREDIENT_CATEGORIES).map(([category, items]) => (<div key={category}><h4 className="text-orange-500 font-black text-xs uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-white/10 pb-2">{category}</h4><div className="space-y-1">{items.map((item) => (<button key={item} onClick={() => toggleIngredient(item)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all font-medium flex items-center justify-between ${selectedIngredients.includes(item) ? 'bg-orange-500 text-white font-bold' : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>{item} {selectedIngredients.includes(item) && <Check size={14} />}</button>))}</div></div>))}</div><div className="bg-gray-50 dark:bg-black/40 p-4 text-center text-xs font-bold uppercase tracking-widest text-gray-500 border-t border-gray-200 dark:border-white/5 cursor-pointer hover:text-orange-500 transition-colors" onClick={onClose}>Close Panel</div></motion.div>)}</AnimatePresence>
);

// --- ANIMATED RECIPE DETAIL PAGE ---
const RecipeDetailPage = ({ recipe, onBack }) => {
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { speak } = useSpeech();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: `Hi Chef! I'm your AI Sous-Chef. Do you have any questions about making ${recipe.title}?` }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  const steps = recipe.instructions ? recipe.instructions.split('.').filter(s => s.length > 5) : ["Instructions not available."];

  useEffect(() => { if (cookingMode) speak(`Step ${currentStep + 1}. ${steps[currentStep]}`); }, [cookingMode, currentStep]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handleSendMessage = async (e) => {
      e.preventDefault();
      if(!chatInput.trim()) return;
      
      const userText = chatInput;
      setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
      setChatInput('');
      setIsChatting(true);

      try {
          const res = await fetch(`${API_URL}/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: userText, recipeContext: { title: recipe.title, ingredients: recipe.ingredients, instructions: recipe.instructions }})
          });
          const data = await res.json();
          setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      } catch (error) {
          setChatMessages(prev => [...prev, { role: 'ai', text: "Sorry, I lost connection to the kitchen! Please check if the Flask backend is running." }]);
      }
      setIsChatting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="relative z-10 pt-28 text-gray-900 dark:text-white font-sans pb-20">
      
      <div className="relative h-[45vh] w-full rounded-b-[40px] overflow-hidden shadow-2xl">
        <img src={recipe.image && recipe.image.startsWith('http') ? recipe.image : ASSETS.fallbackFood} 
             onError={(e) => { e.target.onerror = null; e.target.src = ASSETS.fallbackFood; }}
             className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-900/40 to-transparent dark:from-[#050505] dark:via-black/60 dark:to-transparent" />
        <button onClick={onBack} className="absolute top-8 left-8 bg-white/80 dark:bg-black/40 backdrop-blur-md p-4 rounded-full hover:bg-white dark:hover:bg-white/20 transition-all hover:-translate-x-2 z-50 text-gray-900 dark:text-white shadow-lg"><ArrowLeft /></button>
        <div className="absolute bottom-0 left-0 w-full p-10 max-w-7xl mx-auto"><span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block shadow-lg">{recipe.cuisine}</span><h1 className="text-5xl md:text-7xl font-black mb-2 leading-tight drop-shadow-md text-gray-900 dark:text-white">{recipe.title}</h1></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2"><UtensilsCrossed className="text-orange-500"/> Ingredients</h3>
            <div className="bg-white/90 dark:bg-[#121212]/80 backdrop-blur-md p-8 rounded-[32px] border border-gray-200 dark:border-white/10 space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((ing, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all hover:scale-105 border border-transparent font-medium cursor-default">
                            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                            <span>{ing}</span>
                        </div>
                    ))
                ) : <p className="text-gray-500 italic">No ingredients listed.</p>}
            </div>
        </div>
        
        <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black flex items-center gap-2"><BrainCircuit className="text-orange-500"/> Instructions</h3>
                <button onClick={() => setCookingMode(!cookingMode)} className={`flex items-center gap-2 px-8 py-3 rounded-full font-black transition-all duration-300 shadow-lg hover:-translate-y-1 hover:shadow-xl ${cookingMode ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-green-600 text-white hover:bg-green-500'}`}>{cookingMode ? <><X size={18}/> Stop</> : <><Play size={18}/> Start Cooking</>}</button>
            </div>
            
            <AnimatePresence>
                {cookingMode && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 border border-orange-200 dark:border-orange-500/30 rounded-[32px] p-10 text-center overflow-hidden shadow-2xl relative">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 blur-[50px] rounded-full pointer-events-none"></div>
                        <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_30px_rgba(249,115,22,0.6)] relative z-10"><Volume2 size={40} className="text-white"/></div>
                        <h4 className="text-2xl font-black mb-4 text-gray-900 dark:text-white relative z-10">Step {currentStep + 1}</h4>
                        <p className="text-xl mb-10 font-medium text-gray-800 dark:text-gray-200 relative z-10">{steps[currentStep]}</p>
                        <div className="flex justify-center gap-6 relative z-10">
                            <button onClick={() => setCurrentStep(c => Math.max(0, c-1))} className="p-5 rounded-full bg-white dark:bg-[#121212] hover:bg-gray-100 dark:hover:bg-white/10 shadow-md text-gray-900 dark:text-white hover:scale-110 transition-transform"><SkipBack/></button>
                            <button onClick={() => speak(steps[currentStep])} className="p-5 rounded-full bg-orange-500 text-white shadow-[0_10px_20px_rgba(249,115,22,0.4)] hover:scale-110 hover:bg-orange-400 transition-all"><RotateCcw/></button>
                            <button onClick={() => setCurrentStep(c => Math.min(steps.length-1, c+1))} className="p-5 rounded-full bg-white dark:bg-[#121212] hover:bg-gray-100 dark:hover:bg-white/10 shadow-md text-gray-900 dark:text-white hover:scale-110 transition-transform"><SkipForward/></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="space-y-6">
                {steps.map((step, i) => (
                    <div key={i} className={`relative overflow-hidden flex gap-6 p-8 rounded-[32px] border transition-all duration-500 group hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(249,115,22,0.1)] hover:border-orange-500/30 ${cookingMode && currentStep === i ? 'bg-white dark:bg-orange-500/10 border-orange-500 shadow-xl scale-[1.02]' : 'bg-white/80 dark:bg-[#121212]/50 border-gray-200 dark:border-white/5 shadow-sm'}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <div className={`text-3xl font-black transition-colors duration-500 ${cookingMode && currentStep === i ? 'text-orange-500' : 'text-gray-300 dark:text-gray-700 group-hover:text-orange-400'}`}>0{i + 1}</div>
                        <p className="text-lg leading-relaxed font-medium text-gray-700 dark:text-gray-300 relative z-10">{step}.</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
          <AnimatePresence>
              {chatOpen && (
                  <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="mb-4 w-80 md:w-96 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 flex justify-between items-center text-white shadow-md z-10">
                          <div className="flex items-center gap-2 font-black"><ChefHat size={20} /> AI Sous-Chef</div>
                          <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={16}/></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                          {chatMessages.map((msg, idx) => (
                              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}>
                                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-[#252525] text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-white/5'}`}>{msg.text}</div>
                              </div>
                          ))}
                          {isChatting && (<div className="flex justify-start"><div className="p-4 rounded-2xl bg-gray-100 dark:bg-[#252525] rounded-bl-sm flex gap-1.5 items-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full"/><motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full"/><motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full"/></div></div>)}
                          <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-white/5 flex gap-2 bg-white dark:bg-[#18181b] z-10">
                          <input type="text" placeholder="Ask a cooking question..." className="flex-1 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 text-gray-900 dark:text-white transition-colors" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                          <button type="submit" disabled={isChatting} className="bg-orange-500 text-white p-3 rounded-2xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center hover:shadow-[0_5px_15px_rgba(249,115,22,0.3)] hover:-translate-y-0.5"><Send size={18} /></button>
                      </form>
                  </motion.div>
              )}
          </AnimatePresence>
          <button onClick={() => setChatOpen(!chatOpen)} className={`p-4 rounded-full shadow-[0_15px_30px_rgba(249,115,22,0.4)] text-white transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 flex items-center justify-center ${chatOpen ? 'bg-gray-800 dark:bg-white/10 shadow-none hover:shadow-lg' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}>{chatOpen ? <X size={28} /> : <MessageSquare size={28} />}</button>
      </div>
    </motion.div>
  );
};

// --- ANIMATED DASHBOARD ---
const Dashboard = ({ user, onSelectRecipe }) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recipes, setRecipes] = useState(null);
  const [quickRecipes, setQuickRecipes] = useState([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isListeningUI, setIsListeningUI] = useState(false); 
  const { speak } = useSpeech();
  const fileInputRef = useRef(null);

  useEffect(() => { fetch(`${API_URL}/recipes?search=quick_suggestions`).then(res => res.json()).then(data => setQuickRecipes(data)); }, []);
  useEffect(() => { if (selectedIngredients.length > 0) setQuery(selectedIngredients.join(", ")); }, [selectedIngredients]);
  const toggleIngredient = (item) => { setSelectedIngredients(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]); };
  
  const startListening = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return alert("Voice input not supported in this browser.");
    setIsListeningUI(true);
    const recognition = new Recognition();
    recognition.lang = 'en-IN'; 
    recognition.onend = () => setIsListeningUI(false);
    recognition.onerror = () => setIsListeningUI(false);
    recognition.start();
    recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setQuery(text);
        handleSearch(text); 
        setIsListeningUI(false); 
    };
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSearching(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_URL}/detect`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const detected = data.ingredients.join(", ");
        setQuery(detected);
        handleSearch(detected);
      } else { setIsSearching(false); }
    } catch (error) { setIsSearching(false); }
  };

  const handleSearch = async (term) => {
    const q = typeof term === 'string' ? term : query;
    setIsSearching(true);
    setRecipes(null);
    setShowIngredients(false);
    try {
        const res = await fetch(`${API_URL}/recipes?search=${q}`);
        const data = await res.json();
        setRecipes(data);
        setIsSearching(false);
    } catch (e) { 
        console.error("Backend Error", e); 
        setIsSearching(false); 
    }
  };

  return (
      <div className="relative z-10 pt-40 px-4 max-w-7xl mx-auto pb-40">
        <AnimatePresence>
            {isListeningUI && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-md">
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-white dark:bg-[#18181b] w-full sm:w-auto sm:min-w-[400px] p-10 rounded-t-[40px] sm:rounded-[40px] flex flex-col items-center shadow-2xl border border-gray-200 dark:border-white/10 pb-16 sm:pb-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>
                        <div className="flex gap-2 mb-8 h-16 items-center">
                            {[0, 1, 2, 3].map((i) => (<motion.div key={i} animate={{ height: ["20%", "100%", "20%"] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: "easeInOut" }} className={`w-3 rounded-full ${['bg-blue-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'][i]}`} />))}
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Listening...</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">What do you want to cook today?</p>
                        <button onClick={() => setIsListeningUI(false)} className="px-8 py-3 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-red-50 dark:hover:bg-red-500/20 text-gray-700 dark:hover:text-red-500 dark:text-gray-300 font-bold transition-all">Cancel</button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {quickRecipes.length > 0 && !isSearching && !recipes && (
            <div className="mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}>
                        <Zap className="text-orange-500 fill-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" size={36} />
                    </motion.div> 
                    Today's Specials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {quickRecipes.map((recipe, i) => <CinematicCard key={i} title={recipe.title} subtitle={`${recipe.time} • ${recipe.cuisine}`} tag="Featured" image={recipe.image} onClick={() => onSelectRecipe(recipe)} />)}
                </div>
            </div>
        )}

        <div className="text-center mb-16">
            <motion.h1 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-5xl md:text-7xl font-black mb-4 text-gray-900 dark:text-white drop-shadow-sm">
                What's in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Kitchen?</span>
            </motion.h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Select a cooking style or start searching below.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {MODES.map((mode, i) => <CinematicCard key={i} title={mode.title} subtitle={mode.subtitle} tag={mode.tag} image={mode.image} onClick={() => handleSearch(mode.tag)} />)}
        </div>

        <div className={`relative max-w-4xl mx-auto z-50 transition-all duration-500 ${showIngredients ? 'mb-[600px]' : 'mb-16'}`}>
            <div className={`relative bg-white dark:bg-[#18181b] p-2.5 rounded-[32px] border flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-xl hover:border-orange-500/30 ${showIngredients ? 'border-orange-500/50 ring-4 ring-orange-500/10' : 'border-gray-200 dark:border-white/10'}`}>
              <button onClick={() => setShowIngredients(!showIngredients)} className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 ${showIngredients ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-orange-500'}`}><UtensilsCrossed size={18} /> Ingredients <ChevronDown size={14}/></button>
              <input type="text" placeholder="Select or type ingredients..." className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white text-lg font-medium h-14 px-6 placeholder:text-gray-400" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="p-3 mr-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm" title="AI Camera"><Camera size={22} /></button>
              <button onClick={startListening} className="p-3 mr-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm"><Mic size={22} /></button>
              <button onClick={() => handleSearch(query)} className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black rounded-2xl hover:shadow-[0_10px_25px_rgba(249,115,22,0.4)] transition-all flex items-center gap-2 hover:-translate-y-1">COOK</button>
            </div>
            <IngredientDropdown isOpen={showIngredients} onClose={() => setShowIngredients(false)} selectedIngredients={selectedIngredients} toggleIngredient={toggleIngredient} />
        </div>

        <div className={`transition-all duration-500 ease-in-out ${showIngredients ? 'min-h-[650px]' : 'min-h-[200px]'}`}>
            {isSearching ? (<CookingLoader />) : recipes ? (<div className="grid grid-cols-1 md:grid-cols-3 gap-8">{recipes.map((recipe, index) => <RecipeCard key={index} recipe={recipe} index={index} onClick={() => onSelectRecipe(recipe)} />)}</div>) : null}
        </div>
      </div>
  );
};

const Footer = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        try {
            const res = await fetch("https://formsubmit.co/ajax/atharvaborsutkar@gmail.com", {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ _subject: "New Newsletter Subscriber! 🎉", Email: email, Message: "I would like to subscribe to the AI Cooking Assistant newsletter!" })
            });
            if (res.ok) {
                setStatus('success');
                setEmail('');
                setTimeout(() => setStatus('idle'), 5000);
            } else setStatus('error');
        } catch (err) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
      <footer className="relative z-10 w-full pt-20 pb-12 overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500">
         <div className="max-w-2xl mx-auto text-center px-4 mb-32 relative">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Subscribe to our newsletter</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Sign up today and get a free sample up to 100 recipes.</p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4 relative z-20 group" onSubmit={handleSubscribe}>
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-gray-900 dark:text-white transition-all shadow-sm" required />
              </div>
              <button disabled={status === 'loading'} className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 flex items-center justify-center min-w-[140px]">
                  {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : 'Get started'}
              </button>
            </form>

            <div className="h-6 mb-6">
                <AnimatePresence mode="wait">
                    {status === 'success' && (<motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-green-500 font-bold text-sm flex items-center justify-center gap-2"><Check size={16} /> Successfully subscribed!</motion.p>)}
                    {status === 'error' && (<motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 font-bold text-sm flex items-center justify-center gap-2"><X size={16} /> Error subscribing. Try again.</motion.p>)}
                </AnimatePresence>
            </div>
            
            <div className="flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-bold relative z-10 hover:text-orange-500 transition-colors cursor-pointer group">
               Our experts are ready to help! 
               <div className="flex -space-x-2 group-hover:space-x-1 transition-all duration-300">
                 <img src="https://i.pravatar.cc/100?img=11" alt="Expert" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] shadow-sm hover:scale-110 transition-transform" />
                 <img src="https://i.pravatar.cc/100?img=12" alt="Expert" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] shadow-sm hover:scale-110 transition-transform" />
                 <img src="https://i.pravatar.cc/100?img=13" alt="Expert" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] shadow-sm hover:scale-110 transition-transform" />
                 <img src="https://i.pravatar.cc/100?img=14" alt="Expert" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] shadow-sm hover:scale-110 transition-transform" />
               </div>
            </div>
         </div>
  
         <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
            <div className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 -translate-y-1/2 bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-20 hover:shadow-[0_30px_80px_rgba(249,115,22,0.2)] transition-shadow duration-700 group">
               <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
               <div className="flex flex-col md:flex-row items-center justify-between p-10 md:p-16 relative">
                  <div className="z-10 text-left max-w-lg">
                     <h3 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-orange-200 transition-all duration-500">Experience smarter cooking</h3>
                     <p className="text-gray-400 text-lg mb-8 font-medium">4,000+ AI curated recipes instantly.</p>
                     <button className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-orange-500 hover:text-white transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(249,115,22,0.4)]">Get started</button>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none overflow-hidden hidden md:block">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_center,rgba(249,115,22,0.4),transparent_70%)] group-hover:scale-110 transition-transform duration-1000"></div>
                      <BrainCircuit className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] text-white opacity-40 group-hover:rotate-12 transition-transform duration-1000" strokeWidth={0.5} />
                  </div>
               </div>
            </div>
  
            <div className="bg-[#0a0a0a] rounded-[40px] pt-48 pb-12 px-8 md:px-16 text-white z-10 relative shadow-2xl border border-white/5">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                  <div className="lg:col-span-2">
                     <div className="flex items-center gap-3 text-2xl font-black tracking-tighter text-white mb-8 group cursor-default"><ChefHat size={32} className="text-orange-500 group-hover:rotate-12 transition-transform" /> AI Cooking Assistant</div>
                     <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 text-sm">
                        <div className="group cursor-pointer"><p className="text-gray-500 font-bold mb-1 group-hover:text-orange-400 transition-colors">Phone number</p><p className="text-white font-medium">1-800-123-COOK</p></div>
                        <div className="group cursor-pointer"><p className="text-gray-500 font-bold mb-1 group-hover:text-orange-400 transition-colors">Email</p><p className="text-white font-medium">support@aicooking.com</p></div>
                     </div>
                  </div>
                  <div>
                     <h4 className="text-gray-500 font-bold mb-6">Quick links</h4>
                     <ul className="space-y-4 text-sm font-medium text-gray-300">
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">Pricing</a></li>
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">Resources</a></li>
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">About us</a></li>
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">FAQ</a></li>
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">Contact us</a></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="text-gray-500 font-bold mb-6">Social</h4>
                     <ul className="space-y-4 text-sm font-medium text-gray-300">
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">Facebook</a></li>
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">Instagram</a></li>
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">LinkedIn</a></li>
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">Twitter</a></li>
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">Youtube</a></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="text-gray-500 font-bold mb-6">Legal</h4>
                     <ul className="space-y-4 text-sm font-medium text-gray-300">
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">Terms of service</a></li>
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">Privacy policy</a></li>
                        <li><a href="#" className="hover:text-orange-500 hover:pl-2 transition-all block">Cookie policy</a></li>
                     </ul>
                  </div>
               </div>
               <div className="text-center text-sm font-medium text-gray-600 pt-8 border-t border-white/5">© 2026 AI Cooking Assistant. All rights reserved.</div>
            </div>
         </div>
      </footer>
    );
};

function MainApp() {
  const [user, setUser] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState([]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const savedUser = localStorage.getItem('culinai_user');
    if (savedUser) { 
        setUser(JSON.parse(savedUser)); 
        setShowLanding(false); 
    }
  }, []);

  useEffect(() => {
    if (user && user.email) {
        const savedRecent = localStorage.getItem(`culinai_recent_recipes_${user.email}`);
        setRecentRecipes(savedRecent ? JSON.parse(savedRecent) : []);
    } else {
        setRecentRecipes([]);
    }
  }, [user]);

  const handleLogin = (userData) => { 
      setUser(userData); 
      localStorage.setItem('culinai_user', JSON.stringify(userData)); 
  };
  
  const handleUpdateUser = (updatedUser) => {
      setUser(updatedUser);
      localStorage.setItem('culinai_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => { 
      setUser(null); 
      setSelectedRecipe(null); 
      localStorage.removeItem('culinai_user'); 
      setShowLanding(true); 
      setActivePage('home'); 
  };
  
  const handleRecipeClick = (recipe) => {
    setActivePage('home');
    setSelectedRecipe(recipe);
    
    if(recipe && user && user.email) {
        const updated = [recipe, ...recentRecipes.filter(r => r.title !== recipe.title)].slice(0, 15);
        setRecentRecipes(updated);
        localStorage.setItem(`culinai_recent_recipes_${user.email}`, JSON.stringify(updated));
    }
  };

  if (showLanding && !user) return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="cursor-none selection:bg-orange-500/30">
          <CustomCursor />
          <LandingPage onGetStarted={() => setShowLanding(false)} />
      </div>
  );
  
  if (!user) return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="cursor-none selection:bg-orange-500/30">
          <CustomCursor />
          <AuthScreen onLogin={handleLogin} />
      </div>
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white transition-colors duration-500 overflow-x-hidden cursor-none selection:bg-orange-500/30">
      <CustomCursor />
      <BackgroundCarousel images={ASSETS.bgs} overlayType="dashboard" />
      <Navbar user={user} onLogout={handleLogout} onToggleSidebar={() => setSidebarOpen(true)} activePage={activePage} setPage={setActivePage} />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} recentRecipes={recentRecipes} onSelectRecipe={handleRecipeClick} />

      <AnimatePresence mode="wait">
          {activePage === 'about' && !selectedRecipe ? <AboutPage key="about" /> : 
           activePage === 'contact' && !selectedRecipe ? <ContactPage key="contact" /> : 
           activePage === 'profile' && !selectedRecipe ? <ProfilePage key="profile" user={user} recentRecipes={recentRecipes} onSelectRecipe={handleRecipeClick} onUpdateUser={handleUpdateUser} /> :
           selectedRecipe ? <RecipeDetailPage key="recipe" recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} /> : 
           <Dashboard key="dashboard" user={user} onSelectRecipe={handleRecipeClick} />}
      </AnimatePresence>

      {!selectedRecipe && <Footer />}

    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId="PASTE_YOUR_REAL_CLIENT_ID_HERE">
      <MainApp />
    </GoogleOAuthProvider>
  );
}
