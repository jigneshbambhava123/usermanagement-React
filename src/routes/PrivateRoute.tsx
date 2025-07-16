import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getValidToken, getUserRoles } from "../helpers/authHelpers";

interface PrivateRouteProps {
  children: ReactNode;
  requiredRoles?: string[]; 
}

const PrivateRoute = ({ children, requiredRoles }: PrivateRouteProps) => {
  const token = getValidToken();
  const userRoles = getUserRoles(); 

  if (!token) {
    return <Navigate to="/" />;
  }

  if (requiredRoles && !requiredRoles.some(role => userRoles.includes(role))) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
