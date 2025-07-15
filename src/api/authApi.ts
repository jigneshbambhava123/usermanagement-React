import api from './axiosInstance';

export interface AuthResponse {
  token: string;
}

export interface RegisterUser {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateofbirth: string;
  roleId: number;
  isActive: boolean;
}

interface ResetPasswordPayload {
  userId: number;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const loginUser = (credentials: { email: string; password: string }) =>
  api.post<AuthResponse>('/Account/Login', credentials);

export const registerUser = (payload: RegisterUser) => {
  return api.post("/Account/Register", payload);
};

export const sendResetLink = (credentials: { email: string; baseUrl: string }) => {
  return api.post(`/Account/ForgotPassword?email=${encodeURIComponent(credentials.email)}&baseUrl=${encodeURIComponent(credentials.baseUrl)}`);
};

export const resetPassword = (payload: ResetPasswordPayload) => {
  return api.post("/Account/ResetPassword", payload);
};