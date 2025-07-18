// src/pages/Home/Home.jsx
import React from 'react';
// Header is in App.jsx, so no need to import here for this structure.

const Home = () => {
  return (
    <> {/* Using a React Fragment to avoid adding an extra div */}
      {/* Hero Section / Main Title */}
      {/* This section has the responsive horizontal padding */}
      <section className="text-center mb-12 mt-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
          Home Page
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-400">
          Discover a world of entertainment.
        </p>
      </section>

      {/* Content sections for Trending Now, Popular Movies, etc. */}
      {/* Each of these also applies its own responsive horizontal padding */}
      <section className="mb-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Trending Now</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden aspect-video flex items-center justify-center text-gray-500 text-sm">
              Item {i + 1}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Popular Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden aspect-video flex items-center justify-center text-gray-500 text-sm">
              Item {i + 1}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;