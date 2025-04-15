import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';

const checkEmailExists = async (email) => {
  try {
    const response = await fetch(`http://localhost:8000/api/accounts/check-email/?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to check email');
    }
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      window.FB.init({
        appId: '1004483484552046',
        cookie: true,
        xfbml: true,
        version: 'v19.0'
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2 className={styles.authTitle}>Login</h2>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const emailExists = await checkEmailExists(values.email);
              if (!emailExists) {
                toast.error("Account does not exist. Please register first.");
                return;
              }

              await authAPI.login(values);
              toast.success('Login successful!');
              navigate('/home');
            } catch (error) {
              toast.error(error.error || 'Login failed');
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
              <div className={styles.formGroup}>
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className={styles.formInput}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className={styles.errorMessage}
                />
                <div className={styles.forgotPassword}>
                  <a href="/forgot-password" className={styles.authLink}>
                    Forgot Password?
                  </a>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? 'Logging in...' : 'Continue with email'}
              </button>
            </Form>
          )}
        </Formik>

        <div className={styles.socialLogin}>
          <div className={styles.divider}>Other sign in options</div>
          <div className={styles.socialButtonsContainer}>
            <GoogleOAuthProvider clientId="75773251008-89sei1vuligu58shbmup4f5ttqq097o5.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    if (!credentialResponse?.credential) {
                      throw new Error('No credential received from Google');
                    }

                    const decoded = decodeJwt(credentialResponse.credential);
                    const email = decoded?.email;
                    const profilePicture = decoded?.picture || null;

                    if (!email) {
                      throw new Error('Email not found in Google profile');
                    }

                    const emailExists = await checkEmailExists(email);
                    if (!emailExists) {
                      toast.error("Account does not exist. Please register first.");
                      return;
                    }

                    const response = await authAPI.googleLogin({
                      access_token: credentialResponse.credential,
                      token_type: 'id_token',
                      profile_picture: profilePicture
                    });

                    toast.success('Google login successful!');
                    navigate('/home');
                  } catch (error) {
                    console.error('Google login error:', error);
                    toast.error(error.message || error.error || 'Google login failed');
                  }
                }}
                onError={(error) => {
                  console.error('Google login error:', error);
                  toast.error('Google login failed');
                }}
                useOneTap={false}
                render={(renderProps) => (
                  <button
                    type="button"
                    className={`${styles.socialButton} ${styles.googleButton}`}
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                  >
                    <FcGoogle className={styles.googleIcon} /> 
                  </button>
                )}
              />
            </GoogleOAuthProvider>
            <button
              type="button"
              onClick={async () => {
                window.FB.login(async response => {
                  if (response.authResponse) {
                    const accessToken = response.authResponse.accessToken;
                    try {
                      const userInfo = await new Promise((resolve) => {
                        window.FB.api('/me', { fields: 'email' }, resolve);
                      });
                      const email = userInfo.email;

                      if (!email) {
                        toast.error('Email not found in Facebook profile');
                        return;
                      }

                      const emailExists = await checkEmailExists(email);
                      if (!emailExists) {
                        toast.error("Account does not exist. Please register first.");
                        return;
                      }

                      await authAPI.facebookLogin({ access_token: accessToken });
                      toast.success('Facebook login successful!');
                      navigate('/home');
                    } catch (error) {
                      toast.error(error.error || 'Facebook login failed');
                    }
                  } else {
                    toast.error('Facebook login cancelled');
                  }
                }, { scope: 'public_profile,email' });
              }}
              className={`${styles.socialButton} ${styles.facebookButton}`}
            >
              <FaFacebookF className={styles.facebookIcon} /> Sign in with Facebook
            </button>
          </div>
        </div>

        <p className={styles.authFooter}>
          Don't have an account?{' '}
          <a href="/register" className={styles.authLink}>
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;