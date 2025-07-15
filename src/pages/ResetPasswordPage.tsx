import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../api/authApi";
import { HeroImg, CandidateIcon } from "../assets/assets";

const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("New Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm your password"),
});

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId") || "";
  const token = searchParams.get("token") || "";

  const initialValues: FormValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await resetPassword({
        userId: Number(userId),
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      toast.success("Password reset successful! Please log in.");
      navigate("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-center items-center h-screen">
      {/* Left Banner */}
      <div className="hidden lg:block w-1/2 h-full">
        <img src={HeroImg} alt="Banner" className="w-full h-full object-cover" />
      </div>

      {/* Right Form */}
      <div className="w-full md:w-full lg:w-1/2 flex justify-center items-center p-6">
        <div className="w-full max-w-md p-6 border border-gray-200 rounded-md shadow-md hover:shadow-xl transition duration-200 bg-white">

          {/* Logo/Header */}
          <div className="mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={CandidateIcon} alt="logo" className="w-15 h-15" />
              <h2 className="text-3xl font-bold text-[#00092a]">User Management</h2>
            </Link>
          </div>

          {/* Title */}
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1">Reset Password</h3>
            <p className="text-gray-600">
              Enter your new password below to reset your account password.
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ touched, errors }) => (
              <Form className="space-y-4">
                {/* New Password */}
                <div className="relative">
                  <Field
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    placeholder="New Password"
                    className={`w-full p-3 border ${
                      errors.newPassword && touched.newPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className={`absolute right-3 ${
                      errors.newPassword && touched.newPassword ? "top-3/10" : "top-1/2"
                    } transform -translate-y-1/2 text-gray-500 hover:scale-110 transition-transform text-xl`}
                  >
                    {showPasswords.new ? "🙈" : "👁️"}
                  </button>
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Field
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className={`w-full p-3 border ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                    }
                    className={`absolute right-3 ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "top-1/3"
                        : "top-1/2"
                    } transform -translate-y-1/2 text-gray-500 hover:scale-110 transition-transform text-xl`}
                  >
                    {showPasswords.confirm ? "🙈" : "👁️"}
                  </button>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-[18px] hover:bg-blue-700 transition duration-200 disabled:opacity-60 flex justify-center items-center gap-2"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                {/* Back to Login */}
                <div className="text-center mt-4">
                  <Link to="/" className="text-blue-600 hover:underline">
                    Back to Login
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
