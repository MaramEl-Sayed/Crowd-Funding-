import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F2EFE7] p-4">
      <div className="w-full max-w-md rounded-lg shadow-lg bg-white p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#006A71] mb-6 text-center">Reset Password</h2>
        <p className="text-center text-[#1e1e1e] mb-6 text-sm sm:text-base">
          Enter your email address to receive a password reset link.
        </p>

        {/* Forgot Password Form */}
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#006A71] hover:bg-[#04828c] text-[#ffffff] font-semibold py-2 sm:py-3 rounded-lg transition duration-300 text-sm sm:text-base"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-[#1e1e1e] mt-6 text-sm sm:text-base">
          Remember your password?{' '}
          <a href="/login" className="text-[#006A71] hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;