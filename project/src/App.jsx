import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Loader from './components/Loader/Loader';
import Home from './pages/Home/Home.jsx';
import TvShows from './pages/TvShows/TvShows.jsx';
import Movies from './pages/Movies/Movies.jsx';
import NewPopular from './pages/NewPopular/NewPopular.jsx';
import List from './pages/List/List.jsx';
import Login from './pages/Login/Login.jsx';
import Signup from './pages/Signup/Signup.jsx';
import SubscriptionPlans from './pages/SubscriptionPlans/SubscriptionPlans.jsx';
import Account from './pages/Account/Account.jsx';
import AdminPage from './pages/Admin/Admin.jsx';
import Details from './pages/Details/Details.jsx';
import FooterPage from './pages/FooterPage/FooterPage.jsx';
import { SearchProvider } from "./components/SearchContext/SearchContext.jsx";

function App() {
  const { currentUser, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const RootRedirect = () => {
    if (loading) return <Loader />;
    if (currentUser) return <Home />;
    React.useEffect(() => {
      navigate('/login', { state: { from: location.pathname } });
    }, [navigate, location]);
    return null;
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) return <Loader />;
    if (!currentUser) {
      React.useEffect(() => {
        navigate('/login', { state: { from: location.pathname } });
      }, [navigate, location]);
      return null;
    }
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (loading) return <Loader />;
    if (!currentUser || role !== 'admin') {
      React.useEffect(() => {
        navigate('/', { replace: true });
      }, [navigate]);
      return null;
    }
    return children;
  };

  return (
    <SearchProvider>
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
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/details/:id" element={<ProtectedRoute><Details /></ProtectedRoute>} />
          <Route path="/footer" element={<FooterPage />} />
        </Routes>
      </main>
      {currentUser && <Footer />}
    </SearchProvider>
  );
}

export default App;
