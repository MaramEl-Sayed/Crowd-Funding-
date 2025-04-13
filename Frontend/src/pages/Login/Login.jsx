import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2 className={styles.authTitle}>Login</h2>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
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
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
        <div className={styles.socialLogin}>
          <div className={styles.divider}>or</div>
          {useEffect(() => {
            // Load Facebook SDK script
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
          }, [])}

          <button
            type="button"
            onClick={() => {
              window.FB.login(response => {
                if (response.authResponse) {
                  authAPI.facebookLogin({ access_token: response.authResponse.accessToken })
                    .then(() => {
                      toast.success('Facebook login successful!');
                      navigate('/home');
                    })
                    .catch(error => {
                      toast.error(error.error || 'Facebook login failed');
                    });
                } else {
                  toast.error('Facebook login cancelled');
                }
              }, {scope: 'public_profile,email'});
            }}
            className={styles.socialButton}
          >
            Continue with Facebook
          </button>
          <GoogleOAuthProvider clientId="75773251008-89sei1vuligu58shbmup4f5ttqq097o5.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  console.log('Google credential response:', credentialResponse);
                  try {
                    if (!credentialResponse?.credential) {
                      throw new Error('No credential received from Google');
                    }
                    
                    const response = await authAPI.googleLogin({ 
                      access_token: credentialResponse.credential,
                      token_type: 'id_token'  // Explicitly specify token type
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
                useOneTap
                theme="filled_blue"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="300"
              />
          </GoogleOAuthProvider>
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