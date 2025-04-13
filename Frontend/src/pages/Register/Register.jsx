import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { authAPI } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

const RegisterSchema = Yup.object().shape({
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
});

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2 className={styles.authTitle}>Create Account</h2>
        <Formik
          initialValues={{
            first_name: "",
            last_name: "",
            email: "",
            mobile_phone: "",
            password: "",
            confirm_password: "",
            profile_picture: null, // حقل الصورة
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const formData = new FormData();
              formData.append("first_name", values.first_name);
              formData.append("last_name", values.last_name);
              formData.append("email", values.email);
              formData.append("mobile_phone", values.mobile_phone);
              formData.append("password", values.password);
              formData.append("confirm_password", values.confirm_password); // أضف confirm_password
              if (values.profile_picture) {
                formData.append("profile_picture", values.profile_picture);
              }
          
              await authAPI.register(formData);
              toast.success(
                "Registration successful! Please check your email to activate your account."
              );
              navigate("/login");
            } catch (error) {
              console.error(error); // طباعة الخطأ في وحدة التحكم
              toast.error(error.response?.data?.detail || "Registration failed");
            } finally {
              setSubmitting(false);
            }
          }}
          encType="multipart/form-data"
        >
          {({ setFieldValue, isSubmitting }) => (
            <Form>
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
                <label htmlFor="profile_picture" className={styles.imageLabel}>
                  Please select a profile picture:
                </label>
                <input
                  type="file"
                  id="profile_picture"
                  name="profile_picture"
                  placeholder="Please select a profile picture:"
                  accept="image/*"
                  onChange={(event) => {
                    setFieldValue(
                      "profile_picture",
                      event.currentTarget.files[0]
                    );
                  }}
                  className={styles.imageInput}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </Form>
          )}
        </Formik>

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
