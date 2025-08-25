import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(
        doc(db, 'users', user.uid),
        { email: user.email, subscriptionStatus: 'inactive', subscriptionPlan: null, role: 'user' },
        { merge: true }
      );
      toast.success('Signup successful');
      return userCredential;
    } catch (err) {
      toast.error(err.message || 'Signup failed');
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful');
      return res;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error(err.message || 'Logout failed');
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
      throw err;
    }
  };

  const subscribeToPlan = async (planId) => {
    try {
      if (!currentUser) throw new Error('No user logged in');
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, { subscriptionPlan: planId, subscriptionStatus: 'active' }, { merge: true });
      toast.success('Subscribed successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to subscribe');
      throw err;
    }
  };

  const unsubscribeFromPlan = async () => {
    try {
      if (!currentUser) throw new Error('No user logged in');
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, { subscriptionPlan: null, subscriptionStatus: 'inactive' }, { merge: true });
      toast.success('Unsubscribed successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to unsubscribe');
      throw err;
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        let unsubscribeFirestore;
        try {
          unsubscribeFirestore = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                setSubscriptionStatus(data.subscriptionStatus ?? 'inactive');
                setSubscriptionPlan(data.subscriptionPlan ?? null);
                setRole(data.role ?? 'user');
              } else {
                setSubscriptionStatus('inactive');
                setSubscriptionPlan(null);
                setRole('user');
              }
              setLoading(false);
            },
            (err) => {
              console.error('Firestore snapshot error:', err);
              toast.error('Failed to load user data');
              setLoading(false);
            }
          );
        } catch (err) {
          console.error('Firestore listener failed:', err);
          toast.error('Failed to load user data');
          setLoading(false);
        }
        return () => unsubscribeFirestore && unsubscribeFirestore();
      } else {
        setCurrentUser(null);
        setSubscriptionStatus(null);
        setSubscriptionPlan(null);
        setRole(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const value = {
    currentUser,
    subscriptionStatus,
    subscriptionPlan,
    role,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    subscribeToPlan,
    unsubscribeFromPlan
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthProvider;
