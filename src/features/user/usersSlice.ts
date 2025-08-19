import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import { fetchUsersThunk, addUserThunk, updateUserThunk, deleteUserThunk } from './usersThunks';
import type { User } from '../../api/userApi';

interface UsersState {
  user: User[];
  totalUsers: number;
  loading: boolean;
  error: string | null;
  page: number;
  rowsPerPage: number;
  search: string;
  sortColumn: 'firstname' | 'lastname' | 'roleid';
  sortDirection: 'asc' | 'desc';
  formOpen: boolean;
  editingUser: User | null;
}

const initialState: UsersState = {
  user: [],
  totalUsers: 0,
  loading: false,
  error: null,
  page: 0,
  rowsPerPage: 5,
  search: '',
  sortColumn: 'firstname',
  sortDirection: 'asc',
  formOpen: false,
  editingUser: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setRowsPerPage(state, action: PayloadAction<number>) {
      state.rowsPerPage = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setSort(state, action: PayloadAction<{ column: UsersState['sortColumn']; direction: 'asc' | 'desc' }>) {
      state.sortColumn = action.payload.column;
      state.sortDirection = action.payload.direction;
    },
    openForm: (state, action: PayloadAction<User | null>) => {
      state.formOpen = true;
      state.editingUser = action.payload;
    },
    closeForm: (state) => {
      state.formOpen = false;
      state.editingUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.totalUsers = action.payload.totalCount;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(addUserThunk.fulfilled, (state) => {
        state.page = 0; 
      })
      .addCase(updateUserThunk.fulfilled, () => {})
      .addCase(deleteUserThunk.fulfilled, (state) => {
        state.page = 0;
      });
  },
});

export const { setPage, setRowsPerPage, setSearch, setSort, openForm, closeForm } = usersSlice.actions;
export default usersSlice.reducer;
