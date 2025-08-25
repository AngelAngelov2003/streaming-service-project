import React, { useState } from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubscriptionModal = ({ isOpen, onClose, plan, onSubscribe }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const navigate = useNavigate();

  if (!isOpen || !plan) return null;

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    return value.replace(/\D/g, '').replace(/^(\d{2})(\d{0,2})/, (_, m1, m2) => (m2 ? `${m1}/${m2}` : m1));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      setCardDetails(prev => ({ ...prev, cardNumber: formatCardNumber(value) }));
    } else if (name === 'expiry') {
      setCardDetails(prev => ({ ...prev, expiry: formatExpiry(value) }));
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSimulatedPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await onSubscribe(plan.id); // simulate Firestore update
      toast.success(`Payment for ${plan.name} plan successful!`);
      navigate('/');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
              maxLength="19"
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
      </div>
    </div>
  );
};

export default SubscriptionModal;
