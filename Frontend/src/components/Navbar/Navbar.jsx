import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authAPI } from '../../api/auth';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { FiLogOut } from 'react-icons/fi';


const AuthPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white/95 rounded-xl shadow-lg max-w-md w-full p-6 border border-[#9ACBD0]"
      >
        <div className="flex items-start mb-4">
          <FaExclamationCircle className="text-2xl text-[#006A71] mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-[#1e1e1e]">Account Required</h3>
            <p className="text-[#1e1e1e] mt-1">
              You need to register an account before starting a campaign. Would you like to register now?
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[#9ACBD0] text-[#1e1e1e] hover:bg-[#F2EFE7] transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-[#006A71] hover:bg-[#04828c] text-white transition duration-200 flex items-center"
          >
            Register Now <FaArrowRight className="ml-2" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  useEffect(() => {
    setUser(authAPI.getCurrentUser());

    const handleStorageChange = () => {
      setUser(authAPI.getCurrentUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('storage'));
    setUser(null);
    window.location.href = '/login';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleStartCampaign = () => {
    if (user) {
      window.location.href = '/create-campaign';
    } else {
      setShowAuthPopup(true);
    }
  };

  const handleAuthConfirm = () => {
    setShowAuthPopup(false);
    window.location.href = '/register';
  };

  const handleAuthCancel = () => {
    setShowAuthPopup(false);
  };

  const navItemClass =
    'px-4 py-2 rounded-full text-sm font-medium hover:bg-[#E8F3F3] hover:text-[#006A71] transition duration-200';

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-md">
      {showAuthPopup && <AuthPopup onConfirm={handleAuthConfirm} onCancel={handleAuthCancel} />}

      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center relative">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-[#006A71] hover:text-[#04828c] transition"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Left Links */}
        <div className="hidden md:flex space-x-3 items-center">
          <NavLink to="/campaigns" className={navItemClass}>
            Campaigns
          </NavLink>
          <NavLink to="/finished-campaigns" className={navItemClass}>
            Finished Campaigns
          </NavLink>
          <NavLink to="/categories" className={navItemClass}>
            Categories
          </NavLink>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NavLink
            to="/home"
            className="flex items-center space-x-2 text-2xl font-bold tracking-wide text-[#006A71]"
          >
            <img
              src="public\Preview (2).png"
              alt="Athr_Logo"
              className="h-8 w-8 object-contain rounded-full"
            />
            <span>Athr</span>
          </NavLink>
        </div>
        {/* Right Links */}
        <div className="hidden md:flex space-x-4 items-center ml-auto">
          <NavLink to="/about" className={navItemClass}>
            About Us
          </NavLink>
          {user ? (
            <>
              <button
                onClick={handleStartCampaign}
                className="border border-[#006A71] text-[#006A71] px-4 py-2 rounded-full hover:bg-[#006A71] hover:text-white transition"
              >
                Start New Campaign
              </button>
              <NavLink to="/profile" className={navItemClass}>
                Profile
              </NavLink>
              <button
                onClick={handleLogout}
                title="Logout"
                className="text-[#DC2626] hover:text-red-700 transition p-2 rounded-full hover:bg-red-100"
              >
                <FiLogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navItemClass}>
                Sign in
              </NavLink>
              <button
                onClick={handleStartCampaign}
                className="border border-[#006A71] text-[#006A71] px-4 py-2 rounded-full hover:bg-[#006A71] hover:text-white transition"
              >
                Start New Campaign
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}


        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-6 overflow-y-auto flex flex-col space-y-4"
          >
            {/* Close Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={toggleMenu}
                className="text-[#006A71] hover:text-[#04828c]"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <NavLink
              to="/home"
              onClick={toggleMenu}
              className="w-full py-3 px-4 bg-gray-100 text-[#1e1e1e] hover:bg-[#006A71] hover:text-white rounded-md text-center transition"
            >
              Home
            </NavLink>

            <NavLink
              to="/campaigns"
              onClick={toggleMenu}
              className="w-full py-3 px-4 bg-gray-100 text-[#1e1e1e] hover:bg-[#006A71] hover:text-white rounded-md text-center transition"
            >
              Campaigns
            </NavLink>

            <NavLink
              to="/finished-campaigns"
              onClick={toggleMenu}
              className="w-full py-3 px-4 bg-gray-100 text-[#1e1e1e] hover:bg-[#006A71] hover:text-white rounded-md text-center transition"
            >
              Finished Campaigns
            </NavLink>

            <NavLink
              to="/categories"
              onClick={toggleMenu}
              className="w-full py-3 px-4 bg-gray-100 text-[#1e1e1e] hover:bg-[#006A71] hover:text-white rounded-md text-center transition"
            >
              Categories
            </NavLink>

            <NavLink
              to="/about"
              onClick={toggleMenu}
              className="w-full py-3 px-4 bg-gray-100 text-[#1e1e1e] hover:bg-[#006A71] hover:text-white rounded-md text-center transition"
            >
              About
            </NavLink>

            {user ? (
              <>
                <button
                  onClick={() => {
                    handleStartCampaign();
                    toggleMenu();
                  }}
                  className="w-full py-3 px-4 border border-[#006A71] text-[#006A71] hover:bg-[#006A71] hover:text-white rounded-md text-center transition"
                >
                  Start New Campaign
                </button>

                <NavLink
                  to="/profile"
                  onClick={toggleMenu}
                  className="w-full py-3 px-4 bg-gray-100 text-[#1e1e1e] hover:bg-[#006A71] hover:text-white rounded-md text-center transition"
                >
                  Profile
                </NavLink>

                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  title="Logout"
                  className="w-full py-3 px-4 text-red-600 hover:text-white hover:bg-red-600 rounded-md text-center transition flex items-center justify-center space-x-2"
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={toggleMenu}
                  className="w-full py-3 px-4 bg-gray-100 text-[#1e1e1e] hover:bg-[#006A71] hover:text-white rounded-md text-center transition"
                >
                  Sign in
                </NavLink>

                <button
                  onClick={() => {
                    handleStartCampaign();
                    toggleMenu();
                  }}
                  className="w-full py-3 px-4 border border-[#006A71] text-[#006A71] hover:bg-[#006A71] hover:text-white rounded-md text-center transition"
                >
                  Start New Campaign
                </button>
              </>
            )}
          </motion.div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
