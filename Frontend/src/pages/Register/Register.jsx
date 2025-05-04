import { Formik, Field, ErrorMessage, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { authAPI } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import defaultProfilePic from '../../assets/default-profile-pic.png';
import { FaCamera, FaUser, FaEnvelope, FaLock, FaPhone, FaCalendarAlt, FaGlobe, FaFacebookF } from 'react-icons/fa';

const checkEmailExists = async (email) => {
  try {
    const response = await fetch(`http://localhost:8000/api/accounts/check-email/?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to check email: ${response.statusText}`);
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

const generateTempPassword = () => {
  return Math.random().toString(36).slice(2, 10) + '@Google';
};

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  mobile_phone: Yup.string()
    .matches(/^01[0-2,5]{1}[0-9]{8}$/, "Invalid Egyptian phone number")
    .required("Phone number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  birthdate: Yup.date().required("Birthdate is required").nullable(),
  country: Yup.string().nullable(),
  profile_picture: Yup.mixed().nullable(),
  terms: Yup.boolean()
    .oneOf([true], "You must agree to the terms and privacy policy")
    .required("You must agree to the terms and privacy policy"),
});

const Register = () => {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(defaultProfilePic);

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

  const handleProfilePictureChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    setFieldValue("profile_picture", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F2EFE7] p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        {/* Left Side */}
        <div className="w-full md:w-1/2 bg-[#006A71] p-6 sm:p-8 flex flex-col justify-center items-center text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#ffffff] mb-4">Already have an account?</h2>
          <p className="text-[#ffffff] mb-6 text-sm sm:text-base">Let's get you logged back in.</p>
          <button
            onClick={() => navigate('/login')}
            className="border-2 border-[#ffffff] text-[#ffffff] hover:bg-[#48A6A7] hover:border-[#48A6A7] font-semibold py-2 px-4 sm:px-6 rounded-lg transition duration-300 text-sm sm:text-base"
          >
            Login
          </button>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 bg-white p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#006A71] text-center mb-6">Create account</h2>

          {/* Social Login Buttons */}
          <div className="flex flex-col items-center gap-4 mb-6">
          <button
              type="button"
              onClick={() => {
                window.FB.login(
                  response => {
                    if (response.authResponse) {
                      const accessToken = response.authResponse.accessToken;

                      // Fetch user info from Facebook
                      window.FB.api('/me', { fields: 'name,email,first_name,last_name,picture' }, async userInfo => {
                        const email = userInfo.email;

                        if (!email) {
                          toast.error('Email not found in Facebook profile');
                          return;
                        }

                        try {
                          const emailExists = await checkEmailExists(email);

                          if (emailExists) {
                            toast.error('Account already exists. Please login.');
                            return;
                          }

                          await authAPI.facebookRegister({ access_token: accessToken });

                          toast.success('Facebook registration successful!');
                          navigate('/login');
                        } catch (error) {
                          console.error('Facebook registration error:', error);
                          toast.error(error?.error || 'Facebook registration failed');
                        }
                      });
                    } else {
                      toast.error('Facebook registration cancelled');
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
                    const firstName = decoded?.given_name || '';
                    const lastName = decoded?.family_name || '';

                    if (!email) {
                      throw new Error('Email not found in Google profile');
                    }

                    const emailExists = await checkEmailExists(email);
                    if (emailExists) {
                      toast.error("Account already exists with this email. Please login.");
                      return;
                    }

                    const tempPassword = generateTempPassword();
                    const formData = new FormData();
                    formData.append('username', email.split('@')[0]);
                    formData.append('first_name', firstName);
                    formData.append('last_name', lastName);
                    formData.append('email', email);
                    formData.append('password', tempPassword);
                    formData.append('confirm_password', tempPassword);
                    formData.append('mobile_phone', '01234567890');
                    formData.append('birthdate', '1990-01-01');
                    if (profilePicture) {
                      formData.append('profile_picture_url', profilePicture);
                    }

                    console.log("Sending Google registration data:", Object.fromEntries(formData));

                    const response = await authAPI.register(formData);
                    console.log("Google registration response:", response);

                    toast.success('Google registration successful! Please check your email to activate your account.');
                    navigate('/login');
                  } catch (error) {
                    console.error('Google registration error:', error);
                    toast.error(error.error || error.message || 'Google registration failed');
                  }
                }}
                onError={(error) => {
                  console.error('Google registration error:', error);
                  toast.error('Google registration failed');
                }}
                useOneTap={false}
                render={(renderProps) => (
                  <button
                    type="button"
                    className="p-1 max-w-xs h-10 border border-[#48A6A7] rounded-lg hover:bg-[#48A6A7] hover:text-white transition duration-300 text-[#006A71] font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
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

          <p className="text-center text-[#1e1e1e] mb-6 text-sm sm:text-base">or use your email for registration:</p>

          {/* Form */}
          <Formik
            initialValues={{
              username: "",
              first_name: "",
              last_name: "",
              email: "",
              mobile_phone: "",
              password: "",
              confirm_password: "",
              birthdate: "",
              country: "",
              profile_picture: null,
              terms: false,
            }}
            validationSchema={RegisterSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                const emailExists = await checkEmailExists(values.email);
                if (emailExists) {
                  toast.error("Account already exists with this email.");
                  setSubmitting(false);
                  return;
                }

                const formData = new FormData();
                formData.append("username", values.username);
                formData.append("first_name", values.first_name);
                formData.append("last_name", values.last_name);
                formData.append("email", values.email);
                formData.append("mobile_phone", values.mobile_phone);
                formData.append("password", values.password);
                formData.append("confirm_password", values.confirm_password);
                if (values.birthdate) formData.append("birthdate", values.birthdate);
                if (values.country) formData.append("country", values.country);
                if (values.profile_picture) {
                  formData.append("profile_picture", values.profile_picture);
                }

                console.log("Sending registration data:", Object.fromEntries(formData));

                const response = await authAPI.register(formData);
                console.log("Registration response:", response);

                toast.success(
                  "Registration successful! Please check your email to activate your account."
                );
                navigate("/login");
              } catch (error) {
                console.error("Registration error:", error);
                if (error.error) {
                  if (error.username) {
                    setFieldError("username", error.username);
                  } else {
                    toast.error(error.error || "Registration failed");
                  }
                } else if (error.message) {
                  toast.error(error.message);
                } else {
                  toast.error("An unexpected error occurred during registration.");
                }
              } finally {
                setSubmitting(false);
              }
            }}
            encType="multipart/form-data"
          >
            {({ setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full overflow-hidden border-4 border-[#48A6A7] flex items-center justify-center">
                      <img
                        src={profilePicture}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label
                      htmlFor="profile_picture"
                      className="absolute bottom-0 right-0 bg-[#006A71] rounded-full p-2 cursor-pointer hover:bg-[#04828c] transition duration-300"
                    >
                      <FaCamera className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        id="profile_picture"
                        type="file"
                        name="profile_picture"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleProfilePictureChange(event, setFieldValue)}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/2 relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                    <Field
                      type="text"
                      name="first_name"
                      placeholder="Your first name"
                      className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                    />
                    <ErrorMessage name="first_name" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                  </div>
                  <div className="w-full sm:w-1/2 relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                    <Field
                      type="text"
                      name="last_name"
                      placeholder="Your last name"
                      className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                    />
                    <ErrorMessage name="last_name" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                  </div>
                </div>

                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                  <Field
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                  />
                  <ErrorMessage name="username" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                </div>

                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                  <Field
                    type="email"
                    name="email"
                    placeholder="Your email"
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

                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                  <Field
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                  />
                  <ErrorMessage name="confirm_password" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                </div>

                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                  <Field
                    type="text"
                    name="mobile_phone"
                    placeholder="Mobile Phone (e.g., 01234567890)"
                    className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                  />
                  <ErrorMessage name="mobile_phone" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                </div>

                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                  <Field
                    type="date"
                    name="birthdate"
                    placeholder="Birthdate"
                    className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                  />
                  <ErrorMessage name="birthdate" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                </div>

                <div className="relative">
                  <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                  <Field
                    type="text"
                    name="country"
                    placeholder="Country (optional)"
                    className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                  />
                  <ErrorMessage name="country" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                </div>

                <div className="flex items-center">
                  <Field
                    type="checkbox"
                    name="terms"
                    id="terms"
                    className="mr-2 accent-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <label htmlFor="terms" className="text-[#1e1e1e] text-xs sm:text-sm">
                    I have read, understood and agree to the terms and privacy policy
                  </label>
                  <ErrorMessage name="terms" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#006A71] hover:bg-[#04828c] text-[#ffffff] font-semibold py-2 sm:py-3 rounded-lg transition duration-300 text-sm sm:text-base"
                >
                  {isSubmitting ? "Registering..." : "Sign up"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Register;