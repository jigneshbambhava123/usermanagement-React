import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type {FormikHelpers} from "formik";
import * as Yup from "yup";
import { loginUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { CandidateIcon } from "../assets/assets"; 
import { toast } from "react-toastify";
import { HeroImg } from "../assets/assets";

interface ILoginRequest {
  email: string;
  password: string;
  rememberMe: boolean; 
}

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required"),
    rememberMe: Yup.boolean(),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const initialValues: ILoginRequest = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const handleLogin = async (
    values: ILoginRequest,
    { setSubmitting, resetForm }: FormikHelpers<ILoginRequest>
  ) => {
    setServerError(null);
    try {
      const response = await loginUser(values);
      const { token } = response.data;

      localStorage.setItem("jwt_token", token);
      localStorage.setItem("login_success", "true");
      navigate("/users");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please check your credentials.";
      setServerError(errorMessage);

      // 🔥 Show toast on error
      toast.error(errorMessage);

    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
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

        <div className="mb-4">
          <h3 className="text-xl font-bold">Sign In</h3>
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div> 

        {/* Formik Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              {/* Email */}
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Username"
                  className={`w-full p-3 border ${
                    errors.email && touched.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Password */}
              <div className="relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`w-full p-3 border ${
                    errors.password && touched.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 ${
                    errors.password && touched.password ? "top-1/3" : "top-1/2"
                    } transform -translate-y-1/2 text-gray-500 hover:scale-110 transition-transform text-xl`} 
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
                <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex justify-between items-center text-sm">
                {/* Remember Me Checkbox */}
                <label className="flex items-center text-gray-700">
                  <Field
                    type="checkbox"
                    name="rememberMe"
                    className="h-4 w-4 accent-blue-600 rounded mr-2 "
                  />
                  Remember Me
                </label>

                {/* Forgot Password */}
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full  bg-blue-600 text-white py-3 rounded-lg font-semibold text-[18px] hover:bg-blue-700 transition duration-200 disabled:opacity-60"
              >
                Sign in
                <i className="bi bi-chevron-right ms-2 text-[18px]"></i>
              </button>
            </Form>
          )}
        </Formik>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-4 text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* OAuth Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            // onClick={() => handleOAuthLogin("google")}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-lg text-[#212529] hover:bg-gray-100 hover:shadow-md transition duration-200"
          >
            <span className="flex items-center gap-2 text-[18px]">
              {/* <GoogleIcon /> */}Google 
            </span>
          </button>
          <button
            type="button"
            // onClick={() => handleOAuthLogin("microsoft")}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-lg text-[#323a42] hover:bg-gray-100 hover:shadow-md transition duration-200"
          >
            <span className="flex items-center gap-2 text-[18px]">
              {/* <MicrosoftIcon />*/} Microsoft 
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

};

export default LoginPage;
