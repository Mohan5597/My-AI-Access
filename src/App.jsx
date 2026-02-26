// import React, { useState } from 'react';
// import Auth from './components/Auth';
// import UserDashboard from './components/UserDashboard';
// import AdminDashboard from './components/AdminDashboard';

// import AccessPortalForm from './components/demands'

// import { db } from './firebase';
// import { doc, setDoc, getDoc } from 'firebase/firestore';

// function App() {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);

//   const handleAuth = async (mode, profile, selectedRole) => {
 
//   try {
//     const userRef = doc(db, "users", profile.email); //from 'users' table By using the email as the ID which is unique
//     const userSnap = await getDoc(userRef);

//     if (mode === 'login') {
//       if (!userSnap.exists()) {
//         alert("Account not found!");
//         return;
//       }
      
//       const userData = userSnap.data();
      
//       // Simple password check
//       if (userData.password !== profile.password) {
//         alert("Incorrect password!");
//         return;
//       }

//       setUser({ name: userData.name, email: userData.email });
//       setRole(userData.role);
//     } 
    
//     else if (mode === 'register') {
//       if (userSnap.exists()) {
//         alert("Email already exists!");
//         return;
//       }

//       const newUser = {
//         name: profile.name,
//         email: profile.email,
//         password: profile.password, // Saving password
//         role: selectedRole,
//         createdAt: new Date()
//       };

//       await setDoc(userRef, newUser);
//       setUser({ name: newUser.name, email: newUser.email });
//       setRole(selectedRole);
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

//   const handleLogout = () => {
//     setUser(null);
//     setRole(null);
//   };

//  if (!user) {
//     return <Auth onAuth={handleAuth} />;
//   }

//   return (
//     <div>
//       {role === 'admin' ? (
//         <AdminDashboard user={user} onLogout={handleLogout} />
//       ) : (
//         <UserDashboard user={user} onLogout={handleLogout} />
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AccessPortalForm from './components/demands'; 

import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isFormCompleted, setIsFormCompleted] = useState(false);

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
          password: profile.password,
          role: selectedRole,
          createdAt: new Date()
        };
        await setDoc(userRef, newUser);
        setUser({ name: newUser.name, email: newUser.email });
        setRole(selectedRole);
      }
    } catch (error) {
      console.error("Auth Error:", error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    setIsFormCompleted(false); // Reset to start on logout
  };

  // --- LOGIC GATES ---

  // 1. Initial Gate: Demand Form
  if (!isFormCompleted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <AccessPortalForm onComplete={() => setIsFormCompleted(true)} />
      </div>
    );
  }

  // 2. Second Gate: Auth (Login/Register)
  if (!user) {
    return <Auth onAuth={handleAuth} />;
  }

  // 3. Final Destination: Dashboard
  return (
    <div className="min-h-screen bg-white">
      {role === 'admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <UserDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
