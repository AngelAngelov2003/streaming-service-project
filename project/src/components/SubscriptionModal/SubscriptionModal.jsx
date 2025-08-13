import React, { useState } from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionModal = ({ isOpen, onClose, plan, onSubscribe }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const navigate = useNavigate();

  if (!isOpen || !plan) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSimulatedPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    setTimeout(() => {
      try {
        navigate('/');
        onClose();

        onSubscribe(plan.id).catch(err => {
          console.error('Firestore update failed after payment:', err);
        });

        setIsPaymentSuccess(true);
        setIsProcessing(false);

      } catch (error) {
        console.error("Payment error:", error);
        setPaymentError("Payment failed. Please try again.");
        setIsProcessing(false);
      }
    }, 400); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1f1f1f] rounded-xl shadow-2xl p-6 sm:p-8 max-w-sm w-full relative transform transition-all duration-300 scale-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
          title="Close"
        >
          <X size={24} />
        </button>

        {isPaymentSuccess ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckCircle size={64} className="text-green-500 mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Success!</h2>
            <p className="text-gray-300">Your payment for the {plan.name} plan was successful.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center capitalize">
              Subscribe to {plan.name}
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Enter your payment details below. This is a simulated payment.
            </p>

            <form onSubmit={handleSimulatedPayment} className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-400 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="XXXX XXXX XXXX XXXX"
                  required
                  maxLength="16"
                />
              </div>

              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-400 mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={cardDetails.cardName}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Angel Angelov"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-400 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiry"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="MM/YY"
                    required
                    maxLength="5"
                  />
                </div>

                <div className="w-1/2">
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-400 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="XXX"
                    required
                    maxLength="3"
                  />
                </div>
              </div>

              {paymentError && (
                <p className="text-red-400 text-center text-sm">{paymentError}</p>
              )}

              <button
                type="submit"
                className={`w-full flex items-center justify-center p-3 rounded-lg text-white font-bold text-lg transition-colors duration-200 transform ${isProcessing ? 'bg-red-800 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-105'} shadow-lg`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard size={20} className="mr-2" />
                    Pay
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;
