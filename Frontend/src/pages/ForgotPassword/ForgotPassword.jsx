import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/auth'; // Fixed import path
import { useNavigate } from 'react-router-dom';
import styles from '../Login/Login.module.css';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2 className={styles.authTitle}>Reset Password</h2>
        <p>Enter your email address to receive a password reset link.</p>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await authAPI.requestPasswordReset(values.email);
              toast.success('Password reset email sent! Please check your inbox.');
              navigate('/login');
            } catch (error) {
              toast.error(error.error || 'Failed to send password reset email.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className={styles.formGroup}>
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={styles.formInput}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className={styles.errorMessage}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </Form>
          )}
        </Formik>
        <p className={styles.authFooter}>
          Remember your password?{' '}
          <a href="/login" className={styles.authLink}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;