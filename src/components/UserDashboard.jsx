import React, { useState, useEffect } from 'react';
import { LogOut, Sparkles, LayoutGrid, FileText, CheckCircle, XCircle, Send, Clock, Calendar, Timer } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
// 1. Import toast
import toast from 'react-hot-toast';

// --- HELPER COMPONENT: REAL-TIME COUNTDOWN ---
const LiveCountdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference <= 0) return "00:00:00";

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');
    };

    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    setTimeLeft(calculateTime());
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
      <Timer size={14} className="animate-pulse" />
      <span>{timeLeft}</span>
    </div>
  );
};

const UserDashboard = ({ user, onLogout }) => {
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({ toolName: '', purpose: '', fromDateTime: '', toDateTime: '' });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const q = query(collection(db, "requests"), where("userEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(docs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
    const globalTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { unsubscribe(); clearInterval(globalTimer); };
  }, [user.email]);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  // 2. UPDATED SUBMISSION LOGIC WITH TOASTS
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.toolName || !formData.purpose || !formData.fromDateTime || !formData.toDateTime) {
      return toast.error("Please fill in all fields."); // Replaced alert
    }

    const hasActiveRequest = requests.some(req => {
      const isSameTool = req.toolName.toLowerCase().trim() === formData.toolName.toLowerCase().trim();
      const endTime = new Date(req.toDateTime);
      const isNotExpired = endTime > new Date(); 
      return isSameTool && isNotExpired && (req.status === 'approved' || req.status === 'pending');
    });

    if (hasActiveRequest) {
      // Replaced alert with contextual error toast
      return toast.error(`Active or pending request already exists for ${formData.toolName}.`); 
    }

    // Use a loading toast for a better UX while Firestore saves
    const loadingToast = toast.loading("Submitting request...");

    try {
      await addDoc(collection(db, "requests"), {
        userName: user.name,
        userEmail: user.email,
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp() 
      });
      
      setFormData({ toolName: '', purpose: '', fromDateTime: '', toDateTime: '' });
      toast.success("Request Submitted Successfully!", { id: loadingToast }); // Resolve loading toast
    } catch (err) {
      console.error("Submission Error:", err);
      toast.error("Failed to submit request.", { id: loadingToast }); // Resolve with error
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
            <div className="w-6 h-6 border-2 border-blue-500 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-800">AI Access Control</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
            <span className="text-slate-400 text-sm">{user.name}</span>
            <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-lg font-bold">User</span>
          </div>
          <button onClick={onLogout} className="text-slate-600 hover:text-red-500 flex items-center gap-2 transition font-medium">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-200 p-6 rounded-3xl border border-slate-300 shadow-sm flex justify-between items-center">
          <div><p className="text-slate-600 font-medium text-xs uppercase tracking-wider">Total</p><h2 className="text-4xl font-bold">{stats.total}</h2></div>
          <LayoutGrid className="text-slate-500" size={32} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div><p className="text-slate-400 font-medium text-xs uppercase tracking-wider">Pending</p><h2 className="text-4xl font-bold text-amber-500">{stats.pending}</h2></div>
          <FileText className="text-amber-400" size={32} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div><p className="text-emerald-400 font-medium text-xs uppercase tracking-wider">Approved</p><h2 className="text-4xl font-bold text-emerald-500">{stats.approved}</h2></div>
          <CheckCircle className="text-emerald-400" size={32} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div><p className="text-red-400 font-medium text-xs uppercase tracking-wider">Rejected</p><h2 className="text-4xl font-bold text-red-500">{stats.rejected}</h2></div>
          <XCircle className="text-red-400" size={32} />
        </div>
      </div>

      {/* SUBMISSION FORM */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-50 p-3 rounded-xl"><Sparkles className="text-blue-500" /></div>
          <div><h2 className="text-xl font-bold text-slate-800">Submit AI Usage Request</h2><p className="text-slate-500 text-sm">One active session per tool allowed</p></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-slate-700">AI Tool Name</label>
              <input 
                value={formData.toolName} 
                onChange={e => setFormData({...formData, toolName: e.target.value})} 
                placeholder="e.g., ChatGPT, Midjourney, Claude" 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-400 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">From Date & Time</label>
              <input 
                type="datetime-local" 
                value={formData.fromDateTime} 
                onChange={e => setFormData({...formData, fromDateTime: e.target.value})} 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">To Date & Time</label>
              <input 
                type="datetime-local" 
                value={formData.toDateTime} 
                onChange={e => setFormData({...formData, toDateTime: e.target.value})} 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-400" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-slate-700">Purpose</label>
              <textarea 
                value={formData.purpose} 
                onChange={e => setFormData({...formData, purpose: e.target.value})} 
                rows="3" 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-400" 
                placeholder="Briefly explain your requirement..." 
              />
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all">
            <Send size={18} /> Submit Access Request
          </button>
        </form>
      </div>

      {/* SUBMISSIONS TABLE */}
      <div className="max-w-7xl mx-auto">
        <h3 className="text-xl font-bold mb-1">Your Submissions</h3>
        <p className="text-slate-500 text-sm mb-6">Real-time status tracking and session timers</p>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">AI Tool</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Time Range</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Remaining Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => {
                const startTime = new Date(req.fromDateTime);
                const endTime = new Date(req.toDateTime);
                const isExpired = endTime < currentTime;
                const isActive = req.status === 'approved' && currentTime >= startTime && currentTime <= endTime;

                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-sm text-slate-800 capitalize">{req.toolName}</td>
                    <td className="p-4 text-sm text-slate-500 italic truncate max-w-[200px]">"{req.purpose}"</td>
                    <td className="p-4 text-xs text-slate-600 font-mono leading-relaxed">
                      {req.fromDateTime?.replace('T', ' ')}<br/>
                      <span className="text-slate-300">to</span> {req.toDateTime?.replace('T', ' ')}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {isExpired ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 w-fit">
                            EXPIRED
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1 w-fit px-3 py-1 rounded-full text-xs font-bold border ${
                            req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {req.status === 'pending' && <Clock size={12} />}
                            {req.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        {isActive ? (
                          <LiveCountdown targetDate={req.toDateTime} />
                        ) : isExpired ? (
                          <span className="text-slate-300 text-xs italic font-medium">Session Ended</span>
                        ) : req.status === 'approved' && currentTime < startTime ? (
                          <span className="text-blue-500 text-[10px] font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100">UPCOMING</span>
                        ) : (
                          <span className="text-slate-200">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {requests.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
               <FileText className="text-slate-200 mb-4" size={48} />
               <p className="text-slate-400 font-medium">You haven't submitted any requests yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;