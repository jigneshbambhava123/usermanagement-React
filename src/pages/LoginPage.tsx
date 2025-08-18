import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type {FormikHelpers} from "formik";
import * as Yup from "yup";
import { loginUser } from "../api/authApi";
import { useNavigate, Link , useLocation} from "react-router-dom";
import { toast } from "react-toastify";
import { HeroImg } from "../assets/assets";
import useLanguage from "../hooks/useLanguage";
import LanguageIcon from '@mui/icons-material/Language';
import { getUserIdFromToken } from "../helpers/authHelpers";
import { getUserLanguage } from "../api/userApi";
import { Typography } from "@mui/material";

interface ILoginRequest {
  email: string;
  password: string;
  rememberMe: boolean; 
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {t, currentLanguage, changeLanguage, setCurrentLanguage } = useLanguage();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email(t('invalidEmail')).required(t('emailRequired')),
    password: Yup.string()
      .required(t('passwordRequired')),
      rememberMe: Yup.boolean(),
  });

  const initialValues: ILoginRequest = {
    email: "",
    password: "",   
    rememberMe: false,
  };

  const showLanguageToastr = (lang: string) => {
    const language: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      bn: "Bengali",
      de: "German",
    };

    const languageName = language[lang] || "English";

    toast.success(t("languageApplied", { languageName }));
  };

  const handleLogin = async (
    values: ILoginRequest,
    { setSubmitting }: FormikHelpers<ILoginRequest>
  ) => {
    try {
      const response = await loginUser(values);

      if(response.data?.message === "OTP sent to email."){
          navigate("/verify-otp", {
            state: { email: values.email, rememberMe: values.rememberMe ,from: location.state?.from || { pathname: "/dashboard" }},
          });
          return;
      }
      const { token } = response.data;

      const storage = values.rememberMe ? localStorage : sessionStorage;
      storage.setItem("jwt_token", token);

      const loggedInUserId = getUserIdFromToken();
      if (loggedInUserId) {
        getUserLanguage(loggedInUserId)
          .then(res => {
            const lang = res.data.language || 'en'; 
            changeLanguage(lang);
            setCurrentLanguage(lang); 
            toast.success(t("loginSuccess"));
            showLanguageToastr(lang);
          })
          .catch(err => console.error('Error fetching user language:', err));
      }

      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
      
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || t("loginFailed");
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
            <Typography 
              variant="h2"
              sx={{
                fontWeight: 'bold',
                color: '#00092a', 
                fontSize: { xs: '23px', sm: '28px', md: '30px' },
              }}
            >
              {t('userManagement')}
            </Typography>          
          </Link>
        </div>

          <div className="flex justify-end">
            <div className="mb-2 flex items-center rounded-lg bg-gray-100 p-1 shadow-lg">
              <LanguageIcon className="text-blue-500" />
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent border-none text-gray-700 font-medium p-2 focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="bn">Bengali</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-bold">{t("signIn")}</h3>
            <p className="text-gray-600">
              {t("dontHaveAccount")}{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                {t("signUp")}
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
                  {t("rememberMe")}
                </label>

                {/* Forgot Password */}
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 hover:underline"
                >
                  {t("forgotPassword")}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full  bg-blue-600 text-white py-3 rounded-lg font-semibold text-[18px] hover:bg-blue-700 transition duration-200 disabled:opacity-60"
              >
                {t("signIn")}
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
