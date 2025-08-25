import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(email, password);
      toast.success('Signup successful! Please choose a plan.');
      navigate('/subscribe');
    } catch (err) {
      toast.error(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 bg-gray-700 rounded-md text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 bg-gray-700 rounded-md text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`p-3 rounded-md font-bold transition-colors ${loading ? 'bg-red-800 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-red-600 hover:underline">
            Sign in.
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
