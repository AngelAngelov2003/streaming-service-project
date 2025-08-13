import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const { subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && subscriptionStatus === 'active') {
      const fetchMovies = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'movies'));
          const moviesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMovies(moviesData);
        } catch (error) {
          console.error("Error fetching movies:", error);
        }
      };
      fetchMovies();
    }
  }, [subscriptionStatus, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  if (subscriptionStatus !== 'active') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold">Access Denied</h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-400">
          You need an active subscription to view this content.
        </p>
        <button
          onClick={() => navigate('/subscribe')}
          className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
        >
          Go to Subscription Plans
        </button>
      </div>
    );
  }

  const trendingMovies = movies.filter(movie => movie.category === 'trending');
  const popularMovies = movies.filter(movie => movie.category === 'popular');

  return (
    <div className="pt-20">
      <section className="text-center mb-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
          Welcome to the Home Page
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-400">
          Discover a world of entertainment.
        </p>
      </section>

      <section className="mb-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Trending Now</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {trendingMovies.map((movie) => (
            <div key={movie.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden aspect-video relative">
              <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Popular Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {popularMovies.map((movie) => (
            <div key={movie.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden aspect-video relative">
              <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;