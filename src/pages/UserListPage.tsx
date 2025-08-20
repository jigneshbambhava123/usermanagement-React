import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, IconButton, Typography, Box, TableSortLabel, Button,
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getUserRoles } from '../helpers/authHelpers';
import { toast } from "react-toastify";
import { debounce } from 'lodash';
import UserFormDialog from '../components/UserFormDialog'; 
import Loader from '../components/Loader';
import { getUserIdFromToken } from '../helpers/authHelpers';
import BulkUserInsertionDialog from '../components/BulkUserInsertionDialog';
import EnabledMfaDialog from '../components/EnableMfaDialog';
import useLanguage from '../hooks/useLanguage';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { fetchUsersThunk, deleteUserThunk } from '../features/user/usersThunks';
import { setPage, setRowsPerPage, setSearch, setSort, openForm, openBulkUpload, openMfaDialog } from '../features/user/usersSlice';

// type AddUserFormData = Omit<User, 'id' | 'isActive'>;
// type UpdateUserFormData = Omit<User, 'password' | 'dateofbirth'>;
  
const getRoleName = (roleId: number) => {
  switch (roleId) {
    case 1: return "Admin";
    case 2: return "User";
    default: return "Unknown";
  }
};

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, onClose, onConfirm, title, message }) => {
  const {t} = useLanguage();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        id="confirm-dialog-title"
        className="text-xl font-bold text-center text-white"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #2575ee 100%)'
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ pt: 5 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography
            id="confirm-dialog-description"
            sx={{ pt:5,pb: 5, fontSize: '1rem', color: '#333', textAlign: 'center' }}
          >
            {message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={onClose} color="primary" variant="outlined">
          {t('cancel')}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          {t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserListPage: React.FC = () => {
  const { t , currentLanguage} = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const {
    user: users,
    totalUsers,
    loading,
    page,
    rowsPerPage,
    sortColumn,
    sortDirection,
    search
  } = useSelector((state: RootState) => state.users);
  // const [users, setUsers] = useState<User[]>([]);
  // const [totalUsers, setTotalUsers] = useState(0);
  // const [page, setPage] = useState(0);
  // const [rowsPerPage, setRowsPerPage] = useState(5);
  // const [loading, setLoading] = useState(true);
  // const [searchQuery, setSearchQuery] = useState('');
  // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  type SortColumn = 'firstname' | 'lastname' | 'roleid';
  // const [sortColumn, setSortColumn] = useState<SortColumn>('firstname');

  // const [isFormOpen, setIsFormOpen] = useState(false);
  // const [currentUser, setCurrentUser] = useState<User | null>(null); 

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);

  const roles = getUserRoles();
  const isAdmin = roles.includes("Admin");
  const loggedInUserId = getUserIdFromToken();

  const [searching, setSearching] = useState(false);

  // const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // const fetchUsers = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const [res] = await Promise.all([
  //       getUsers({
  //         search: search,
  //         pageNumber: page + 1,
  //         pageSize: rowsPerPage,
  //         sortColumn,
  //         sortDirection,
  //       }),
  //       delay(800) 
  //     ]);
      
  //     const { data, totalCount } = res.data;
  //     setUsers(data);
  //     setTotalUsers(totalCount);

  //   } catch (error) {
  //     toast.error(t('fetchUsersError'));
  //     setUsers([]);
  //     setTotalUsers(0);
  //     await delay(500);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [page, rowsPerPage, search, sortColumn, sortDirection]);


  // useEffect(() => {
  //   const success = localStorage.getItem("login_success");
  //   if (success) {
  //     toast.success(t('loginSuccess'));
  //     localStorage.removeItem("login_success");
  //   }
  //   const debouncedFetch = debounce(() => {
  //     fetchUsers();
  //   }, 300);

  //   debouncedFetch();

  //   return () => {
  //     debouncedFetch.cancel();
  //   };
  // }, [page, rowsPerPage, search, sortColumn, sortDirection, fetchUsers]);

  // useEffect(() => {
  //   dispatch(fetchUsersThunk({
  //     search,
  //     pageNumber: page + 1,
  //     pageSize: rowsPerPage,
  //     sortColumn,
  //     sortDirection
  //   }));
  // }, [dispatch, page, rowsPerPage, search, sortColumn, sortDirection]);

  const debouncedFetch = useMemo(
    () =>
      debounce((params) => {
        dispatch(fetchUsersThunk(params)).finally(() => setSearching(false));
      }, 1000),
    [dispatch]
  );

  useEffect(() => {
    setSearching(true);
    debouncedFetch({
      search,
      pageNumber: page + 1,
      pageSize: rowsPerPage,
      sortColumn,
      sortDirection,
    });
  }, [search, page, rowsPerPage, sortColumn, sortDirection]);

  const handleSortClick = (column: SortColumn) => {
    if (sortColumn === column) {
      dispatch(setSort({ column, direction: sortDirection === 'asc' ? 'desc' : 'asc' }));
    } else {
      dispatch(setSort({ column, direction: 'asc' }));
    }
    dispatch(setPage(0));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPage(0));
    dispatch(setSearch(e.target.value));
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDeleteId(userId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDeleteId !== null) {
      try {
        await dispatch(deleteUserThunk(userToDeleteId)).unwrap();
        toast.success(t('deleteUserSuccess'));
        dispatch(setPage(0));
        dispatch(fetchUsersThunk({
          search,
          pageNumber: page + 1,
          pageSize: rowsPerPage,
          sortColumn,
          sortDirection,
        }));
      } catch (error) {
        toast.error(t('deleteUserError'));
      } finally {
        setIsConfirmDialogOpen(false); 
        setUserToDeleteId(null); 
      }
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setRowsPerPage(parseInt(event.target.value, 10)));
    dispatch(setPage(0));
  };

  return (
    <Box sx={{ width: '100%',p: 4}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column',sm: 'column', md: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start',sm: 'flex-start', md: 'flex-start', lg: 'center' },
            pb:4,
            gap: 2
          }}
        >
          <Typography
            variant="h4"
            color="primary"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '24px', sm: '28px',md: '32px' },
              letterSpacing: '-0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {t('title')}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'column',md: 'row' },
              alignItems: { sm: 'center' },
              gap: 2,
              width: { xs: '100%', sm: '100%',md: 'auto' }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { sm: 'center' },
                gap: 2,
                width: { xs: '100%', sm: '100%',md: 'auto' }
              }}
            >
              <Box
                component="input"
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={handleSearchChange}
                sx={{
                  p: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  minWidth: '190px',
                  width: {
                    xs: '100%',
                    sm: 'auto',
                  },
                }}
              />

              {isAdmin && (
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => dispatch(openMfaDialog())}
                    sx={{ height: '42px', width: { xs: '100%', sm: 'auto' },whiteSpace: 'nowrap', overflow: 'hidden',minWidth:'190px'}}
                  >
                  {t('manageMfa')}
                </Button>
              )}
              <EnabledMfaDialog />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { sm: 'center' },
                gap: 2,
                width: { xs: '100%', sm: '100%',md: 'auto' }
              }}
            >
                {isAdmin && (
                  
                  <Button
                    color="primary"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => dispatch(openForm(null))}
                    sx={{ height: '42px', width: { xs: '100%', sm: 'auto' },whiteSpace: 'nowrap', overflow: 'hidden',minWidth:'199px'}}
                  >
                    {t('addUser')}
                  </Button>
                  
                )}

                <Button  color="primary" variant="contained" startIcon={<AddIcon />} onClick={() => dispatch(openBulkUpload())} style={{ height: '42px',
                  minWidth:  currentLanguage === 'bn'? '230px' : currentLanguage === 'de'? '225px': currentLanguage === 'hi'? '181px' : '180px'
                }}>
                  {t('bulkAddUser')}
                </Button>
                <BulkUserInsertionDialog/>
            </Box>
          </Box>
        </Box>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader aria-label="user table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 120 }} sortDirection={sortColumn === 'firstname' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'firstname'}
                      direction={sortColumn === 'firstname' ? sortDirection : 'asc'}
                      onClick={() => handleSortClick('firstname')}
                    >
                      {t('firstName')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 120 }} sortDirection={sortColumn === 'lastname' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'lastname'}
                      direction={sortColumn === 'lastname' ? sortDirection : 'asc'}
                      onClick={() => handleSortClick('lastname')}
                    >
                      {t('lastName')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('email')}</TableCell>
                  <TableCell sortDirection={sortColumn === 'roleid' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'roleid'}
                      direction={sortColumn === 'roleid' ? sortDirection : 'asc'}
                      onClick={() => handleSortClick('roleid')}
                    >
                      {t('role')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('phone')}</TableCell>
                  <TableCell>{t('age')}</TableCell>
                  {isAdmin && <TableCell>{t('actions')}</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {users?.length > 0 ? (
                  users.map((user) => (
                    <TableRow hover key={user.id}>
                      <TableCell>{user.firstname}</TableCell>
                      <TableCell>{user.lastname}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleName(user.roleId)}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>{calculateAge(user.dateofbirth)}</TableCell>
                      {isAdmin && (
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 120 }}>
                          <IconButton onClick={() => dispatch(openForm(user))} color="primary">
                            <EditIcon />
                          </IconButton>
                          {user.id !== loggedInUserId && (
                            <IconButton onClick={() => handleDeleteClick(user.id)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  !loading && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                        {t('noUsersFound')}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

      <UserFormDialog/>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMessage')}
      />

      <Loader open={searching || loading} />
    </Box>
  );
};

export default UserListPage;