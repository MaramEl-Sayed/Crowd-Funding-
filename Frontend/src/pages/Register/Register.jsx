import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { authAPI } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import defaultProfilePic from '../../assets/default-profile-pic.png';
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
        <h2 className={styles.authTitle}>Create Account</h2>
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
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            try {
              const emailExists = await checkEmailExists(values.email);
              if (emailExists) {
                toast.error("Account already exists with this email.");
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

              await authAPI.register(formData);
              toast.success(
                "Registration successful! Please check your email to activate your account."
              );
              navigate("/login");
            } catch (error) {
              console.error(error);
              const errorMessage = error.response?.data?.detail || "Registration failed";
              if (error.response?.data?.username) {
                setFieldError("username", error.response.data.username);
              } else {
                toast.error(errorMessage);
              }
            } finally {
              setSubmitting(false);
            }
          }}
          encType="multipart/form-data"
        >
          {({ setFieldValue, isSubmitting }) => (
            <Form>
              <div className={styles.formGroup}>
                <div className={styles.profilePictureWrapper}>
                  <img
                    src={profilePicture}
                    alt="Profile Preview"
                    className={styles.profilePicture}
                  />
                  <div className={styles.uploadOverlay}>
                    <label htmlFor="profile_picture" className={styles.uploadLabel}>
                      Upload Picture
                    </label>
                    <input
                      type="file"
                      id="profile_picture"
                      name="profile_picture"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.currentTarget.files[0];
                        setFieldValue("profile_picture", file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setProfilePicture(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className={styles.uploadInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <Field
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  className={styles.formInput}
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className={styles.errorMessage}
                />
              </div>

              <div className={styles.formGroup}>
                <Field
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  className={styles.formInput}
                />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className={styles.errorMessage}
                />
              </div>

              <div className={styles.formGroup}>
                <Field
                  type="text"
                  name="username"
                  placeholder="Username"
                  className={styles.formInput}
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className={styles.errorMessage}
                />
              </div>

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
                  type="text"
                  name="mobile_phone"
                  placeholder="Mobile Phone (e.g., 01234567890)"
                  className={styles.formInput}
                />
                <ErrorMessage
                  name="mobile_phone"
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

              <div className={styles.formGroup}>
                <Field
                  type="date"
                  name="birthdate"
                  placeholder="Birthdate"
                  className={styles.formInput}
                />
                <ErrorMessage
                  name="birthdate"
                  component="div"
                  className={styles.errorMessage}
                />
              </div>

              <div className={styles.formGroup}>
                <Field
                  type="text"
                  name="country"
                  placeholder="Country (optional)"
                  className={styles.formInput}
                />
                <ErrorMessage
                  name="country"
                  component="div"
                  className={styles.errorMessage}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? "Registering..." : "Continue with email"}
              </button>
            </Form>
          )}
        </Formik>

        <div className={styles.socialLogin}>
          <div className={styles.divider}>Other sign up options</div>
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

                    await authAPI.register(formData);
                    toast.success('Google registration successful! Please check your email to activate your account.');
                    navigate('/login');
                  } catch (error) {
                    console.error('Google registration error:', error);
                    toast.error(error.message || error.error || 'Google registration failed');
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
              onClick={() => {
                window.FB.login(response => {
                  if (response.authResponse) {
                    authAPI.facebookLogin({ access_token: response.authResponse.accessToken })
                      .then(() => {
                        toast.success('Facebook registration successful!');
                        navigate('/home');
                      })
                      .catch(error => {
                        toast.error(error.error || 'Facebook registration failed');
                      });
                  } else {
                    toast.error('Facebook registration cancelled');
                  }
                }, {scope: 'public_profile,email'});
              }}
              className={`${styles.socialButton} ${styles.facebookButton}`}
            >
              <FaFacebookF className={styles.facebookIcon} /> Sign in with Facebook
            </button>
          </div>
        </div>

        <p className={styles.authFooter}>
          Already have an account?{" "}
          <a href="/login" className={styles.authLink}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;