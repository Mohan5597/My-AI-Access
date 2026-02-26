import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';

const Auth = ({ onAuth }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // New password state
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Updated validation to include password
    if (!email || !password || (isRegister && !name)) {
      alert("Please fill in all fields");
      return;
    }

    const mode = isRegister ? 'register' : 'login';
    // Passing password along with user details
    onAuth(mode, { email, name, password }, role);
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

          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 pl-10"
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Register as:</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none bg-white"
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">Student / User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}
          
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
            {isRegister ? "Create Account" : "Sign In"} <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;