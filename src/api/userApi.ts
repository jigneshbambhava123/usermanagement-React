import api from './axiosInstance';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  roleId: number;
  phoneNumber: number;
  isActive: boolean;
  dateofbirth: string;
}

export type UpdateUserPayload = Omit<User, 'password' | 'dateofbirth'>;

export type CreateUserPayload = Omit<User, 'id' | 'isActive'>;

export const getUsers = (params: {
  search?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
}) => api.get<{ data: User[]; totalCount: number }>('/User', { params });
export const getUser = (id: number) => api.get<User>(`/User/${id}`);
export const createUser = (user: CreateUserPayload) => api.post('/User', user);
export const updateUser = (user: UpdateUserPayload) => api.put('/User', user);
export const deleteUser = (id: number) => api.delete(`/User?id=${id}`);
export const updateUserLanguage = (userId: number, language: string) =>
  api.put(`/User/ChangeLanguage`, null, {
    params: { userId, language },
});
export const getUserLanguage = (id: number) =>
  api.get<{ language: string }>(`/User/GetLanguage/${id}`);