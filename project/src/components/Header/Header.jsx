import { NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-black bg-opacity-90 text-white p-4 z-50 flex items-center justify-between shadow-lg">
      <div className="flex items-center">
        <Link to="/" className="text-red-600 text-3xl font-bold mr-8">StreamX</Link>
        <nav className="hidden md:flex space-x-6 text-lg">
          <Link to="/" className="hover:text-gray-300 transition-colors duration-200">Home</Link>
          <Link to="/tvshows" className="hover:text-gray-300 transition-colors duration-200">TV Shows</Link>
          <Link to="/movies" className="hover:text-gray-300 transition-colors duration-200">Movies</Link>
          <Link to="/newpopular" className="hover:text-gray-300 transition-colors duration-200">New & Popular</Link>
          <Link to="/mylist" className="hover:text-gray-300 transition-colors duration-200">List</Link>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        </div>
      </div>
      <button className="md:hidden text-white">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </header>
  );
};

export default Header;