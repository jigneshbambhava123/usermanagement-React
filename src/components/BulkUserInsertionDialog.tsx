import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer
} from '@mui/material';
import { toast } from 'react-toastify';
import type { User } from '../api/userApi';
import api from '../api/axiosInstance';
 
interface BulkUserUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const getRoleName = (roleId: number) => {
  switch (roleId) {
    case 1: return "Admin";
    case 2: return "User";
    default: return "Unknown";
  }
};
 
const BulkUserUploadDialog: React.FC<BulkUserUploadDialogProps> = ({ open, onClose, onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successUsers, setSuccessUsers] = useState<User[]>([]);
  const [errorUsers, setErrorUsers] = useState<{ user: User; errors: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'success' | 'error' | null>(null);
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
    } else {
      toast.warning('Please select Excel File.');
      setSelectedFile(null);
    }
  };
 
  const handleProcess = async () => {
    if (!selectedFile) {
      toast.warning('Please select Excel File.');
      return;
    }
 
    try {
        const formData = new FormData();
        formData.append('file', selectedFile); 
    
        const response = await api.post('/User/BulkInsertionUser', formData);
        console.log(response.data);
        setSuccessUsers(response.data.successList);
        setErrorUsers(response.data.errorList);
        onSubmit(); 
        toast.success('user process complete!');
        setActiveTab('success');
    } catch (error) {
      console.error(error);
      toast.error('some error occur');
    } 
  };

  const handleClose = () => {
    setSelectedFile(null);
    setSuccessUsers([]);
    setErrorUsers([]);
    setActiveTab(null);
    onClose();
  };
 
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
      className="text-xl font-bold text-center text-white"
      sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #2575ee 100%)'
        }}
      >Bulk Add User</DialogTitle>
      <DialogContent >

        <Box mt={2} mb={2} className="flex flex-col gap-2">
          <label className="font-bold text-gray-700">Upload Excel File:</label>
          <input className="p-2 border border-gray-300 rounded text-sm" type="file" onChange={handleFileChange} />
        </Box>
 
        {(successUsers.length > 0 || errorUsers.length > 0) && (
          <Box mt={2}>
            <Button
              variant={activeTab === 'success' ? 'contained' : 'outlined'}
              color="success"
              onClick={() => setActiveTab('success')}
              sx={{ mr: 2 }}
            >
              Show Success Records
            </Button>
            <Button
              variant={activeTab === 'error' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setActiveTab('error')}
            >
              Show Error Records
            </Button>
          </Box>
        )}
 
        {activeTab === 'success'  && (
          <Box mt={3}>
            <TableContainer  sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 120 }}>First Name</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 120 }}>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Password</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 120 }}>Phone Number</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 120 }}>Date of Birth</TableCell>
                </TableRow>
              </TableHead>
             <TableBody>
              {successUsers?.length > 0 ? (
                successUsers.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.firstname}</TableCell>
                    <TableCell>{user.lastname}</TableCell>
                    <TableCell> {user.email}</TableCell>
                    <TableCell>{user.password}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>{getRoleName(user.roleId)}</TableCell>
                    <TableCell>{new Date(user.dateofbirth).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
              )}
              </TableBody>
            </Table>
            </TableContainer>
          </Box>
        )}
 
        {activeTab === 'error' && (
          <Box mt={3}>
            <TableContainer  sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 120 }}>First Name</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 120 }}>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Password</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 120 }}>Phone Number</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 120 }}>Date of Birth</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {errorUsers?.length > 0 ? (
                errorUsers.map((item, index) => (
                  <TableRow >
                    <TableCell>{item.user.firstname}</TableCell>
                    <TableCell>{item.user.lastname}</TableCell>
                    <TableCell> {item.user.email}</TableCell>
                    <TableCell>{item.user.password}</TableCell>
                    <TableCell>{item.user.phoneNumber}</TableCell>  
                    <TableCell>{getRoleName(item.user.roleId)}</TableCell>
                    <TableCell>{new Date(item.user.dateofbirth).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ minWidth: 180,color:'red', fontWeight:'bold' }}>
                        {item.errors}
                    </TableCell>
                  </TableRow>
                ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
 
      <DialogActions>
        <Button onClick={handleClose} color='primary' variant="outlined">
          Close
        </Button>
        <Button
          onClick={handleProcess}
          variant="contained"
        >
          Process
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
export default BulkUserUploadDialog;