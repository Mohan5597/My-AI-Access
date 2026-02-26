import React, { useState, useEffect } from 'react';
import { LogOut, Shield, CheckCircle, XCircle, Trash2, Users, FileText, LayoutGrid, Lock } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    const qReq = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubReq = onSnapshot(qReq, (snap) => setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubUsers = onSnapshot(qUsers, (snap) => setUsersList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubReq(); unsubUsers(); };
  }, []);

  const handleUpdateStatus = async (id, status) => {
    await updateDoc(doc(db, "requests", id), { status });
  };

  const handleDelete = async (collectionName, id, role = 'user') => {
    // Prevent deleting Admins
    if (collectionName === 'users' && role === 'admin') {
      alert("Admin accounts cannot be deleted for security reasons.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this?")) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.name) {
      alert("Please fill all fields including password.");
      return;
    }
    // Saving new user with password
    await setDoc(doc(db, "users", newUser.email), { 
      ...newUser, 
      createdAt: new Date() 
    });
    setNewUser({ name: '', email: '', password: '', role: 'user' });
    alert("User successfully registered!");
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* HEADER & STATS (Same as previous version) */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 border-2 border-blue-500 rounded" /> AI Access Control</h1>
        <div className="flex items-center gap-4">
          <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-bold border flex items-center gap-2 text-slate-700"><Shield size={14}/> Admin</span>
          <button onClick={onLogout} className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition font-medium"><LogOut size={18}/> Logout</button>
        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-200 p-6 rounded-2xl flex justify-between items-center border border-slate-300">
          <div><p className="text-slate-600 text-sm font-medium">Total Requests</p><h2 className="text-4xl font-bold">{stats.total}</h2></div>
          <LayoutGrid className="text-slate-400" />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center border border-slate-100">
          <div><p className="text-slate-400 text-sm font-medium">Pending</p><h2 className="text-4xl font-bold">{stats.pending}</h2></div>
          <FileText className="text-amber-400" />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center border border-slate-100">
          <div><p className="text-slate-400 text-sm font-medium">Approved</p><h2 className="text-4xl font-bold">{stats.approved}</h2></div>
          <CheckCircle className="text-emerald-400" />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center border border-slate-100">
          <div><p className="text-slate-400 text-sm font-medium">Rejected</p><h2 className="text-4xl font-bold">{stats.rejected}</h2></div>
          <XCircle className="text-red-400" />
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="max-w-7xl mx-auto flex gap-2 mb-6">
        <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition ${activeTab === 'requests' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
          <FileText size={18}/> Requests
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition ${activeTab === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
          <Users size={18}/> Users
        </button>
      </div>

      {/* REQUESTS LIST TAB */}
      {activeTab === 'requests' && (
        <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {requests.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase p-4">
                <tr><th className="p-4">User</th><th className="p-4">AI Tool</th><th className="p-4">Purpose</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-sm">{req.userName}<br/><span className="text-xs font-normal text-slate-400">{req.userEmail}</span></td>
                    <td className="p-4 text-sm">{req.toolName}</td>
                    <td className="p-4 text-sm text-slate-500 italic">{req.purpose}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${req.status === 'pending' ? 'bg-amber-50 text-amber-600' : req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleUpdateStatus(req.id, 'approved')} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"><CheckCircle size={16}/></button>
                      <button onClick={() => handleUpdateStatus(req.id, 'rejected')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><XCircle size={16}/></button>
                      <button onClick={() => handleDelete('requests', req.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4"><FileText className="text-slate-200" size={40}/></div>
              <p className="text-slate-400 font-medium">No requests are present at the moment.</p>
            </div>
          )}
        </div>
      )}

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ADD USER FORM */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Users className="text-blue-500"/> Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input placeholder="Enter user name" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-blue-300" onChange={e => setNewUser({...newUser, name: e.target.value})} value={newUser.name} />
              <input placeholder="Enter user email" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-blue-300" onChange={e => setNewUser({...newUser, email: e.target.value})} value={newUser.email} />
              
              {/* PASSWORD FIELD FOR ADMIN CREATION */}
              <div className="relative">
                <input type="password" placeholder="Set password" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-blue-300 pl-10" onChange={e => setNewUser({...newUser, password: e.target.value})} value={newUser.password} />
                <Lock className="absolute left-3 top-3.5 text-slate-300" size={16} />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setNewUser({...newUser, role: 'user'})} className={`flex-1 p-3 rounded-xl border font-bold flex items-center justify-center gap-2 ${newUser.role === 'user' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}><Users size={16}/> User</button>
                <button type="button" onClick={() => setNewUser({...newUser, role: 'admin'})} className={`flex-1 p-3 rounded-xl border font-bold flex items-center justify-center gap-2 ${newUser.role === 'admin' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}><Shield size={16}/> Admin</button>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-black transition">Add User</button>
            </form>
          </div>

          {/* REGISTERED USERS LIST */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Registered Users <span className="bg-slate-100 px-2 py-0.5 rounded-lg ml-2 text-sm">{usersList.length}</span></h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {usersList.map(u => (
                <div key={u.id} className="flex justify-between items-center p-4 border-b border-slate-50 last:border-0">
                  <div className="flex gap-3">
                    <div className="bg-blue-50 p-2 rounded-full"><Users className="text-blue-400" size={20}/></div>
                    <div><p className="font-bold text-sm text-slate-800">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded-lg border border-blue-100 uppercase">{u.role}</span>
                    {/* ONLY SHOW DELETE IF ROLE IS USER */}
                    {u.role === 'user' && (
                      <button onClick={() => handleDelete('users', u.id, u.role)} className="text-slate-300 hover:text-red-500 transition">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;