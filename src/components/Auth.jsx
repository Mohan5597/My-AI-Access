import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, Check, X, Info } from 'lucide-react';
// 1. Import toast from the library
import toast from 'react-hot-toast';

const Auth = ({ onAuth }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [showRules, setShowRules] = useState(false);

  const validations = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordSecure = Object.values(validations).every(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 2. Use toast.error for validation feedback
    if (!email || !password || (isRegister && !name)) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isRegister && !isPasswordSecure) {
      toast.error("Password must meet all security requirements.");
      return;
    }

    // Pass the data to handleAuth (App.js will handle success/failure toasts)
    onAuth(isRegister ? 'register' : 'login', { email, name, password }, role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-blue-100 p-3 rounded-xl mb-4">
        <Shield className="text-blue-600 w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800">AI Access Control</h1>
      <p className="text-slate-500 mb-8">{isRegister ? "Create your account" : "Welcome back"}</p>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" placeholder="John Doe"
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" placeholder="name@college.edu"
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 pl-10"
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <div 
                className="absolute left-3 top-3.5 text-slate-400 cursor-help group"
                onMouseEnter={() => setShowRules(true)}
                onMouseLeave={() => setShowRules(false)}
              >
                <Lock size={18} className="group-hover:text-blue-500 transition-colors" />
                
                {isRegister && showRules && (
                  <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white p-4 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs font-bold mb-3 flex items-center gap-2 border-b border-slate-700 pb-2">
                      <Info size={14} className="text-blue-400" /> Password Requirements
                    </p>
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 text-[11px] ${validations.minLength ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {validations.minLength ? <Check size={12}/> : <X size={12}/>} 8+ Characters
                      </div>
                      <div className={`flex items-center gap-2 text-[11px] ${validations.hasNumber ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {validations.hasNumber ? <Check size={12}/> : <X size={12}/>} Include a number
                      </div>
                      <div className={`flex items-center gap-2 text-[11px] ${validations.hasSpecial ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {validations.hasSpecial ? <Check size={12}/> : <X size={12}/>} Special character (!@#)
                      </div>
                    </div>
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Register as:</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none bg-white font-medium text-sm"
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">Student / User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}
          
          <button 
            type="submit" 
            className={`w-full p-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg ${
              isRegister && !isPasswordSecure 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
            }`}
          >
            {isRegister ? "Create Account" : "Sign In"} <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-blue-600 font-bold hover:underline"
          >
            {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;