import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

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
    <div className="flex items-center justify-center min-h-screen bg-[#eff6ff] p-4">
      <div className="w-full max-w-md rounded-lg shadow-lg bg-white p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#006A71] mb-6 text-center">Set New Password</h2>

        {/* Reset Password Form */}
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
            <Form className="space-y-4">
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                <Field
                  type="password"
                  name="new_password"
                  placeholder="New Password"
                  className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                />
                <ErrorMessage name="new_password" component="div" className="text-red-500 text-xs sm:text-sm mt-1" />
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#006A71] hover:bg-[#04828c] text-[#ffffff] font-semibold py-2 sm:py-3 rounded-lg transition duration-300 text-sm sm:text-base"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-[#1e1e1e] mt-6 text-sm sm:text-base">
          Return to{' '}
          <a href="/login" className="text-[#006A71] hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;