import React, { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useMatch } from 'react-router-dom';
import UserListPage from './pages/UserListPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from './components/Navbar';
import PrivateRoute from './routes/PrivateRoute';
import { getValidToken, logout, isTokenExpired } from "./helpers/authHelpers";
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ResourceListPage from './pages/ResourceListPage';
import MyResourcePage from './pages/MyResourcePage';
import DashboardPage from './pages/DashboardPage';

const AppRoutes = () => {
  const location = useLocation();

   const hideNavbarRoutes = useMemo(() => [
    '/', 
    '/register', 
    '/forgotpassword', 
    '/account/resetpassword', 
    '/unauthorized'
  ], []);

  const is404 = useMatch("*") && ![
    '/', '/register', '/forgotpassword', '/account/resetpassword',
    '/unauthorized', '/users','/resource','/myresource','/dashboard'
  ].includes(location.pathname.toLowerCase());

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname.toLowerCase()) || is404;

  useEffect(() => {
    const token = getValidToken();
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, []);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/Account/ResetPassword" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiredRoles={["Admin", "User"]}>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute requiredRoles={["Admin", "User"]}>
              <UserListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/resource"
          element={
            <PrivateRoute requiredRoles={["Admin"]}>
              <ResourceListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/myresource"
          element={
            <PrivateRoute requiredRoles={["Admin", "User"]}>
              <MyResourcePage />
            </PrivateRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
