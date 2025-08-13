import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { User, Mail, DollarSign, LogOut, CheckCircle, XCircle } from 'lucide-react';
import SubscriptionModal from '../../components/SubscriptionModal/SubscriptionModal';

const Account = () => {
  const {
    currentUser,
    logout,
    loading,
    subscriptionStatus,   
    subscriptionPlan,    
    subscribeToPlan,
    unsubscribeFromPlan,
  } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [message, setMessage] = useState({ type: null, text: '' });

  const plans = [
    { id: 'basic', name: 'Basic', price: '$9.99/mo', features: ['HD available', 'Watch on 1 device'] },
    { id: 'standard', name: 'Standard', price: '$14.99/mo', features: ['Full HD available', 'Watch on 2 devices'] },
    { id: 'premium', name: 'Premium', price: '$19.99/mo', features: ['4K + HDR available', 'Watch on 4 devices'] },
  ];

  const currentPlan = plans.find((p) => p.id === subscriptionPlan) || null;

  useEffect(() => {
    if (!currentUser) {
      setLoadingData(false);
      return;
    }
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        setUserData(docSnap.exists() ? docSnap.data() : null);
        setLoadingData(false);
      },
      (error) => {
        console.error('Error fetching user data: ', error);
        setLoadingData(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser]);

  const handleOpenModal = (planId) => {
    const planToSelect = plans.find((p) => p.id === planId);
    if (planToSelect) {
      setSelectedPlan(planToSelect);
      setIsModalOpen(true);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      await subscribeToPlan(planId);
      setMessage({
        type: 'success',
        text: `You have successfully subscribed to the ${plans.find((p) => p.id === planId)?.name} plan.`,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating subscription:', error);
      setMessage({ type: 'error', text: 'Failed to update subscription. Please try again.' });
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeFromPlan();
      setMessage({ type: 'success', text: 'You have successfully unsubscribed.' });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setMessage({ type: 'error', text: 'Failed to unsubscribe. Please try again.' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading account...</div>
      </div>
    );
  }

  const availablePlans = plans.filter((p) => p.id !== subscriptionPlan);
  const optionsTitle = subscriptionStatus === 'inactive' ? 'Choose Your Plan' : 'Change Your Plan';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl bg-[#1f1f1f] rounded-xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:shadow-red-700/50">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-red-600 rounded-full">
            <User size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-wide">My Account</h1>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <p className="text-white">{message.text}</p>
          </div>
        )}

        <div className="space-y-4 text-white">
          <div className="bg-[#2a2a2a] p-4 rounded-lg flex items-center space-x-4 shadow-md">
            <Mail size={24} className="text-red-500" />
            <div>
              <p className="text-sm text-gray-400">Email Address</p>
              <p className="text-lg font-medium">{userData?.email ?? currentUser?.email}</p>
            </div>
          </div>

          {subscriptionStatus === 'active' && currentPlan && (
            <div className="bg-[#2a2a2a] p-4 rounded-lg flex items-center space-x-4 shadow-md border-2 border-red-600">
              <DollarSign size={24} className="text-red-500" />
              <div>
                <p className="text-sm text-gray-400">Current Subscription</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium capitalize">{currentPlan.name} Plan</p>
                  <CheckCircle size={20} className="text-green-500" />
                </div>
                <p className="text-gray-400 text-sm">{currentPlan.price}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white text-center">{optionsTitle}</h3>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-[#2a2a2a] p-6 rounded-lg shadow-md flex-1 flex flex-col items-center transition-colors duration-200"
              >
                <h2 className="text-2xl font-bold text-white mb-2 capitalize">{plan.name}</h2>
                <p className="text-3xl font-extrabold text-white mb-4">{plan.price}</p>
                <ul className="text-gray-400 text-left mb-6 w-full px-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center mt-2">
                      <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleOpenModal(plan.id)}
                  className="mt-auto w-full p-3 rounded-lg font-bold text-lg transition-colors duration-200 transform hover:scale-105 shadow-lg bg-red-600 hover:bg-red-700"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>

        {subscriptionStatus === 'active' && (
          <button
            onClick={handleUnsubscribe}
            className="w-full flex items-center justify-center p-3 rounded-lg bg-gray-700 text-white font-bold text-lg hover:bg-red-600 transition-colors duration-200 transform hover:scale-105 shadow-lg mt-4"
          >
            <XCircle size={20} className="mr-2" />
            Unsubscribe
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-3 rounded-lg bg-gray-700 text-white font-bold text-lg hover:bg-gray-600 transition-colors duration-200 transform hover:scale-105 shadow-lg mt-4"
        >
          <LogOut size={20} className="mr-2" />
          Logout
        </button>
      </div>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};

export default Account;
