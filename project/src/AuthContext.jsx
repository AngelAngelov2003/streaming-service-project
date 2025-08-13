import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password).then(
      async (userCredential) => {
        const user = userCredential.user;
        await setDoc(
          doc(db, 'users', user.uid),
          {
            email: user.email,
            subscriptionStatus: 'inactive',
            subscriptionPlan: null,
          },
          { merge: true }
        );
        return userCredential;
      }
    );
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const subscribeToPlan = async (planId) => {
    if (!currentUser) throw new Error('No user');
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(
      userDocRef,
      {
        subscriptionPlan: planId,       
        subscriptionStatus: 'active',
      },
      { merge: true }
    );
  };

  const unsubscribeFromPlan = async () => {
    if (!currentUser) throw new Error('No user');
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(
      userDocRef,
      {
        subscriptionPlan: null,
        subscriptionStatus: 'inactive',
      },
      { merge: true }
    );
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);

        const unsubscribeFirestore = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setSubscriptionStatus(data.subscriptionStatus ?? 'inactive');
              setSubscriptionPlan(data.subscriptionPlan ?? null);
            } else {
              setSubscriptionStatus('inactive');
              setSubscriptionPlan(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching user data in real-time:', error);
            setSubscriptionStatus('inactive');
            setSubscriptionPlan(null);
            setLoading(false);
          }
        );

        return () => unsubscribeFirestore();
      } else {
        setCurrentUser(null);
        setSubscriptionStatus(null);
        setSubscriptionPlan(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const value = {
    currentUser,
    subscriptionStatus, 
    subscriptionPlan,   
    loading,
    signup,
    login,
    logout,
    subscribeToPlan,
    unsubscribeFromPlan,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthProvider;
