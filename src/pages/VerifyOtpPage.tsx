import { useEffect, useState } from "react";
import { useNavigate,useLocation,Link } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyOtp } from "../api/authApi";
import { HeroImg } from "../assets/assets";
import { MuiOtpInput } from 'mui-one-time-password-input';
import { getUserIdFromToken } from "../helpers/authHelpers";
import { getUserLanguage } from "../api/userApi";
import useLanguage from "../hooks/useLanguage";
import { Typography } from "@mui/material";

const VerifyOtpPage = () => {
  const {t,changeLanguage, setCurrentLanguage } = useLanguage();
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { email, rememberMe } = location.state || {};

  const handleChange = (newValue: string) => {
        setOtp(newValue);
  };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    const isAllowed =
      /^[0-9]$/.test(key) ||
      key === "Backspace" ||
      key === "ArrowLeft" ||
      key === "Enter"||
      key === "ArrowRight" ||
      key === "Tab";

    if (!isAllowed) {
      e.preventDefault(); 
    }
  };

  useEffect(() => {
    if (!email) {
        toast.error(t("sessionExpired"));
      navigate("/", { replace: true });
    }
  }, [email, navigate]);

  if (!email) return null;

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
 
  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error(t("otpLengthError"));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await verifyOtp({ email, otp, rememberMe });

      const { token } = response.data;
      const storage = rememberMe ? localStorage : sessionStorage;
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
 
    } catch (error: any) {
      const message =
        t("otpVerificationFailed") ||
        error?.response?.data?.message ||
        error?.message;
      toast.error(message);
    }finally {
        setIsSubmitting(false); 
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
            <div className="inline-flex items-center gap-2">
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
            </div>
            </div>

            <div className="mb-5">
                <h3 className="text-xl font-bold flex  items-center  mt-1 mb-3">              
                    {/* <img src={EmailIcon} alt="logo" className="w-10 h-10 me-3" /> */}
                    {t("emailVerificationTitle")}
                </h3>
                <p className="text-gray-600">
                    {t("emailVerificationDescription")} <span className="font-medium">{email}</span>
                </p>

            </div> 

            <MuiOtpInput
                value={otp}
                onChange={handleChange}
                length={6}
                TextFieldsProps={{
                    onKeyDown: handleKeyDown,
                    sx: {
                      '& input': {
                        padding: '16.5px 4px',
                      },
                    },
                }}
            />

            <button
                onClick={handleVerify}
                disabled={isSubmitting}
                className="w-full  bg-blue-600 text-white mt-5 py-3 rounded-lg font-semibold text-[18px] hover:bg-blue-700 transition duration-200 disabled:opacity-60"
            >
            {t("verifyButton")}
            </button>
            <div className="text-center mt-4">
                <Link to="/" className="text-blue-600 hover:underline">
                {t('backToLogin')}
                </Link>
            </div>
        </div>
        </div>
    </div>
  );
};
 
export default VerifyOtpPage;