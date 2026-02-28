import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, Check, X, Info, User, Mail, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

const Auth = ({ onAuth }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [showRules, setShowRules] = useState(false);

  // Original Regex-based password validation
  const validations = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordSecure = Object.values(validations).every(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      toast.error("Please fill in all fields");
      return;
    }
    if (isRegister && !isPasswordSecure) {
      toast.error("Password must meet all security requirements.");
      return;
    }
    onAuth(isRegister ? 'register' : 'login', { email, name, password }, role);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- AI THEMED BACKGROUND --- */}
      {/* 1. Neural Network Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ 
             backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`, 
             backgroundSize: '50px 50px' 
           }} />
      
      {/* 2. Floating Security Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />

      {/* 3. Subtle Tech Details */}
      <div className="absolute top-10 left-10 text-slate-800 hidden lg:block uppercase text-[10px] font-mono tracking-[0.5em] vertical-text">
        AI_ACCESS_PROTOCOL_STABLE
      </div>

      {/* --- MAIN INTERFACE --- */}
      <div className="z-10 w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-slate-900 p-4 rounded-2xl border border-white/10 shadow-2xl">
              <Shield className="text-blue-400 w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-6">AI Access Control</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide uppercase text-[10px]">
            {isRegister ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" placeholder="John Doe"
                    className="w-full p-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" placeholder="name@college.edu"
                  className="w-full p-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input 
                  type="password" placeholder="••••••••"
                  className="w-full p-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                <div 
                  className="absolute left-3.5 top-3 text-slate-400 cursor-help group"
                  onMouseEnter={() => setShowRules(true)}
                  onMouseLeave={() => setShowRules(false)}
                >
                  <Lock size={16} className="group-hover:text-blue-600 transition-colors" />
                  
                  {isRegister && showRules && (
                    <div className="absolute left-0 bottom-full mb-3 w-64 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 border border-white/10">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-white/5 pb-2">
                        Security Check
                      </p>
                      <div className="space-y-2">
                        <ValidationBadge met={validations.minLength} label="8+ Characters" />
                        <ValidationBadge met={validations.hasNumber} label="One Number" />
                        <ValidationBadge met={validations.hasSpecial} label="Special Character" />
                      </div>
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isRegister && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Register as:</label>
                <div className="relative">
                    <select 
                    className="w-full p-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-medium text-slate-700 cursor-pointer focus:border-blue-500 transition-all appearance-none"
                    onChange={(e) => setRole(e.target.value)}
                    >
                    <option value="user">Student / User</option>
                    <option value="admin">Administrator</option>
                    </select>
                    <Cpu className="absolute left-3.5 top-3 text-slate-400" size={16} />
                </div>
              </div>
            )}
            
            <button 
              type="submit" 
              className={`w-full p-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                isRegister && !isPasswordSecure 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 active:scale-[0.98]'
              }`}
            >
              {isRegister ? "Create Account" : "Sign In"} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-blue-600 font-bold uppercase tracking-wider hover:text-blue-800 transition-colors"
            >
              {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ValidationBadge = ({ met, label }) => (
  <div className={`flex items-center gap-2 text-[11px] font-medium ${met ? 'text-emerald-400' : 'text-slate-500'}`}>
    {met ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={4} />}
    {label}
  </div>
);

export default Auth;