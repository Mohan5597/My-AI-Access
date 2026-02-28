import React, { useState } from 'react';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
// 1. Import Toast components
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const handleAuth = async (mode, profile, selectedRole) => {
    try {
      const userRef = doc(db, "users", profile.email);
      const userSnap = await getDoc(userRef);

      if (mode === 'login') {
        if (!userSnap.exists()) {
          toast.error("Account not found!"); // Replaced alert
          return;
        }
        
        const userData = userSnap.data();
        
        if (userData.password !== profile.password) {
          toast.error("Incorrect password!"); // Replaced alert
          return;
        }

        setUser({ name: userData.name, email: userData.email });
        setRole(userData.role);
        toast.success(`Welcome back, ${userData.name}!`); // Success feedback
      } 
      
      else if (mode === 'register') {
        if (userSnap.exists()) {
          toast.error("Email already exists!"); // Replaced alert
          return;
        }

        const newUser = {
          name: profile.name,
          email: profile.email,
          password: profile.password,
          role: selectedRole,
          createdAt: new Date()
        };

        await setDoc(userRef, newUser);
        setUser({ name: newUser.name, email: newUser.email });
        setRole(selectedRole);
        toast.success("Account created successfully!"); // Success feedback
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again."); // Error feedback
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    toast.success("Logged out successfully"); // Added logout toast
  };

  return (
    <div>
      {/* 2. Place Toaster at the top level to show notifications */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {!user ? (
        <Auth onAuth={handleAuth} />
      ) : role === 'admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <UserDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;