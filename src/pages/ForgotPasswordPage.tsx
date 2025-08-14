import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { sendResetLink } from "../api/authApi";
import { HeroImg } from "../assets/assets";
import useLanguage from "../hooks/useLanguage";
 
const ForgotPasswordPage = () => {
  const {t} = useLanguage();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    email: Yup.string().email(t("invalidEmail")).required(t("emailRequired")),
  });

  const handleSubmit = async (values: { email: string }) => {
    
    setLoading(true);
    try {
      const response = await sendResetLink({ email: values.email , baseUrl :'http://localhost:5173'});
 
      toast.success(response.data.message || t("resetLinkSuccess"));
      navigate("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("resetLinkFailure")
      );
    } finally {
      setLoading(false);
    }
  };
 
   return (
    <div className="flex flex-wrap justify-center items-center h-screen">
      {/* Left Banner*/}
      <div className="hidden lg:block w-1/2 h-full">
        <img src={HeroImg} alt="Banner" className="w-full h-full object-cover" />
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6">
        <div className="w-full max-w-md p-6 border border-gray-200 rounded-md shadow-md hover:shadow-xl transition duration-200 bg-white">
          
          {/* Logo/Header */}
          <div className="mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={HeroImg} alt="logo" className="w-15 h-15 me-2 mt-1 mb-3" />
              <h2 className="text-3xl font-bold text-[#00092a]">{t('userManagement')}</h2>
            </Link>
          </div>

          {/* Header & Description */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">{t("forgotPasswordTitle")}</h3>
            <p className="text-gray-600">
              {t("forgotPasswordDescription")}
            </p>
          </div>

          {/* Formik Form */}
          <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ touched, errors }) => (
              <Form className="space-y-4">
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder={t("emailAddress")}
                    className={`w-full p-3 border ${
                      errors.email && touched.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-[18px] hover:bg-blue-700 transition duration-200 disabled:opacity-60 flex justify-center items-center gap-2"
                >
                  {loading ? t("sending") : t("sendResetLink")}
                </button>

                <div className="text-center mt-4">
                  <Link to="/" className="text-blue-600 hover:underline">
                    {t("backToLogin")}
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
 
export default ForgotPasswordPage;