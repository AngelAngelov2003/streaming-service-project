import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { useSearch } from '../SearchContext/SearchContext.jsx';
import { User, Search } from 'lucide-react';

const Header = () => {
  const { logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#141414] bg-opacity-90 backdrop-blur-sm p-4 shadow-lg flex justify-between items-center h-16">
      <nav className="flex items-center space-x-6">
        <NavLink to="/" className="text-xl font-bold text-red-600 tracking-wider">
          STREAMFLIX
        </NavLink>
        <div className="hidden md:flex space-x-4">
          <NavLink to="/" className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Home</NavLink>
          <NavLink to="/tvshows" className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>TV Shows</NavLink>
          <NavLink to="/movies" className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Movies</NavLink>
          <NavLink to="/newpopular" className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>New & Popular</NavLink>
          <NavLink to="/mylist" className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>My List</NavLink>
        </div>
      </nav>

      <div className="flex items-center space-x-3">
        <div className="relative flex items-center" ref={searchRef}>
          <button
            onClick={() => setIsSearchOpen(prev => !prev)}
            className="p-2 rounded-full text-white"
            title="Search"
          >
            <Search size={20} />
          </button>
          {isSearchOpen && (
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#141414] bg-opacity-90 backdrop-blur-sm text-white rounded-full pl-10 pr-4 py-1 w-52 focus:outline-none transition-all duration-300"
            />
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            className="flex items-center p-2 rounded-full hover:bg-gray-700 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Account Options"
          >
            <User size={20} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1f1f1f] rounded-md shadow-lg py-1 z-50 transition-all duration-200">
              <NavLink to="/account" onClick={() => setIsMenuOpen(false)}
                       className="block px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-md">
                Account
              </NavLink>
              <button onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-red-600 rounded-md">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
