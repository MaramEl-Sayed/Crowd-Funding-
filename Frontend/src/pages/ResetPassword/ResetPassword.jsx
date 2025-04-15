import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/auth'; // Fixed import path
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../Login/Login.module.css';

const ResetPasswordSchema = Yup.object().shape({
  new_password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
    .required('Required'),
});

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2 className={styles.authTitle}>Set New Password</h2>
        <Formik
          initialValues={{ new_password: '', confirm_password: '' }}
          validationSchema={ResetPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await authAPI.confirmPasswordReset(uid, token, values.new_password);
              toast.success('Password reset successful! Please login with your new password.');
              navigate('/login');
            } catch (error) {
              toast.error(error.error || 'Failed to reset password.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className={styles.formGroup}>
                <Field
                  type="password"
                  name="new_password"
                  placeholder="New Password"
                  className={styles.formInput}
                />
                <ErrorMessage
                  name="new_password"
                  component="div"
                  className={styles.errorMessage}
                />
              </div>
              <div className={styles.formGroup}>
                <Field
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm Password"
                  className={styles.formInput}
                />
                <ErrorMessage
                  name="confirm_password"
                  component="div"
                  className={styles.errorMessage}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </Form>
          )}
        </Formik>
        <p className={styles.authFooter}>
          Return to{' '}
          <a href="/login" className={styles.authLink}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;