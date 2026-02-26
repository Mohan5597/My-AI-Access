// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import React, { useState } from 'react';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const handleAuth = async (mode, profile, selectedRole) => {
  try {
    const userRef = doc(db, "users", profile.email);
    const userSnap = await getDoc(userRef);

    if (mode === 'login') {
      if (!userSnap.exists()) {
        alert("Account not found!");
        return;
      }
      
      const userData = userSnap.data();
      
      // Simple password check
      if (userData.password !== profile.password) {
        alert("Incorrect password!");
        return;
      }

      setUser({ name: userData.name, email: userData.email });
      setRole(userData.role);
    } 
    
    else if (mode === 'register') {
      if (userSnap.exists()) {
        alert("Email already exists!");
        return;
      }

      const newUser = {
        name: profile.name,
        email: profile.email,
        password: profile.password, // Saving password
        role: selectedRole,
        createdAt: new Date()
      };

      await setDoc(userRef, newUser);
      setUser({ name: newUser.name, email: newUser.email });
      setRole(selectedRole);
    }
  } catch (error) {
    console.error(error);
  }
};

  const handleLogout = () => {
    setUser(null);
    setRole(null);
  };

 if (!user) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <div>
      {role === 'admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <UserDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
