import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = ({ onLoginSuccess }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  
  // Credentials State: Defaulting to Content_Factori_Live with empty password
  const [formData, setFormData] = useState({
    email: 'Content_Factori_Live',
    password: '',
    showPassword: false
  });

  // MFA State
  const [mfaValues, setMfaValues] = useState(['', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Timer for MFA Resend
  useEffect(() => {
    let interval;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Simulated Human Typing for MFA code
  useEffect(() => {
    if (step === 2) {
      // Clear fields initially to ensure the typing animation is visible
      setMfaValues(['', '', '', '']);
      
      const targetCode = ['6', '7', '4', '6'];
      targetCode.forEach((digit, index) => {
        setTimeout(() => {
          setMfaValues(prev => {
            const nextMfa = [...prev];
            nextMfa[index] = digit;
            return nextMfa;
          });
          
          // Move focus to the next input as digits are "typed"
          if (index < 3 && inputRefs[index + 1].current) {
            inputRefs[index + 1].current.focus();
          }
        }, 600 + (index * 450)); // Sequential delay: 600ms, 1050ms, 1500ms, 1950ms
      });
    }
  }, [step]);

  const simulateApi = (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Updated credential check for Content_Factori_Live and demo!
        if (data.email === 'Content_Factori_Live' && data.password === 'demo!') {
          resolve();
        } else {
          reject('Access Denied: Invalid System Credentials');
        }
      }, 1500);
    });
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await simulateApi(formData);
      setStep(2);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaChange = (index, value) => {
    if (isNaN(value)) return;
    const newMfa = [...mfaValues];
    newMfa[index] = value.substring(value.length - 1);
    setMfaValues(newMfa);

    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Auto-submission trigger: executes when all 4 digits are present
  useEffect(() => {
    const code = mfaValues.join('');
    if (code.length === 4) {
      handleMfaSubmit();
    }
  }, [mfaValues]);

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !mfaValues[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleMfaSubmit = (e) => {
    if (e) e.preventDefault();
    const code = mfaValues.join('');
    if (code === '6746') {
      onLoginSuccess();
    } else {
      setError('Security Code Invalid: Access Denied');
      setMfaValues(['', '', '', '']);
      if (inputRefs[0].current) inputRefs[0].current.focus();
    }
  };

  const calculatePasswordStrength = (pass) => {
    if (pass.length === 0) return 0;
    if (pass.length < 5) return 25;
    if (pass === 'demo!') return 100; // Visual feedback for the correct demo password
    return 60;
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-[#111111] rounded-2xl border border-white/5 shadow-2xl relative z-10 overflow-hidden">
        
        <div className="h-1.5 w-full bg-white/5">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: step === 1 ? "33%" : "100%" }}
            className="h-full bg-gradient-to-r from-red-800 to-red-500"
          />
        </div>

        <div className="p-10">
          <header className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                Campaign<span className="text-red-600">Studio</span>
              </h2>
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="h-[1px] w-8 bg-white/10" />
                <p className="text-gray-500 text-[9px] font-bold tracking-[0.4em] uppercase">
                  Terminal Session v4.0
                </p>
                <span className="h-[1px] w-8 bg-white/10" />
              </div>
            </motion.div>
          </header>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCredentialsSubmit}
                className="space-y-6"
              >
                <div className="group">
                  <label className="block text-gray-400 text-[10px] font-black uppercase mb-2 ml-1 tracking-widest transition-colors group-focus-within:text-red-500">
                    User name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-600/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
                    placeholder="Enter Corporate Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="relative group">
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest transition-colors group-focus-within:text-red-500">
                      Password
                    </label>
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1 w-4 rounded-full transition-colors ${
                              calculatePasswordStrength(formData.password) > (i * 33) ? 'bg-red-600' : 'bg-white/10'
                            }`} 
                          />
                        ))}
                    </div>
                  </div>
                  <input
                    type={formData.showPassword ? "text" : "password"}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-600/50 focus:bg-white/[0.05] transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, showPassword: !formData.showPassword})}
                    className="absolute right-4 top-[44px] text-[10px] font-bold text-gray-600 hover:text-white transition-colors tracking-tighter"
                  >
                    {formData.showPassword ? "OVERSIGHT: ON" : "OVERSIGHT: OFF"}
                  </button>
                </div>

                {error && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-red-500/10 border border-red-500/20 py-3 rounded-lg">
                    <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}

                <button
                  disabled={isLoading}
                  className="group relative w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-black py-5 rounded-xl transition-all overflow-hidden uppercase text-xs tracking-[0.2em]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>Initialize Access<span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span></>
                    )}
                  </span>
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="mfa"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                onSubmit={handleMfaSubmit}
                className="space-y-8"
              >
                <div className="text-center">
                  <p className="text-gray-400 text-[11px] font-medium mb-8 tracking-wide">
                    Verification required. Enter the 4-digit security code sent to your registered device.
                  </p>
                  <div className="flex justify-center gap-4">
                    {mfaValues.map((val, i) => (
                      <input
                        key={i}
                        ref={inputRefs[i]}
                        type="text"
                        maxLength="1"
                        className="w-16 h-20 bg-white/[0.03] border border-white/10 rounded-2xl text-center text-3xl font-light text-white focus:border-red-600 focus:bg-white/[0.07] focus:outline-none transition-all shadow-inner"
                        value={val}
                        onChange={(e) => handleMfaChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    type="submit"
                    className="w-full bg-white text-black hover:bg-gray-200 font-black py-5 rounded-xl transition-all uppercase text-xs tracking-[0.2em]"
                  >
                    Authorize Device
                  </button>
                  
                  <div className="flex flex-col items-center gap-4">
                    <button 
                      type="button"
                      disabled={resendTimer > 0}
                      className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-red-500 disabled:opacity-50 transition-colors"
                    >
                      {resendTimer > 0 ? `Resend Signal in ${resendTimer}s` : "Resend Security Code"}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="text-[10px] font-bold text-gray-700 hover:text-white uppercase tracking-[0.3em] transition-colors">
                      Abort Session
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        
        <div className="bg-black/50 border-t border-white/5 p-4 flex justify-between items-center px-8">
            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">System Status: Ready</span>
            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">Encryption: AES-256</span>
        </div>
      </div>
    </div>
  );
};

export default Login;