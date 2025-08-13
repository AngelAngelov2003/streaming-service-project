import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import SubscriptionModal from '../../components/SubscriptionModal/SubscriptionModal';

const SubscriptionPlans = () => {
  const { currentUser, subscribeToPlan } = useAuth(); 
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loginPrompt, setLoginPrompt] = useState(false); 

  const plans = [
    { id: 'basic', name: 'Basic Plan', price: '$9.99/mo', features: ['HD available', 'Watch on 1 device'] },
    { id: 'standard', name: 'Standard Plan', price: '$14.99/mo', features: ['Full HD available', 'Watch on 2 devices'] },
    { id: 'premium', name: 'Premium Plan', price: '$19.99/mo', features: ['4K + HDR available', 'Watch on 4 devices'] },
  ];

  const handleSubscribe = (planId) => {
    if (!currentUser) {
      setLoginPrompt(true);
      return;
    }
    
    setLoginPrompt(false); 
    const planToSelect = plans.find(plan => plan.id === planId);
    if (planToSelect) {
      setSelectedPlan(planToSelect);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-6">Choose Your Plan</h1>
        <p className="mb-8 text-gray-400">
          Select a plan that's right for you to start watching.
        </p>

        {loginPrompt && (
          <div className="bg-red-600 text-white p-3 rounded-md mb-4 text-center">
            Please log in to select a plan.
            <button onClick={() => navigate('/login')} className="ml-4 underline font-bold">
              Go to Login
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-gray-800 p-6 rounded-lg shadow-md flex-1 flex flex-col items-center"
            >
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-4xl font-extrabold mb-4">{plan.price}</p>
              <ul className="text-gray-400 text-left mb-6 w-full px-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center mt-2">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                className="mt-auto w-full p-3 bg-red-600 hover:bg-red-700 rounded-md font-bold transition-colors"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <SubscriptionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onSubscribe={subscribeToPlan} 
      />
    </div>
  );
};

export default SubscriptionPlans;
