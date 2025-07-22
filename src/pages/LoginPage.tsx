import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type {FormikHelpers} from "formik";
import * as Yup from "yup";
import { loginUser } from "../api/authApi";
import { useNavigate, Link , useLocation} from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();

  const initialValues: ILoginRequest = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const handleLogin = async (
    values: ILoginRequest,
    { setSubmitting }: FormikHelpers<ILoginRequest>
  ) => {
    try {
      const response = await loginUser(values);
      const { token } = response.data;

      const storage = values.rememberMe ? localStorage : sessionStorage;
      storage.setItem("jwt_token", token);

      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  const handleForgotPassword = () => {
    navigate("/forgotpassword");
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
            <img src={HeroImg} alt="logo" className="w-15 h-15 me-2 mt-1 mb-3" />
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
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  </div>
);
};

export default LoginPage;
