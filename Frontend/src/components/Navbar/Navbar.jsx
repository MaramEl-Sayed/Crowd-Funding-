import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authAPI } from '../../api/auth';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [user, setUser] = useState(null);

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
    setUser(null); // Ensure user state is cleared immediately
    window.location.href = '/login';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <NavLink to="/home" className={styles.navBrand}>
          Crowd Funding
        </NavLink>
        <div className={styles.navLinks}>
          {user ? (
            <>
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className={styles.profilePicture}
                />
              ) : null}
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                Home
              </NavLink>
              <NavLink to="/projects" className={styles.navLink}>
                Projects
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                Profile
              </NavLink>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? `${styles.registerButton} ${styles.active}` : styles.registerButton
                }
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;