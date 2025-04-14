import { Link } from 'react-router-dom';
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
    window.location.href = '/login';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navBrand}>
          AuthApp
        </Link>
        <div className={styles.navLinks}>
          {user ? (
            <>
              <Link to="/home" className={styles.navLink}>
                Home
              </Link>
              <Link to="/projects" className={styles.navLink}>
                Projects
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>
                Login
              </Link>
              <Link to="/register" className={styles.registerButton}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};


export default Navbar;