import React, { useState, useEffect } from 'react';
import { LogOut, Sparkles, LayoutGrid, FileText, CheckCircle, XCircle, Send, Clock, Calendar } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';

const UserDashboard = ({ user, onLogout }) => {
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({ toolName: '', purpose: '', fromDateTime: '', toDateTime: '' });
  
  // State to track current system time for expiration logic
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. DATA LOGIC: Fetch user's requests in real-time
  useEffect(() => {
    const q = query(
      collection(db, "requests"), 
      where("userEmail", "==", user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const sortedDocs = docs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setRequests(sortedDocs);
    }, (error) => {
      console.error("Listener failed:", error);
    });

    // Update current time every minute to refresh expiration status
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [user.email]);

  // Calculate status counts for the top cards
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  // 2. SUBMISSION LOGIC: Save to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.toolName || !formData.purpose || !formData.fromDateTime || !formData.toDateTime) {
      return alert("Please fill in all fields.");
    }

    try {
      await addDoc(collection(db, "requests"), {
        userName: user.name,
        userEmail: user.email,
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp() 
      });
      setFormData({ toolName: '', purpose: '', fromDateTime: '', toDateTime: '' });
      alert("Request Submitted Successfully!");
    } catch (err) {
      console.error("Submission Error:", err);
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
          <button onClick={onLogout} className="text-slate-600 hover:text-red-500 flex items-center gap-2 transition"><LogOut size={18}/> Logout</button>
        </div>
      </div>

      {/* TOP TABS: Counts */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-200 p-6 rounded-3xl border border-slate-300 shadow-sm flex justify-between items-center">
          <div><p className="text-slate-600 font-medium">Total Requests</p><h2 className="text-4xl font-bold">{stats.total}</h2></div>
          <LayoutGrid className="text-slate-500" size={32} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div><p className="text-slate-500 font-medium">Pending</p><h2 className="text-4xl font-bold">{stats.pending}</h2></div>
          <FileText className="text-amber-400" size={32} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div><p className="text-slate-500 font-medium">Approved</p><h2 className="text-4xl font-bold">{stats.approved}</h2></div>
          <CheckCircle className="text-emerald-400" size={32} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div><p className="text-slate-500 font-medium">Rejected</p><h2 className="text-4xl font-bold">{stats.rejected}</h2></div>
          <XCircle className="text-red-400" size={32} />
        </div>
      </div>

      {/* SUBMISSION FORM */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-50 p-3 rounded-xl"><Sparkles className="text-blue-500" /></div>
          <div><h2 className="text-xl font-bold text-slate-800">Submit AI Usage Request</h2><p className="text-slate-500 text-sm">Requires manual approval</p></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-semibold mb-2">Name</label><input disabled value={user.name} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-400" /></div>
            <div><label className="block text-sm font-semibold mb-2">Email</label><input disabled value={user.email} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-400" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">AI Tool Name</label>
              <input value={formData.toolName} onChange={e => setFormData({...formData, toolName: e.target.value})} placeholder="ChatGPT, etc." className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-400" />
            </div>
            <div><label className="block text-sm font-semibold mb-2">From Date & Time</label>
              <input type="datetime-local" value={formData.fromDateTime} onChange={e => setFormData({...formData, fromDateTime: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
            <div><label className="block text-sm font-semibold mb-2">To Date & Time</label>
              <input type="datetime-local" value={formData.toDateTime} onChange={e => setFormData({...formData, toDateTime: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
            <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Purpose</label>
              <textarea value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} rows="3" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-400" placeholder="Why do you need this?" />
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
            <Send size={18} /> Submit Request
          </button>
        </form>
      </div>

      {/* SUBMISSIONS TABLE */}
      <div className="max-w-7xl mx-auto">
        <h3 className="text-xl font-bold mb-1">Your Submissions</h3>
        <p className="text-slate-500 text-sm mb-6">Track your AI usage request status</p>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr><th className="p-4">User</th><th className="p-4">AI Tool</th><th className="p-4">Purpose</th><th className="p-4">Time Range</th><th className="p-4 text-center">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => {
                // Determine if the request duration has expired
                const isExpired = req.toDateTime ? new Date(req.toDateTime) < currentTime : false;

                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-sm">{req.userName}<br/><span className="font-normal text-xs text-slate-400">{req.userEmail}</span></td>
                    <td className="p-4 text-sm">{req.toolName}</td>
                    <td className="p-4 text-sm text-slate-500 italic">{req.purpose}</td>
                    <td className="p-4 text-xs text-slate-600 font-mono">{req.fromDateTime?.replace('T', ' ')}<br/>to {req.toDateTime?.replace('T', ' ')}</td>
                    <td className="p-4">
                      <div className="flex flex-col items-center gap-1">
                        {isExpired ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            EXPIRED
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1 w-fit px-3 py-1 rounded-full text-xs font-bold ${
                            req.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {req.status === 'pending' && <Clock size={12} />}
                            {req.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {requests.length === 0 && <div className="p-10 text-center text-slate-400">No submissions found.</div>}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;