import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authAPI } from '../../api/auth';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <nav style={{ backgroundColor: '#ffffff', color: '#1e1e1e' }} className="shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            style={{ color: '#1e1e1e' }}
            className="hover:text-[#006A71] focus:outline-none"
          >
            {isMenuOpen ? <FaTimes size={24} className='text-[#006A71]' /> : <FaBars size={24} className='text-[#006A71]' />}
          </button>
        </div>

        {/* Left side - hidden on mobile */}
        <div className="hidden md:flex items-center space-x-4">

          <NavLink to="/home" className="hover:text-[#006A71]">
            Home
          </NavLink>
          <NavLink to="/campaigns" className="hover:text-[#006A71]">
            Campaigns
          </NavLink>
          <NavLink to="/categories" className="hover:text-[#006A71]">
            Categories
          </NavLink>
          <NavLink to="/finished" className="hover:text-[#006A71]">
            Finished Campaigns
          </NavLink>
        </div>

        {/* Center logo */}
        <NavLink
          to="/home"
          className="text-xl font-bold tracking-wide mx-auto md:mx-0"
          style={{ color: '#006A71' }}
        >
          Athr<span style={{ color: '#48A6A7' }}></span>
        </NavLink>

        {/* Right side - hidden on mobile */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLink to="/about" className="hover:text-[#006A71]">
            About US
          </NavLink>
          {user ? (
            <>
              <NavLink to="/profile" className="hover:text-[#006A71]">
                Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="hover:text-[#006A71]">
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className="border font-medium py-1 px-3 rounded-full transition"
                style={{
                  borderColor: '#006A71',
                  color: '#006A71',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#006A71';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#006A71';
                }}
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-12 left-0 right-0 shadow-md z-50 py-4 px-4"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div className="flex flex-col space-y-4">
              <NavLink
                to="/search"
                className="flex items-center gap-1 hover:text-[#006A71]"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaSearch className="text-sm" />
                <span>Search</span>
              </NavLink>
              <NavLink
                to="/home"
                className="hover:text-[#006A71]"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/campaigns"
                className="hover:text-[#006A71]"
                onClick={() => setIsMenuOpen(false)}
              >
                Campaigns
              </NavLink>
              <NavLink
                to="/about"
                className="hover:text-[#006A71]"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </NavLink>

              {user ? (
                <>
                  <NavLink
                    to="/profile"
                    className="hover:text-[#006A71]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-sm text-red-600 hover:underline text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="hover:text-[#006A71]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="border font-medium py-1 px-3 rounded-full transition text-center"
                    style={{
                      borderColor: '#006A71',
                      color: '#006A71',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#006A71';
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#006A71';
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Start a GoFundMe
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
