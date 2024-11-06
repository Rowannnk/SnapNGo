"use client";

import { useState, useEffect } from "react";
import app from "@/config/firebaseconfig";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName,
          email: currentUser.email,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.log("Error signing in with Google:", error.message);
      alert("Failed to sign in with Google. Please try again.");
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.log("Error signing out:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {user ? (
        <>
          <p>Welcome, {user.name}</p>
          <p>Email: {user.email}</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
};

export default Home;
