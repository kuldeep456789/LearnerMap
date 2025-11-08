import React from 'react';
import { GitHubIcon, LinkedInIcon, ContactMailIcon } from './icons';

const Navbar: React.FC<{ onContactClick: () => void }> = ({ onContactClick }) => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-900/50 shadow-lg shadow-indigo-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center group">
            <h1 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors duration-300 font-serif">
              Learner Map
            </h1>
          </a>
          <div className="flex items-center gap-2">
            <a
              href="https://www.linkedin.com/in/kuldeep023/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors duration-300"
              aria-label="Connect on LinkedIn"
            >
              <LinkedInIcon className="h-6 w-6" />
            </a>
            <a
              href="https://github.com/kuldeep456789"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors duration-300"
              aria-label="View source on GitHub"
            >
              <GitHubIcon className="h-6 w-6" />
            </a>
            <button
              onClick={onContactClick}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors duration-300"
              aria-label="Contact Information"
            >
              <ContactMailIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;