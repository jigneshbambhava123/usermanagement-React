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

export const loginUser = (credentials: { email: string; password: string }) =>
  api.post<AuthResponse>('/Account/Login', credentials);

export const registerUser = (payload: RegisterUser) => {
  return api.post("/Account/Register", payload);
};

