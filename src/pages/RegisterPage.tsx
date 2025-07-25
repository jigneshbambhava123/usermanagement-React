import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type {FormikHelpers} from "formik";
import { TextField } from '@mui/material';
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../api/authApi"; 
import { HeroImg } from "../assets/assets";

interface RegisterFormValues {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  dateofbirth: string;
  password: string;
  confirmPassword: string;
}

const RegisterSchema = Yup.object().shape({
  firstname: Yup.string()
    .min(2, "First name must be at least 2 characters long.")
    .max(50, "First name must be at most 50 characters long.")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "First name can only contain letters, numbers and underscore"
    )
    .required("First name is required"),
  lastname: Yup.string()
    .min(2, "Last name must be at least 2 characters long.")
    .max(50, "Last name must be at most 50 characters long.")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Last name can only contain letters, numbers and underscore"
    )
    .required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  dateofbirth: Yup.date().required("Date of birth is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
  termsAccepted: Yup.boolean().oneOf([true], "You must accept the terms"),
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const initialValues: RegisterFormValues = {
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    dateofbirth: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting, resetForm }: FormikHelpers<RegisterFormValues>
  ) => {
    try {
      const payload = {
        ...values,
        roleId: 2,
        isActive: true,
      };
      await registerUser(payload);
      toast.success("Registration successful");
      resetForm();
      navigate("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <div className="flex flex-wrap justify-center items-center h-screen">
    {/* Left Banner */}
    <div className="hidden lg:block w-1/2 h-full">
      <img
        src={HeroImg}
        alt="Banner"
        className="w-full h-full object-cover"
      />
    </div>

    {/* Right Form */}
    <div className="w-full md:w-full lg:w-1/2 flex justify-center items-center p-6">
      <div className="w-full max-w-xl p-6 border border-gray-200 rounded-md shadow-md hover:shadow-xl transition duration-200 bg-white overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="mb-6 text-center">
          <Link to="/Register" className="inline-flex items-center gap-2">
            <img src={HeroImg} alt="logo" className="w-15 h-15 me-2 mt-1 mb-3" />
            <h2 className="text-3xl font-bold text-[#00092a]">User Management</h2>
          </Link>
        </div>

        <div className="mb-4">
            <h3 className="text-xl font-bold">Create Account</h3>
            <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/" className="text-blue-600 hover:underline">
                Sign in
                </Link>
            </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Field
                    type="text"
                    name="firstname"
                    placeholder="First Name"
                    className={`w-full p-3 border ${
                      errors.firstname && touched.firstname
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
                  />
                  <ErrorMessage name="firstname" component="div" className="text-red-500 text-xs" />
                </div>
                <div>
                  <Field
                    type="text"
                    name="lastname"
                    placeholder="Last Name"
                    className={`w-full p-3 border ${
                      errors.lastname && touched.lastname
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
                  />
                  <ErrorMessage name="lastname" component="div" className="text-red-500 text-xs" />
                </div>
              </div>

              {/* Email */}
              <Field
                type="email"
                name="email"
                placeholder="Email"
                className={`w-full p-3 border ${
                  errors.email && touched.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
              />
              <ErrorMessage name="email" component="div" className="text-red-500 text-xs" />

              {/* Phone */}
              <Field
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                className={`w-full p-3 border ${
                  errors.phoneNumber && touched.phoneNumber
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
              />
              <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-xs" />

              {/* DOB */}
              <Field name="dateofbirth"> 
                {({ field, meta }: any) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Date of Birth"
                    fullWidth
                    InputLabelProps={{ shrink: true }} 
                    inputProps={{
                      max: new Date().toISOString().split("T")[0],
                    }}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                    sx={{mb:2}}
                  />
                )}
              </Field>

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
                    errors.password && touched.password ? "top-8/25" : "top-1/2"
                    } transform -translate-y-1/2 text-gray-500 hover:scale-110 transition-transform text-xl`} 
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
                <ErrorMessage name="password" component="div" className="text-red-500 text-xs" />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Field
                  type={showConfirmPassword ? "text" : "password"}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 ${
                    errors.confirmPassword && touched.confirmPassword ? "top-1/3" : "top-1/2"
                    } transform -translate-y-1/2 text-gray-500 hover:scale-110 transition-transform text-xl`} 
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-[18px] hover:bg-blue-700 transition duration-200 disabled:opacity-60"
              >
                {isSubmitting ? "Processing..." : "Create Account"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  </div>
);

};

export default RegisterPage;
