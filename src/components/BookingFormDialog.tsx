import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, FormControl, InputLabel, Select,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getResources } from '../api/resourceApi';
import type { Resource } from '../api/resourceApi';
import { toast } from 'react-toastify';

interface BookingFormData {
  resourceId: number | '';
  quantity: number | '';
  fromDate: Date | null;
  toDate: Date | null;
}

interface BookingFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: BookingFormData) => void;
}

const BookingFormDialog: React.FC<BookingFormDialogProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<BookingFormData>({
    resourceId: '',
    quantity: '',
    fromDate: null,
    toDate: null,
  });
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Get today's date for minimum date restriction
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fetchResources = useCallback(async () => {
    try {
      const res = await getResources();
      setResources(res.data);
    } catch (error) {
      toast.error("Failed to fetch resources.");
      console.error("Failed to fetch resources:", error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchResources();
      setFormData({
        resourceId: '',
        quantity: '',
        fromDate: null,
        toDate: null,
      });
      setSelectedResource(null);
      setErrors({});
    }
  }, [open, fetchResources]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.resourceId) {
      newErrors.resourceId = 'Resource is required';
    }
    
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (Number(formData.quantity) < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    
    if (!formData.fromDate) {
      newErrors.fromDate = 'From date is required';
    }
    
    if (!formData.toDate) {
      newErrors.toDate = 'To date is required';
    }
    
    if (formData.fromDate && formData.toDate && formData.fromDate > formData.toDate) {
      newErrors.toDate = 'To date cannot be before from date';
    }

    const availableQuantity = selectedResource ? selectedResource.quantity - selectedResource.usedQuantity : 0;
    if (selectedResource && Number(formData.quantity) > availableQuantity) {
      newErrors.quantity = `Requested quantity exceeds available quantity (${availableQuantity})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResourceChange = (event: any) => {
    const resourceId = event.target.value as number;
    const resource = resources.find(r => r.id === resourceId);
    setSelectedResource(resource || null);
    setFormData(prev => ({
      ...prev,
      resourceId: resourceId,
      quantity: '',
    }));
    setErrors(prev => ({ ...prev, resourceId: '', quantity: '' }));
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setFormData(prev => ({
      ...prev,
      quantity: isNaN(value) ? '' : value,
    }));
    setErrors(prev => ({ ...prev, quantity: '' }));
  };

  const handleDateChange = (date: Date | null, field: 'fromDate' | 'toDate') => {
    setFormData(prev => ({
      ...prev,
      [field]: date,
    }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onSubmit({
      resourceId: formData.resourceId,
      quantity: formData.quantity,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
    });
    onClose();
  };

  const availableQuantityToDisplay = selectedResource
    ? selectedResource.quantity - selectedResource.usedQuantity
    : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { maxWidth: 600 } }}
    >
      <DialogTitle id="form-dialog-title">Add New Booking</DialogTitle>
      <DialogContent>
        <div className="space-y-4 mt-1">
          {/* Resource Select */}
          <FormControl
            fullWidth
            margin="dense"
            className={`border rounded-lg ${
              errors.resourceId
                ? "border-red-500"
                : "border-gray-300"
            }`}
            sx={{ mt: 1 }}
          >
            <InputLabel id="resource-select-label">Resource</InputLabel>
            <Select
              labelId="resource-select-label"
              id="resource-select"
              value={formData.resourceId}
              label="Resource"
              onChange={handleResourceChange}
              className="focus:ring-2 focus:ring-blue-500"
            >
              {resources.map((resource) => (
                <MenuItem key={resource.id} value={resource.id}>
                  {resource.name}
                </MenuItem>
              ))}
            </Select>
            {errors.resourceId && (
              <div className="text-red-500 text-xs mt-1 px-3">
                {errors.resourceId}
              </div>
            )}
          </FormControl>

          {/* Available Quantity Display */}
          <div>
            <input
              type="text"
              placeholder="Available Quantity"
              value={availableQuantityToDisplay}
              disabled
              className="w-full p-3 mt-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
            />
          </div>

          {/* Quantity Input */}
          <div>
            <input
              type="number"
              placeholder="Enter Quantity"
              value={formData.quantity}
              onChange={handleQuantityChange}
              min="1"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                errors.quantity
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.quantity && (
              <div className="text-red-500 text-xs mt-1">
                {errors.quantity}
              </div>
            )}
          </div>

          {/* Date Pickers */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="space-y-4">
              <div>
                <DatePicker
                  label="From Date"
                  value={formData.fromDate}
                  onChange={(date: Date | null) => handleDateChange(date, 'fromDate')}
                  minDate={today}
                  slots={{ textField: TextField }}
                  sx={{ 
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      height: '48px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.fromDate ? '#ef4444' : '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.fromDate ? '#ef4444' : '#3b82f6',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: errors.fromDate ? '#ef4444' : '#d1d5db',
                    },
                  }}
                  slotProps={{ 
                    textField: { 
                      required: true,
                      error: !!errors.fromDate,
                      helperText: errors.fromDate,
                    } 
                  }}
                  enableAccessibleFieldDOMStructure={false}
                />
              </div>

              <div>
                <DatePicker
                  label="To Date"
                  value={formData.toDate}
                  onChange={(date: Date | null) => handleDateChange(date, 'toDate')}
                  minDate={formData.fromDate || today}
                  slots={{ textField: TextField }}
                  sx={{ 
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      height: '48px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.toDate ? '#ef4444' : '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.toDate ? '#ef4444' : '#3b82f6',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: errors.toDate ? '#ef4444' : '#d1d5db',
                    },
                  }}
                  slotProps={{ 
                    textField: { 
                      required: true,
                      error: !!errors.toDate,
                      helperText: errors.toDate,
                    } 
                  }}
                  enableAccessibleFieldDOMStructure={false}
                />
              </div>
            </div>
          </LocalizationProvider>
        </div>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Add Booking
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingFormDialog;