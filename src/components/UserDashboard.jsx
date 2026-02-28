import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Sparkles, LayoutGrid, FileText, CheckCircle, XCircle, Send, Clock, Calendar, Timer, Zap, ChevronLeft, ChevronRight, ExternalLink, Search } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

// --- DATA: EXTENDED MARKET AI TOOLS ---
const MARKET_TOOLS = [
  { name: "ChatGPT", url: "https://chatgpt.com", company: "OpenAI" },
  { name: "Claude", url: "https://claude.ai", company: "Anthropic" },
  { name: "Gemini", url: "https://gemini.google.com", company: "Google" },
  { name: "Midjourney", url: "https://www.midjourney.com", company: "Midjourney" },
  { name: "DALL-E 3", url: "https://labs.openai.com", company: "OpenAI" },
  { name: "Perplexity", url: "https://www.perplexity.ai", company: "Perplexity" },
  { name: "Github Copilot", url: "https://github.com/features/copilot", company: "Microsoft" },
  { name: "Llama 3", url: "https://llama.meta.com", company: "Meta" },
  { name: "Mistral Large", url: "https://mistral.ai", company: "Mistral AI" },
  { name: "Grok-1", url: "https://x.ai", company: "xAI" },
  { name: "Sora", url: "https://openai.com/sora", company: "OpenAI" },
  { name: "Stable Diffusion", url: "https://stability.ai", company: "Stability AI" }
];

const TOOL_LINKS = MARKET_TOOLS.reduce((acc, tool) => {
  acc[tool.name] = tool.url;
  return acc;
}, {});

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
      return [hours.toString().padStart(2, '0'), minutes.toString().padStart(2, '0'), seconds.toString().padStart(2, '0')].join(':');
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
  
  // --- SEARCH & SUGGESTION STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter tools based on user typing
  const filteredTools = MARKET_TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const q = query(collection(db, "requests"), where("userEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(docs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
    const globalTimer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Close suggestions when clicking outside
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => { 
      unsubscribe(); 
      clearInterval(globalTimer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user.email]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.toolName || !formData.purpose || !formData.fromDateTime || !formData.toDateTime) {
      return toast.error("Please fill in all fields.");
    }

    const hasActiveRequest = requests.some(req => {
      const isSameTool = req.toolName.toLowerCase().trim() === formData.toolName.toLowerCase().trim();
      const endTime = new Date(req.toDateTime);
      return isSameTool && endTime > new Date() && (req.status === 'approved' || req.status === 'pending');
    });

    if (hasActiveRequest) {
      return toast.error(`Active or pending request already exists for ${formData.toolName}.`); 
    }

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
      setSearchTerm("");
      setCurrentPage(1);
      toast.success("Request Submitted Successfully!", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to submit request.", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
            <div className="w-6 h-6 border-2 border-blue-500 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">AI Access Control</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm items-center gap-2">
            <span className="text-slate-400 text-sm font-medium">{user.name}</span>
            <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-lg font-bold uppercase">Student</span>
          </div>
          <button onClick={onLogout} className="text-slate-600 hover:text-red-500 flex items-center gap-2 transition font-semibold text-sm">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-200 p-6 rounded-3xl border border-slate-300 flex justify-between items-center shadow-sm">
          <div><p className="text-slate-600 font-bold text-[10px] uppercase tracking-wider">Total</p><h2 className="text-3xl font-black">{stats.total}</h2></div>
          <LayoutGrid className="text-slate-500" size={28} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div><p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider text-amber-600">Pending</p><h2 className="text-3xl font-black text-amber-500">{stats.pending}</h2></div>
          <FileText className="text-amber-400" size={28} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div><p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider text-emerald-600">Approved</p><h2 className="text-3xl font-black text-emerald-500">{stats.approved}</h2></div>
          <CheckCircle className="text-emerald-400" size={28} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div><p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider text-red-600">Rejected</p><h2 className="text-3xl font-black text-red-500">{stats.rejected}</h2></div>
          <XCircle className="text-red-400" size={28} />
        </div>
      </div>

      {/* SMART QUICK SELECT CHIPS */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5">
            <Zap size={14} className="text-amber-400 fill-amber-400" /> Quick Select:
          </span>
          {MARKET_TOOLS.slice(0, 6).map((tool) => (
            <button
              key={tool.name}
              onClick={() => {
                setFormData({ ...formData, toolName: tool.name });
                setSearchTerm(tool.name);
                toast.success(`${tool.name} selected!`, { duration: 800 });
              }}
              className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${
                formData.toolName === tool.name 
                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      {/* SUBMISSION FORM WITH SEARCHABLE FIELD */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-50 p-3 rounded-xl"><Sparkles className="text-blue-500" /></div>
          <div><h2 className="text-xl font-bold text-slate-800">New AI Access Request</h2><p className="text-slate-500 text-sm">One active session per tool allowed</p></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SEARCHABLE TOOL FIELD */}
            <div className="md:col-span-2 relative" ref={suggestionRef}>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Search Verified Tool</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Type to search (e.g. Claude, Llama, Meta...)"
                  value={searchTerm}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFormData({...formData, toolName: e.target.value});
                    setShowSuggestions(true);
                  }}
                  className="w-full p-3 pl-10 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-blue-400 transition-all font-medium"
                />
                <Search className="absolute left-3 top-3.5 text-slate-300" size={18} />
              </div>

              {/* DYNAMIC SUGGESTIONS DROPDOWN */}
              {showSuggestions && searchTerm.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  {filteredTools.map(tool => (
                    <div 
                      key={tool.name}
                      onClick={() => {
                        setFormData({...formData, toolName: tool.name});
                        setSearchTerm(tool.name);
                        setShowSuggestions(false);
                      }}
                      className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-sm text-slate-800">{tool.name}</p>
                        <p className="text-[10px] text-slate-400">By {tool.company}</p>
                      </div>
                      <CheckCircle size={16} className={formData.toolName === tool.name ? "text-blue-500" : "text-slate-100"} />
                    </div>
                  ))}
                  {filteredTools.length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-xs italic">No matching verified tools.</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Access Start</label>
              <input 
                type="datetime-local" 
                value={formData.fromDateTime} 
                onChange={e => setFormData({...formData, fromDateTime: e.target.value})} 
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-blue-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Access End</label>
              <input 
                type="datetime-local" 
                value={formData.toDateTime} 
                onChange={e => setFormData({...formData, toDateTime: e.target.value})} 
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-blue-400 font-medium" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Usage Purpose</label>
              <textarea 
                value={formData.purpose} 
                onChange={e => setFormData({...formData, purpose: e.target.value})} 
                rows="3" 
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-blue-400 font-medium" 
                placeholder="Briefly describe your project or use-case..." 
              />
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-black hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all">
            <Send size={18} /> Send Access Request
          </button>
        </form>
      </div>

      {/* SUBMISSIONS TABLE */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Submission History</h3>
            <p className="text-slate-500 text-sm">Managing {requests.length} requests</p>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition"
              ><ChevronLeft size={18}/></button>
              <span className="text-xs font-bold px-2 text-slate-600">{currentPage} / {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition"
              ><ChevronRight size={18}/></button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="p-4">AI Tool</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Time Range</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.map((req) => {
                const startTime = new Date(req.fromDateTime);
                const endTime = new Date(req.toDateTime);
                const isExpired = endTime < currentTime;
                const isActive = req.status === 'approved' && currentTime >= startTime && currentTime <= endTime;
                const launchUrl = TOOL_LINKS[req.toolName];

                let progress = 0;
                if (isActive) {
                  const total = endTime - startTime;
                  const elapsed = currentTime - startTime;
                  progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
                }

                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition group">
                    <td className="p-4">
                        <div className="flex items-center gap-2">
                          {isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                          <span className="font-bold text-sm text-slate-800 capitalize">{req.toolName}</span>
                          {isActive && launchUrl && (
                            <a href={launchUrl} target="_blank" rel="noreferrer" className="p-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors" title="Launch AI">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500 italic max-w-[200px] truncate">"{req.purpose}"</td>
                    <td className="p-4 text-[10px] text-slate-600 font-mono leading-tight">
                      {req.fromDateTime?.replace('T', ' ')}<br/>
                      <span className="text-slate-300">to</span> {req.toDateTime?.replace('T', ' ')}
                    </td>
                    <td className="p-4">
                        {isExpired ? (
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-slate-100 text-slate-400 border border-slate-200">EXPIRED</span>
                        ) : (
                          <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                            req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {req.status.toUpperCase()}
                          </span>
                        )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center gap-2">
                        {isActive ? (
                          <>
                            <LiveCountdown targetDate={req.toDateTime} />
                            <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                            </div>
                          </>
                        ) : isExpired ? (
                          <span className="text-slate-300 text-[10px] italic font-medium">Session Ended</span>
                        ) : req.status === 'approved' && currentTime < startTime ? (
                          <span className="text-blue-500 text-[9px] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">UPCOMING</span>
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
               <div className="bg-slate-50 p-4 rounded-full mb-4"><FileText className="text-slate-200" size={40} /></div>
               <p className="text-slate-400 font-bold text-sm">No requests found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;