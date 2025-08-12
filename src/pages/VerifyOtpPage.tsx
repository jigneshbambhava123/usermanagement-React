import { useEffect, useState } from "react";
import { useNavigate,useLocation,Link } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyOtp } from "../api/authApi";
import { HeroImg } from "../assets/assets";
import { MuiOtpInput } from 'mui-one-time-password-input';

const VerifyOtpPage = () => {
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
        toast.error("Session expired or invalid access. Please sign in again to proceed.");
      navigate("/", { replace: true });
    }
  }, [email, navigate]);

  if (!email) return null;
 
  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await verifyOtp({ email, otp, rememberMe });

      const { token } = response.data;
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("jwt_token", token);

      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
      toast.success("Login successful");
 
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "OTP verification failed";
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
                <h2 className="text-3xl font-bold text-[#00092a]">User Management</h2>
            </div>
            </div>

            <div className="mb-5">
                <h3 className="text-xl font-bold flex  items-center  mt-1 mb-3">              
                    {/* <img src={EmailIcon} alt="logo" className="w-10 h-10 me-3" /> */}
                    Email Verification
                </h3>
                <p className="text-gray-600">
                    Please enter the 6-digit one-time password (OTP) we sent to your registered email address: <span className="font-medium">{email}</span>
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
            Verify & Continue
            </button>
            <div className="text-center mt-4">
                <Link to="/" className="text-blue-600 hover:underline">
                Back to Login
                </Link>
            </div>
        </div>
        </div>
    </div>
  );
};
 
export default VerifyOtpPage;