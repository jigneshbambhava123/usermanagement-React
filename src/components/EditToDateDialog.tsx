import React, { useEffect, useState } from 'react';
import {Dialog,DialogTitle,DialogContent,DialogActions,Button,TextField} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
 
interface EditToDateDialogProps {
  open: boolean;
  onClose: () => void;
  currentToDate: string;
  bookingId: number;
  onSuccess: () => void;
}
 
const EditToDateDialog: React.FC<EditToDateDialogProps> = ({open,onClose,currentToDate,bookingId,onSuccess,}) => {
    const [ToDate, setToDate] = useState<string>('');
 
    useEffect(() => {
        console.log(currentToDate.split("T")[0]);
        setToDate(currentToDate.split("T")[0]);
    }, [currentToDate]);
 
  const handleUpdate = async () => {
    try {
      await api.put(`/Booking?bookingId=${bookingId}&toDate=${ToDate}`);

      toast.success('To Date updated successfully!');
      onClose();
      onSuccess();
    } catch (error) {
      toast.error('Failed to update To Date.');
      console.error(error);
    }
  };
 
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
      className="text-xl font-bold text-center text-white"
      sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #2575ee 100%)'
        }}
      >Edit To Date</DialogTitle>
        <DialogContent>
            <input
                type="date"
                className="w-full p-4 mt-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={ToDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setToDate(e.target.value)}
            />
        </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={handleUpdate} variant="contained" color="primary">Update</Button>
      </DialogActions>
    </Dialog>
  );
};
 
export default EditToDateDialog;
