import api from './axiosInstance';

export interface Booking {
  id: number;
  resourceId: number;
  userId: number;
  resourceName: string; 
  quantity: number;
  fromDate: string;
  toDate: string;
}

export interface CreateBookingPayload {
  resourceId: number;
  userId: number;
  quantity: number;
  fromDate: string; 
  toDate: string;
}

export const getActiveBookings = async (userId: number) => {
  const res = await api.get(`/booking/activebookings?id=${userId}`);
  return res.data;
};


export const getBookingHistory = async (userId: number) => {
  const res = await api.get(`/booking/resourcehistory?id=${userId}`);
  return res.data;
};

export const createBooking = (booking: CreateBookingPayload) => api.post('/booking', booking);
