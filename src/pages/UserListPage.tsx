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
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
        },
      }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        className="text-xl font-bold text-center text-white"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #2575ee 100%)',
          py: 2,
          px: 3,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
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
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserListPage: React.FC = () => {
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
      toast.error("Failed to fetch users.");
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
      toast.success("Login successful!");
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
        toast.success("User deleted successfully!");
        setPage(0);
        fetchUsers(); 
      } catch (error) {
        toast.error("Failed to delete user.");
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
        toast.success("User updated successfully!");
      } else {
        await createUser(userData as AddUserFormData);
        toast.success("User added successfully!");
      }
      setIsFormOpen(false); 
      fetchUsers();
    } catch (error) {
      toast.error(`Check User Detail.`);
      console.error('Form submission error:', error);
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
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            padding: 2,
            gap: 2
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            User
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
              placeholder="Search user..."
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
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddUser}
                sx={{ height: '42px', width: { xs: '100%', sm: 'auto' },whiteSpace: 'nowrap', overflow: 'hidden',minWidth:'140px'}}
              >
                Add User
              </Button>
            )}

            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} style={{ height: '42px',minWidth:'180px' }}>
              Bulk Add User
            </Button>
            <BulkUserInsertionDialog open={openDialog} onClose={() => setOpenDialog(false)} onSubmit={() => {
                  fetchUsers();
              }}/>
          </Box>
        </Box>

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
                    First Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 120 }} sortDirection={sortColumn === 'lastname' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'lastname'}
                    direction={sortColumn === 'lastname' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('lastname')}
                  >
                    Last Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell sortDirection={sortColumn === 'roleid' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'roleid'}
                    direction={sortColumn === 'roleid' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('roleid')}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Age</TableCell>
                {isAdmin && <TableCell>Actions</TableCell>}
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
                      <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 120 }}>
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
                      No users found.
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
        title="Confirm Delete"
        message="Are you sure you want to delete this user? "
      />

      <Loader open={loading} />
    </Box>
  );
};

export default UserListPage;