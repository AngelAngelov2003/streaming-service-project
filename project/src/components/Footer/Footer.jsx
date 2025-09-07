import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-gray-400 py-10">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div className="flex flex-col space-y-2">
            <Link to="/footer" className="hover:underline">Audio and Subtitles</Link>
            <Link to="/footer" className="hover:underline">Media Center</Link>
            <Link to="/footer" className="hover:underline">Privacy</Link>
            <Link to="/footer" className="hover:underline">Contact Us</Link>
          </div>
          <div className="flex flex-col space-y-2">
            <Link to="/footer" className="hover:underline">Audio Description</Link>
            <Link to="/footer" className="hover:underline">Investor Relations</Link>
            <Link to="/footer" className="hover:underline">Legal Notices</Link>
          </div>
          <div className="flex flex-col space-y-2">
            <Link to="/footer" className="hover:underline">Help Center</Link>
            <Link to="/footer" className="hover:underline">Jobs</Link>
            <Link to="/footer" className="hover:underline">Cookie Preferences</Link>
          </div>
          <div className="flex flex-col space-y-2">
            <Link to="/footer" className="hover:underline">Gift Cards</Link>
            <Link to="/footer" className="hover:underline">Terms of Use</Link>
            <Link to="/footer" className="hover:underline">Corporate Information</Link>
          </div>
        </div>
        <div className="mt-10 text-xs text-gray-500">
          <p>© 2025 StreamFlix, Inc.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
