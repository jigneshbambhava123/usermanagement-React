import api from './axiosInstance';

export interface DashboardStats {
  activeUsersCount: number;
}

export interface DailyResourceUsage {
  bookingDate: string;
  totalActiveQuantity: number;
  totalUsedQuantity: number;
}

export const getActiveUsersCount = async (): Promise<DashboardStats> => {
  const response = await api.get('/Dashboard/ActiveUsersCount');
  return response.data;
};

export const getDailyResourceUsage = async (userId: number, days: number): Promise<DailyResourceUsage[]> => {
  const response = await api.get(`/Dashboard/DailyResourceUsage?userId=${userId}&days=${days}`);
  return response.data;
};