import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, IconButton, Typography, Box, TableSortLabel, Button,
  Dialog, DialogTitle, DialogContent, DialogActions // Import Dialog components for ConfirmDialog
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getUsers, createUser, updateUser, deleteUser } from '../api/userApi';
import type { User } from '../api/userApi';
import { getUserRoles } from '../helpers/authHelpers';
import { toast } from "react-toastify";
import { debounce } from 'lodash';
import UserFormDialog from '../components/UserFormDialog'; // Import the new dialog component

// Define types for form data, consistent with UserFormDialog
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

// New ConfirmDialog component (can be moved to its own file if preferred)
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
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Typography id="confirm-dialog-description">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
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
  type SortColumn = 'firstname' | 'lastname' | 'role';
  const [sortColumn, setSortColumn] = useState<SortColumn>('firstname');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // For editing

  // State for delete confirmation dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);

  const roles = getUserRoles();
  const isAdmin = roles.includes("Admin");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      const data = res.data;

      if (Array.isArray(data)) {
        let filtered = data.filter((user) =>
          user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.sort((a, b) => {
          let valA: string | number;
          let valB: string | number;

          if (sortColumn === 'firstname') {
            valA = a.firstname.toLowerCase();
            valB = b.firstname.toLowerCase();
          } else if (sortColumn === 'lastname') {
            valA = a.lastname.toLowerCase();
            valB = b.lastname.toLowerCase();
          } else if (sortColumn === 'role') {
            valA = getRoleName(a.roleId).toLowerCase();
            valB = getRoleName(b.roleId).toLowerCase();
          } else {
            valA = '';
            valB = '';
          }

          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });

        const paged = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

        setUsers(paged);
        setTotalUsers(filtered.length);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      toast.error("Failed to fetch users.");
      setUsers([]);
      setTotalUsers(0);
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
    }, 500);

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

  const handleAddUser = () => {
    setCurrentUser(null); // Clear any existing user data
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsFormOpen(true);
  };

  // Open the confirmation dialog for delete
  const handleDeleteClick = (userId: number) => {
    setUserToDeleteId(userId);
    setIsConfirmDialogOpen(true);
  };

  // Handle the actual delete after confirmation
  const handleConfirmDelete = async () => {
    if (userToDeleteId !== null) {
      try {
        await deleteUser(userToDeleteId);
        toast.success("User deleted successfully!");
        fetchUsers(); // Re-fetch users to update the list
      } catch (error) {
        toast.error("Failed to delete user.");
      } finally {
        setIsConfirmDialogOpen(false); // Close dialog
        setUserToDeleteId(null); // Clear ID
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
      setIsFormOpen(false); // Close the form
      fetchUsers(); // Re-fetch users to update the list
    } catch (error) {
      toast.error(`Failed to ${'id' in userData ? 'update' : 'add'} user.`);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
          <Typography variant="h6">User</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '200px'
              }}
            />
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddUser}
                style={{
                height: '42px'
              }}
              >
                Add User
              </Button>
            )}
          </Box>
        </Box>
        <TableContainer>
          <Table stickyHeader aria-label="user table">
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortColumn === 'firstname' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'firstname'}
                    direction={sortColumn === 'firstname' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('firstname')}
                  >
                    First Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortColumn === 'lastname' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'lastname'}
                    direction={sortColumn === 'lastname' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('lastname')}
                  >
                    Last Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell sortDirection={sortColumn === 'role' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'role'}
                    direction={sortColumn === 'role' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('role')}
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
              {!loading && users.length > 0 ? (
                users.map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>{user.firstname}</TableCell>
                    <TableCell>{user.lastname}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleName(user.roleId)}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>{calculateAge(user.dateofbirth)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <IconButton onClick={() => handleEdit(user)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(user.id)} color="error"> {/* Changed to handleDeleteClick */}
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                    {loading ? "Loading..." : "No users found."}
                  </TableCell>
                </TableRow>
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
    </Box>
  );
};

export default UserListPage;
