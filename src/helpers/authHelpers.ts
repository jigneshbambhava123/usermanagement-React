import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  exp: number;
  role: string;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const now = Date.now() / 1000; 
    return decoded.exp < now;
  } catch {
    return true;
  }
};

export const getValidToken = (): string | null => {
  const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token");
  if (!token) return null;
  if (isTokenExpired(token)) {
    localStorage.removeItem("jwt_token");
    sessionStorage.removeItem("jwt_token");
    return null;
  }
  return token;
};

export const getUserRoles = (): string[] => {
  const token = getValidToken();
  if (!token) return [];
  try {
     const decoded = jwtDecode<{ [key: string]: any }>(token);
    
    const roleClaimKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    const role = decoded[roleClaimKey];

    return role ? [role] : [];
  } catch {
    return [];
  }
};

export const getUserIdFromToken = (): number | null => {
  const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token");
  if (!token) return null;

   try {
    const decoded = jwtDecode<{ [key: string]: any }>(token);
    
    const nameIdKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
    const nameId = decoded[nameIdKey];

    return nameId ? parseInt(nameId) : null;
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

export const logout = (navigate: (path: string) => void) => {
  localStorage.removeItem('jwt_token');
  sessionStorage.removeItem('jwt_token');
  localStorage.removeItem('return_url');

  navigate("/");
};