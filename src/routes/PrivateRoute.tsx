import type { ReactNode } from "react";
import { Navigate, useLocation  } from "react-router-dom";
import { getValidToken, getUserRoles } from "../helpers/authHelpers";

interface PrivateRouteProps {
  children: ReactNode;
  requiredRoles?: string[]; 
}

const PrivateRoute = ({ children, requiredRoles }: PrivateRouteProps) => {
  const token = getValidToken();
  const userRoles = getUserRoles(); 
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRoles && !requiredRoles.some(role => userRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};  

export default PrivateRoute;
