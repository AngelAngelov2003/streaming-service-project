import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email to reset password.');
      return;
    }
    try {
      await resetPassword(email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={handleForgotPassword}
          className="mt-4 text-sm text-red-500 hover:underline w-full text-center"
        >
          Forgot your password?
        </button>

        <p className="mt-6 text-center text-gray-400">
          New to the service?{' '}
          <Link to="/signup" className="text-red-600 hover:underline">
            Sign up now.
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
