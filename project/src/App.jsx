import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home.jsx';
import TvShows from './pages/TvShows/TvShows.jsx';
import Movies from './pages/Movies/Movies.jsx';
import NewPopular from './pages/NewPopular/NewPopular.jsx';
import List from './pages/List/List.jsx';
import Login from './pages/Login/Login.jsx';
import Signup from './pages/Signup/Signup.jsx';
import SubscriptionPlans from './pages/SubscriptionPlans/SubscriptionPlans.jsx';
import Account from './pages/Account/Account.jsx';

function App() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  const RootRedirect = () => {
    if (loading) {
      return <div className="flex items-center justify-center min-h-screen text-lg text-white">Loading...</div>;
    }

    if (currentUser) {
      return <Home />;
    }

    React.useEffect(() => {
      navigate('/login');
    }, [navigate]);

    return null;
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className="flex items-center justify-center min-h-screen text-lg text-white">Loading...</div>;
    }
    
    if (!currentUser) {
      React.useEffect(() => {
        navigate('/login');
      }, [navigate]);
      return null;
    }

    return children;
  };
  
  return (
    <>
      {currentUser && <Header />}
      
      <main className="bg-[#141414] text-white pt-[64px] w-full min-h-screen font-inter">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/subscribe" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />

          <Route path="/" element={<RootRedirect />} />

          <Route path="/tvshows" element={<ProtectedRoute><TvShows /></ProtectedRoute>} />
          <Route path="/movies" element={<ProtectedRoute><Movies /></ProtectedRoute>} />
          <Route path="/newpopular" element={<ProtectedRoute><NewPopular /></ProtectedRoute>} />
          <Route path="/mylist" element={<ProtectedRoute><List /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} /> {/* <-- Updated route */}
        </Routes>
      </main>

      {currentUser && <Footer />} 
    </>
  );
}

export default App;