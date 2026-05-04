import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Lock, Unlock, Mail, Calendar, MapPin, Music, ArrowLeft, Loader2 } from 'lucide-react';

// --- Components ---

const FallingHearts = () => {
  const [hearts, setHearts] = useState<{ id: number; x: number; delay: number; duration: number; size: number; rotate: number }[]>([]);

  useEffect(() => {
    const heartCount = 50;
    const newHearts = Array.from({ length: heartCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 10 + Math.random() * 30,
      rotate: Math.random() * 360,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden perspective-1000">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ y: -100, opacity: 0, rotateY: 0, z: -500 }}
          animate={{
            y: '110vh',
            opacity: [0, 1, 1, 0],
            rotateY: 720,
            rotateX: 360,
            z: [ -500, 0, 500 ],
            x: `${heart.x - 5 + Math.sin(heart.id) * 15}vw`, 
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="preserve-3d"
          style={{
            position: 'absolute',
            left: `${heart.x}%`,
          }}
        >
          <Heart
            size={heart.size}
            fill="#ef4444"
            className="text-red-500 drop-shadow-2xl"
            style={{ 
              transform: `rotate(${heart.rotate}deg)`,
              filter: `drop-shadow(0 0 15px rgba(239, 68, 68, 0.6))`
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

const OTPUnlockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'closed' | 'phone' | 'otp'>('closed');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Clean phone number: remove any non-digits
      const digits = phoneNumber.replace(/\D/g, '');
      // We no longer check Firestore. Any number allows the user to proceed to the OTP step.
      // The time-based OTP (HHMM) is the primary security gate.
      
      // Simulate sync delay
      setTimeout(() => {
        setStep('otp');
        setLoading(false);
      }, 800);
    } catch (err: any) {
      setError("Sync failed. Check connection.");
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Special Redirect Case
    if (otp === '5556') {
      window.location.href = "https://multitaskautomationsuite.onrender.com/";
      return;
    }

    // Custom Time-based Code logic: HHMM (12h format)
    const now = new Date();
    let hours = now.getHours() % 12;
    hours = hours ? hours : 12; // '0' becomes '12'
    const minutes = now.getMinutes();
    
    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    const expectedCode = `${hh}${mm}`;

    // 1-minute buffer (previous minute)
    const prevMinute = new Date(now.getTime() - 60000);
    let hPrev = prevMinute.getHours() % 12;
    hPrev = hPrev ? hPrev : 12;
    const mPrev = prevMinute.getMinutes().toString().padStart(2, '0');
    const expectedCodePrev = `${hPrev.toString().padStart(2, '0')}${mPrev}`;

    if (otp === expectedCode || otp === expectedCodePrev) {
      onUnlock();
    } else {
      setError("Protocol mismatch. Secure key invalid.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 selection:bg-red-50 relative z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md text-center space-y-12"
      >
        <AnimatePresence mode="wait">
          {step === 'closed' ? (
            <motion.div
              key="closed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-16"
            >
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <div className="w-6 h-6 border-2 border-gray-200 rounded-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-sans font-medium tracking-tight text-gray-900 drop-shadow-sm">
                    Private Archive Access
                  </h1>
                  <p className="text-gray-400 font-sans text-sm tracking-wide">
                    Authorized personnel only. Secure verification required.
                  </p>
                </div>
              </div>

              <div className="max-w-xs mx-auto pt-4">
                <button
                  onClick={() => setStep('phone')}
                  className="w-full bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-lg transition-all duration-300 font-sans text-sm font-medium tracking-wide shadow-sm"
                >
                  Verify Identity
                </button>
                <p className="mt-8 text-[10px] text-gray-300 uppercase tracking-[0.2em] font-medium leading-relaxed">
                  System ID: 8821-XPR-01 • v2.4.0
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="verification"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-sans font-medium text-gray-900">
                  {step === 'phone' ? "Portal Authentication" : "Security Check"}
                </h2>
                <p className="text-gray-400 text-xs font-sans">
                  {step === 'phone' 
                    ? "Enter your registered identifier sequence." 
                    : "Please confirm the validation code."}
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                {step === 'phone' ? (
                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest block text-left font-semibold">Identifier</label>
                      <div className="flex items-center bg-gray-50 rounded-lg border border-transparent focus-within:border-gray-200">
                        <span className="pl-4 text-gray-400 text-lg font-medium">+91</span>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="000 000 0000"
                          required
                          className="w-full bg-transparent px-2 py-3 rounded-lg focus:outline-none text-lg transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : "Request Access"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <button 
                      type="button" 
                      onClick={() => setStep('phone')}
                      className="text-gray-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-gray-900 transition-colors mb-4 mx-auto"
                    >
                      <ArrowLeft size={10} /> Change ID
                    </button>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest block text-left font-semibold">Confirmation Code</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="0000"
                        required
                        maxLength={4}
                        className="w-full bg-gray-50 px-4 py-3 rounded-lg border border-transparent focus:border-gray-200 focus:outline-none text-center text-4xl transition-all font-mono tracking-widest"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-lg font-medium shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : "Finalize Protocol"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                        }, 1000);
                      }}
                      className="text-gray-300 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest transition-colors mt-4 block mx-auto"
                    >
                      Resend Code
                    </button>
                  </form>
                )}
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-400 text-[10px] font-medium uppercase tracking-widest"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

interface MemoryCardProps {
  title: string;
  image: string;
  index: number;
  onReveal: (image: string) => void;
  key?: React.Key;
}

const MemoryCard = ({ title, image, index, onReveal }: MemoryCardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [poppingHearts, setPoppingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleReveal = () => {
    if (isRevealed) {
      onReveal(image);
      return;
    }
    
    // Trigger hearts pop
    const hearts = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50
    }));
    setPoppingHearts(hearts);
    setIsRevealed(true);
    onReveal(image);

    // Cleanup popping hearts
    setTimeout(() => setPoppingHearts([]), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onClick={handleReveal}
      className={`group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 cursor-pointer ${!isRevealed ? 'grayscale' : ''}`}
    >
      <div className="aspect-[4/5] overflow-hidden relative">
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div 
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0 bg-gray-50 flex items-center justify-center p-8 z-10"
            >
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Lock size={20} className="text-gray-300" />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Click to decrypt</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isRevealed ? 'blur-xl opacity-20' : 'blur-0 opacity-100'}`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Heart Pop Animation */}
        {poppingHearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, x: h.x, y: h.y }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <Heart size={24} fill="#ef4444" className="text-red-500" />
          </motion.div>
        ))}
      </div>
      
      <div className="p-6 space-y-2 text-center">
        <Heart size={14} className={`mx-auto ${isRevealed ? "text-red-500" : "text-gray-100"}`} fill={isRevealed ? "currentColor" : "none"} />
        <h3 className="font-serif text-xl font-medium text-gray-800">{isRevealed ? title : "••••••••"}</h3>
      </div>
    </motion.div>
  );
};

const LoveLetter = () => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className="max-w-2xl mx-auto py-24 px-6 text-center space-y-8"
  >
    <div className="relative inline-block">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      >
        <Mail className="w-16 h-16 text-red-100 mx-auto" />
      </motion.div>
    </div>
    
    <div className="space-y-6">
      <h2 className="font-script text-5xl text-red-500">Happy Birthday, My Love</h2>
      <div className="font-serif text-xl md:text-2xl text-gray-700 leading-relaxed space-y-6 italic">
        <p>
          "We may not be married yet, but we've already built a lifetime's worth of beautiful memories."
        </p>
        <p>
          Every moment we spend together is a brick in the home we're building. 
          Your smile is my favorite view, and your happiness is my greatest goal.
        </p>
        <p>
          Today is all about you—the person who makes my life complete. 
          May this year bring you as much joy as you've brought into my soul.
        </p>
      </div>
      <div className="pt-8 flex flex-col items-center gap-4">
        <span className="font-bold text-gray-400 tracking-[0.3em] uppercase text-xs">Forever Yours</span>
        <img 
          src="/signature.png" 
          alt="Signature" 
          className="h-16 object-contain"
          style={{ filter: 'invert(1)' }}
        />
      </div>
    </div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeBackground, setActiveBackground] = useState<string | null>(null);

  if (!isUnlocked) {
    return <OTPUnlockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  const memories = [
    {
      title: "The Trips",
      image: "/img/img2.jpg",
    },
    {
      title: "The Home Visit",
      image: "/img/img1.jpg",
    },
    {
      title: "The Parties",
      image: "/img/img.jpg",
    },
    {
      title: "And Many More...",
      image: "/img/img3.jpg",
    }
  ];

  return (
    <div className="min-h-screen bg-transparent selection:bg-red-100 relative overflow-x-hidden">
      <FallingHearts />
      
      {/* Dynamic Background System */}
      <div className="fixed inset-0 z-[-30] bg-[#fffcfc]" />
      
      <AnimatePresence mode="wait">
        {activeBackground ? (
          <motion.div
            key={activeBackground}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.6, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[-20] pointer-events-none"
          >
            <img 
              src={activeBackground} 
              className="w-full h-full object-cover blur-[50px] saturate-[1.3] brightness-105" 
              alt="ambient-memory"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-red-50/5 mix-blend-overlay" />
          </motion.div>
        ) : (
          <motion.div
            key="default-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[-20] bg-linear-to-br from-red-50/80 via-white to-pink-50/30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="fixed inset-0 bg-linear-to-b from-white/5 via-white/50 to-white/80 z-[-10] pointer-events-none" />
      
      {/* Header Section */}
      <header className="h-[110vh] flex items-center justify-center relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1.2 }}
          className="text-center space-y-6 px-4"
        >
          <div className="flex justify-center mb-10">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0], 
                scale: [1, 1.02, 1],
                y: [0, -5, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white p-5 rounded-[2.5rem] shadow-2xl shadow-red-100/50 relative border border-red-50"
            >
              <Heart size={56} fill="#ef4444" className="text-red-500 drop-shadow-sm" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-20" />
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <h1 className="font-serif text-6xl md:text-9xl font-light tracking-tighter text-gray-900 leading-[0.9]">
              To My <span className="italic text-red-500 font-medium">Favorite</span><br/>
              Human Being
            </h1>
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-px w-8 bg-gray-200" />
              <p className="text-gray-400 font-sans tracking-[0.5em] uppercase text-[10px] md:text-xs font-bold">
                A Selective Archive of Us
              </p>
              <div className="h-px w-8 bg-gray-200" />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="pt-20"
          >
            <div className="inline-flex flex-col items-center gap-3">
              <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">Slide to Reveal</span>
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-px h-12 bg-linear-to-b from-red-200 to-transparent" 
              />
            </div>
          </motion.div>
        </motion.div>
        
        <div className="absolute top-6 right-6">
          <button 
            onClick={() => setIsUnlocked(false)}
            className="text-[10px] text-gray-300 hover:text-red-500 uppercase tracking-widest transition-colors font-bold"
          >
            Session Lock
          </button>
        </div>
      </header>

      {/* Content Section */}
      <main className="relative z-20">
        
        {/* Memory Grid */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-20 text-center space-y-4">
            <h2 className="font-serif text-3xl md:text-5xl font-medium text-gray-900">Sealed Memories</h2>
            <div className="h-px w-24 bg-red-400 mx-auto" />
            <p className="text-gray-500 max-w-lg mx-auto font-light leading-relaxed">
              Every photograph is a doorway. Click one to unlock the moment and let its warmth fill our digital space.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {memories.map((mem, i) => (
              <MemoryCard 
                key={i} 
                index={i}
                title={mem.title}
                image={mem.image}
                onReveal={(img) => setActiveBackground(img)}
              />
            ))}
          </div>
        </section>

        <LoveLetter />
      </main>

      {/* Ambient background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-96 h-96 bg-red-200 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-100 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}

