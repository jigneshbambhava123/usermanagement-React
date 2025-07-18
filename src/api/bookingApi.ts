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

export const getActiveBookings = (params: {
  userId?: number;
  search?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
  timeFilter?: string;
}) =>
  api.get<{ data: Booking[]; totalCount: number }>('/booking/activebookings', {
    params,
  });


export const getBookingHistory = (params: {
  userId?: number;
  search?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
  timeFilter?: string;
}) =>
  api.get<{ data: Booking[]; totalCount: number }>('/booking/resourcehistory', {
    params,
  });

export const createBooking = (booking: CreateBookingPayload) => api.post('/booking', booking);
