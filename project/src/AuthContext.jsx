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
import { doc, setDoc, onSnapshot, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [role, setRole] = useState(null);
  const [remainingDevices, setRemainingDevices] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);
  const [loading, setLoading] = useState(true);

  const planLimits = {
    basic: 1,
    standard: 2,
    premium: 4
  };

  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), { email: user.email, subscriptionStatus: 'inactive', subscriptionPlan: null, role: 'user', devices: [], subscriptionStart: null, subscriptionEnd: null }, { merge: true });
    toast.success('Signup successful');
    return userCredential;
  };

  const enforceDeviceLimit = async (user, plan) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) return;
    const data = userDoc.data();
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    const limit = planLimits[plan] || 1;
    const devices = data.devices || [];
    if (!devices.includes(deviceId)) {
      if (devices.length >= limit) throw new Error('Device limit reached for your plan.');
      else await updateDoc(userDocRef, { devices: arrayUnion(deviceId) });
    }
  };

  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', res.user.uid);
    const userDoc = await getDoc(userDocRef);
    const plan = userDoc.exists() ? userDoc.data().subscriptionPlan : null;
    if (plan) await enforceDeviceLimit(res.user, plan);
    toast.success('Login successful');
    return res;
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('Logged out successfully');
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
    toast.success('Password reset email sent');
  };

  const subscribeToPlan = async (planId) => {
    if (!currentUser) throw new Error('No user logged in');
    const userDocRef = doc(db, 'users', currentUser.uid);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    await setDoc(userDocRef, { subscriptionPlan: planId, subscriptionStatus: 'active', subscriptionStart: startDate, subscriptionEnd: endDate }, { merge: true });
    toast.success('Subscribed successfully');
  };

  const unsubscribeFromPlan = async () => {
    if (!currentUser) throw new Error('No user logged in');
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, { subscriptionPlan: null, subscriptionStatus: 'inactive' }, { merge: true });
    toast.success('Unsubscribed successfully');
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        let unsubscribeFirestore;
        unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          const data = docSnap.exists() ? docSnap.data() : null;
          const now = new Date();
          if (data) {
            const subEnd = data.subscriptionEnd?.toDate ? data.subscriptionEnd.toDate() : data.subscriptionEnd;
            setSubscriptionStatus(subEnd && now > subEnd ? 'inactive' : data.subscriptionStatus ?? 'inactive');
            setSubscriptionPlan(subEnd && now > subEnd ? null : data.subscriptionPlan ?? null);
            setRole(data.role ?? 'user');

            if (data.subscriptionEnd) {
              const diffTime = subEnd - now;
              setRemainingDays(Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0));
            } else setRemainingDays(null);

            const maxDevices = planLimits[data.subscriptionPlan] || 1;
            const usedDevices = data.devices?.length || 0;
            setRemainingDevices(Math.max(maxDevices - usedDevices, 0));
          } else {
            setSubscriptionStatus('inactive');
            setSubscriptionPlan(null);
            setRole('user');
            setRemainingDays(null);
            setRemainingDevices(null);
          }
          setLoading(false);
        });
        return () => unsubscribeFirestore && unsubscribeFirestore();
      } else {
        setCurrentUser(null);
        setSubscriptionStatus(null);
        setSubscriptionPlan(null);
        setRole(null);
        setRemainingDevices(null);
        setRemainingDays(null);
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
    remainingDevices,
    remainingDays,
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
