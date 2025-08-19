import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/userApi';
import type { CreateUserPayload, UpdateUserPayload } from '../../api/userApi';

export const fetchUsersThunk = createAsyncThunk(
  'users/fetch',
  async (params: { search?: string; pageNumber: number; pageSize: number; sortColumn: string; sortDirection: 'asc' | 'desc' }) => {
    const res = await getUsers(params);
    return res.data; 
  }
);

export const addUserThunk = createAsyncThunk(
  'users/add',
  async (payload: CreateUserPayload) => {
    await createUser(payload);
    return true;
  }
);

export const updateUserThunk = createAsyncThunk(
  'users/update',
  async (payload: UpdateUserPayload) => {
    await updateUser(payload);
    return true;
  }
);

export const deleteUserThunk = createAsyncThunk(
  'users/delete',
  async (id: number) => {
    await deleteUser(id);
    return id;
  }
);
