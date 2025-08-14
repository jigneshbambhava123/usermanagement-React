import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, IconButton, Typography, Box, TableSortLabel, Button,
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getUsers, createUser, updateUser, deleteUser } from '../api/userApi';
import type { User } from '../api/userApi';
import { getUserRoles } from '../helpers/authHelpers';
import { toast } from "react-toastify";
import { debounce } from 'lodash';
import UserFormDialog from '../components/UserFormDialog'; 
import Loader from '../components/Loader';
import { getUserIdFromToken } from '../helpers/authHelpers';
import BulkUserInsertionDialog from '../components/BulkUserInsertionDialog';
import EnabledMfaDialog from '../components/EnableMfaDialog';
import useLanguage from '../hooks/useLanguage';

type AddUserFormData = Omit<User, 'id' | 'isActive'>;
type UpdateUserFormData = Omit<User, 'password' | 'dateofbirth'>;

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
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserListPage: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  type SortColumn = 'firstname' | 'lastname' | 'roleid';
  const [sortColumn, setSortColumn] = useState<SortColumn>('firstname');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // For editing

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [openMfaDialog, setOpenMfaDialog] = useState(false);

  const roles = getUserRoles();
  const isAdmin = roles.includes("Admin");
  const loggedInUserId = getUserIdFromToken();

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [res] = await Promise.all([
        getUsers({
          search: searchQuery,
          pageNumber: page + 1,
          pageSize: rowsPerPage,
          sortColumn,
          sortDirection,
        }),
        delay(800) 
      ]);
      
      const { data, totalCount } = res.data;
      setUsers(data);
      setTotalUsers(totalCount);

    } catch (error) {
      toast.error(t('fetchUsersError'));
      setUsers([]);
      setTotalUsers(0);
      await delay(500);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, sortColumn, sortDirection]);


  useEffect(() => {
    const success = localStorage.getItem("login_success");
    if (success) {
      toast.success(t('loginSuccess'));
      localStorage.removeItem("login_success");
    }
    const debouncedFetch = debounce(() => {
      fetchUsers();
    }, 300);

    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [page, rowsPerPage, searchQuery, sortColumn, sortDirection, fetchUsers]);

  const handleSortClick = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setSearchQuery(e.target.value);
  };

  const handleAddUser = () => {
    setCurrentUser(null); 
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDeleteId(userId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDeleteId !== null) {
      try {
        await deleteUser(userToDeleteId);
        toast.success(t('deleteUserSuccess'));
        setPage(0);
        fetchUsers(); 
      } catch (error) {
        toast.error(t('deleteUserError'));
      } finally {
        setIsConfirmDialogOpen(false); 
        setUserToDeleteId(null); 
      }
    }
  };

  const handleFormSubmit = async (userData: AddUserFormData | UpdateUserFormData) => {
    try {
      if ('id' in userData) {
        await updateUser(userData as UpdateUserFormData);
        toast.success(t('userUpdated'));
      } else {
        await createUser(userData as AddUserFormData);
        toast.success(t('userAdded'));
      }
      setIsFormOpen(false); 
      fetchUsers();
    } catch (error) {
      toast.error(t('checkUserDetails'));
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%',p: 4}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column',sm: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start',sm: 'flex-start', md: 'center' },
            pb:4,
            gap: 2
          }}
        >
          <Typography
            variant="h4"
            color="primary"
            sx={{
              fontWeight: 700,
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
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              gap: 2,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '100%',
              }}
            />

            {isAdmin && (
              <Button
                  color="primary"
                  variant="contained"
                   onClick={() => setOpenMfaDialog(true)}
                  sx={{ height: '42px', width: { xs: '100%', sm: 'auto' },whiteSpace: 'nowrap', overflow: 'hidden',minWidth:'180px'}}
                >
                {t('manageMfa')}
              </Button>
            )}
            <EnabledMfaDialog open={openMfaDialog} onClose={() => setOpenMfaDialog(false)} />

            {isAdmin && (
              
              <Button
                color="primary"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddUser}
                sx={{ height: '42px', width: { xs: '100%', sm: 'auto' },whiteSpace: 'nowrap', overflow: 'hidden',minWidth:'180px'}}
              >
                 {t('addUser')}
              </Button>
              
            )}

            <Button  color="primary" variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} style={{ height: '42px',minWidth:'180px' }}>
              {t('bulkAddUser')}
            </Button>
            <BulkUserInsertionDialog open={openDialog} onClose={() => setOpenDialog(false)} onSubmit={() => {
                  fetchUsers();
              }}/>
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
                          <IconButton onClick={() => handleEdit(user)} color="primary">
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

      <UserFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={currentUser}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMessage')}
      />

      <Loader open={loading} />
    </Box>
  );
};

export default UserListPage;