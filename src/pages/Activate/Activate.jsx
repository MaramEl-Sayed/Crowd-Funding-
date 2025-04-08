import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/auth';
import styles from './Activate.module.css';

const Activate = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const activateAccount = async () => {
      try {
        await authAPI.activate(uidb64, token);
        toast.success('Account activated successfully! You can now login.');
        window.dispatchEvent(new Event('storage'));
        navigate('/login');
      } catch (error) {
        toast.error(error.error || 'Activation failed. The link may be invalid or expired.');
        navigate('/register');
      }
    };

    activateAccount();
  }, [uidb64, token, navigate]);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2 className={styles.authTitle}>Activating Your Account</h2>
        <div style={{ textAlign: 'center' }}>
          <p>Please wait while we activate your account...</p>
          <div style={{ marginTop: '2rem' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activate;