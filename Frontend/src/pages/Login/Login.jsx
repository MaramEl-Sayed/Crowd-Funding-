import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';
import { FaEnvelope, FaLock, FaFacebookF } from 'react-icons/fa';

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
        appId: '583449137409337',
        cookie: true,
        xfbml: true,
        version: 'v22.0'
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F2EFE7] p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        {/* Left Side (Login Form) */}
        <div className="w-full md:w-1/2 bg-white p-6 sm:p-8">
          <h2 className="text-xl sm:text-4xl font-bold text-[#006A71] mb-6 text-center">Login to Athr</h2>

          {/* Social Login Buttons */}
          <div className="flex flex-col items-center gap-4 mb-6">
          <button
              type="button"
              onClick={() => {
                window.FB.login(
                  response => {
                    if (response.authResponse) {
                      const accessToken = response.authResponse.accessToken;

                      window.FB.api('/me', { fields: ['email','picture'] }, async userInfo => {
                        const email = userInfo.email;

                        if (!email) {
                          toast.error('Email not found in Facebook profile');
                          return;
                        }

                        try {
                          const emailExists = await checkEmailExists(email);
                          if (!emailExists) {
                            toast.error('Account does not exist. Please register first.');
                            return;
                          }

                          await authAPI.facebookLogin({ access_token: accessToken });
                          toast.success('Facebook login successful!');
                          navigate('/home');
                        } catch (error) {
                          console.error('Facebook login error:', error);
                          toast.error(error?.error || 'Facebook login failed');
                        }
                      });
                    } else {
                      toast.error('Facebook login cancelled');
                    }
                  },
                  { scope: 'public_profile,email' }
                );
              }}
              className="p-1 max-w-xs h-10 border border-[#48A6A7] rounded-lg hover:bg-[#48A6A7] hover:text-white transition duration-300 text-[#006A71] font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <FaFacebookF className="w-5 h-5 text-[#006A71] hover:text-white" />
              Continue with Facebook
            </button>


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
                    className=" p-2 max-w-xs h-10 border border-[#48A6A7] rounded-lg hover:bg-[#48A6A7] hover:text-white transition duration-300 text-[#006A71] font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                  >
                    <svg
                      className="w-5 h-5 text-[#006A71] hover:text-white"
                      viewBox="0 0 24 24"
                    >
                      <text
                        x="50%"
                        y="65%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="16"
                        fontWeight="bold"
                        fontFamily="Arial, sans-serif"
                      >
                        G
                      </text>
                    </svg>
                    Continue with Google
                  </button>
                )}
              />
            </GoogleOAuthProvider>
          </div>

          <p className="text-center text-[#1e1e1e] mb-6 text-sm sm:text-base">or use your email account:</p>

          {/* Login Form */}
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
              <Form className="space-y-4">
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                </div>

                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                  <Field
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                </div>

                <div className="text-right">
                  <a href="/forgot-password" className="text-[#006A71] text-xs sm:text-sm hover:underline">
                    Forgot your password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#006A71] hover:bg-[#04828c] text-[#ffffff] font-semibold py-2 sm:py-3 rounded-lg transition duration-300 text-sm sm:text-base"
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Right Side (Sign Up Prompt) */}
        <div className="w-full md:w-1/2 bg-[#006A71] p-6 sm:p-8 flex flex-col justify-center items-center text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#ffffff] mb-4">New here?</h2>
          <p className="text-[#ffffff] mb-6 text-sm sm:text-base">We'll get you signed up in no time.</p>
          <button
            onClick={() => navigate('/register')}
            className="border-2 border-[#ffffff] text-[#ffffff] hover:bg-[#48A6A7] hover:border-[#48A6A7] font-semibold py-2 px-4 sm:px-6 rounded-lg transition duration-300 text-sm sm:text-base"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;