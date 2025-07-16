import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,TextField,
  Paper, TablePagination, IconButton, Typography, Box, TableSortLabel, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getResources, createResource, updateResource, deleteResource,updateResourceField } from '../api/resourceApi';
import type { Resource } from '../api/resourceApi';
import { getUserRoles } from '../helpers/authHelpers';
import { toast } from "react-toastify";
import { debounce } from 'lodash';
import * as Yup from 'yup';
import ResourceFormDialog from '../components/ResourceFormDialog';

type CreateResourceFormData = Omit<Resource, 'id' | 'usedQuantity'>;
type UpdateResourceFormData = Omit<Resource, 'usedQuantity'>;

// Define the validation schema for inline editing
const inlineValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required.')
    .min(2, 'Name must be between 2 and 50 characters.')
    .max(50, 'Name must be between 2 and 50 characters.')
    .matches(
      /^(?!.*[\x00-\x1F\x7F])[a-zA-Z0-9_]+(?: [a-zA-Z0-9_]+)*$/,
      'Name should only contain letters, numbers, underscores, and spaces between words. No leading/trailing spaces allowed.'
    ),
  description: Yup.string()
    .max(500, 'Description too long')
    .nullable(),
  quantity: Yup.number()
    .integer('Quantity must be an integer.')
    .min(0, 'Please enter a valid quantity of zero or more.')
    .required('Quantity is required.')
    .typeError('Quantity must be a number.'),
});

const ResourceListPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortColumn, setSortColumn] = useState<'name' | 'quantity'>('name');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);

  const roles = getUserRoles();
  const isAdmin = roles.includes("Admin");

  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof Resource } | null>(null);
  const [editedValue, setEditedValue] = useState<string | number>('');

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getResources();
      let data = res.data;

      if (Array.isArray(data)) {
        let filtered = data.filter(resource =>
          resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (resource.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.sort((a, b) => {
          let aVal = sortColumn === 'name' ? a.name.toLowerCase() : a.quantity;
          let bVal = sortColumn === 'name' ? b.name.toLowerCase() : b.quantity;
          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });

        const paged = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
        setResources(paged);
        setTotal(filtered.length);
      } else {
        setResources([]);
        setTotal(0);
      }
    } catch {
      toast.error("Failed to fetch resources.");
      setResources([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    const debounced = debounce(() => {
      fetchResources();
    }, 500);

    debounced();
    return () => debounced.cancel();
  }, [fetchResources]);

  const handleSortClick = (column: 'name' | 'quantity') => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(0);
  };

   const handleAddResource = () => {
    setCurrentResource(null);
    setIsFormOpen(true);
   };

   const handleEditResource = (resource: Resource) => {
    setCurrentResource(resource);
    setIsFormOpen(true);
   };

   const handleResourceSubmit = async (data: CreateResourceFormData | UpdateResourceFormData) => {
    try {
        if ('id' in data) {
        await updateResource(data);
        toast.success('Resource updated successfully.');
        } else {
        await createResource(data);
        toast.success('Resource added successfully.');
        }
        setIsFormOpen(false);
        fetchResources();
    } catch {
        toast.error('Operation failed.');
    }
  };

  const handleDeleteClick = (id: number) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (toDeleteId !== null) {
      try {
        await deleteResource(toDeleteId);
        toast.success("Resource deleted successfully.");
        fetchResources();
      } catch {
        toast.error("Delete failed.");
      } finally {
        setToDeleteId(null);
        setConfirmOpen(false);
      }
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // New functions for inline editing
  const handleCellClick = (id: number, field: keyof Resource, value: string | number) => {
    if (isAdmin && field !== 'usedQuantity') { 
      setEditingCell({ id, field });
      setEditedValue(value);
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedValue(e.target.value);
  };

  const handleBlur = async () => {
    if (!editingCell) return;

    const { id, field } = editingCell;
    const originalResource = resources.find(r => r.id === id);

    let valueToValidate: string | number | null | undefined = null ;

    if (field === 'description' && editedValue === '') {
      valueToValidate = null;
    } else if (field === 'quantity') {
      valueToValidate = parseInt(String(editedValue), 10);
      if (isNaN(valueToValidate)) {
        valueToValidate = (editedValue === '') ? undefined : editedValue;
      }
    } else {
      valueToValidate = String(editedValue);
    }

    try {
      await inlineValidationSchema.validateAt(field as string, { [field]: valueToValidate });

      if (field === 'quantity' && originalResource && typeof valueToValidate === 'number') {
        if (valueToValidate < originalResource.usedQuantity) {
          toast.error("Quantity cannot be less than used quantity.");
          setEditingCell(null);
          setEditedValue('');
          return;
        }
      }

      const valueToSend = (field === 'description' && valueToValidate === null) ? '' : valueToValidate;

      if (originalResource && originalResource[field] !== valueToSend) {
        await updateResourceField(id, field as string, String(valueToSend));
        toast.success(`${field} updated successfully.`);
        setResources(prevResources =>
          prevResources.map(res =>
            res.id === id ? { ...res, [field]: valueToSend } : res
          )
        );
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error(`Validation/Update failed for ${field}:`, error);
    } finally {
      setEditingCell(null);
      setEditedValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur(); 
    }
  };


  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            
            Resource Management 
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="text"
              placeholder="Search resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
            />
            {isAdmin && (
              <Button variant="contained" startIcon={<AddIcon />} 
              onClick={handleAddResource}
               style={{
                height: '42px'
              }}
              >
                Add Resource 
              </Button>
            )}
          </Box>
        </Box>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortColumn === 'name' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'name'}
                    direction={sortColumn === 'name' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell sortDirection={sortColumn === 'quantity' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'quantity'}
                    direction={sortColumn === 'quantity' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('quantity')}
                  >
                    Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell>Used</TableCell>
                {isAdmin && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && resources.length > 0 ? (
                resources.map(resource => (
                  <TableRow key={resource.id}>
                    <TableCell onClick={() => handleCellClick(resource.id, 'name', resource.name)}>
                      {isAdmin && editingCell?.id === resource.id && editingCell.field === 'name' ? (
                        <TextField
                          value={editedValue}
                          onChange={handleFieldChange}
                          onBlur={handleBlur}
                          onKeyPress={handleKeyPress}
                          autoFocus
                          size="small"
                          fullWidth
                        />
                      ) : (
                        resource.name
                      )}
                    </TableCell>
                    <TableCell onClick={() => handleCellClick(resource.id, 'description', resource.description || '')}>
                      {isAdmin && editingCell?.id === resource.id && editingCell.field === 'description' ? (
                        <TextField
                          value={editedValue}
                          onChange={handleFieldChange}
                          onBlur={handleBlur}
                          onKeyPress={handleKeyPress}
                          autoFocus
                          size="small"
                          fullWidth
                        />
                      ) : (
                        resource.description || "-"
                      )}
                    </TableCell>
                    <TableCell onClick={() => handleCellClick(resource.id, 'quantity', resource.quantity)}>
                      {isAdmin && editingCell?.id === resource.id && editingCell.field === 'quantity' ? (
                        <TextField
                          type="number"
                          value={editedValue}
                          onChange={handleFieldChange}
                          onBlur={handleBlur}
                          onKeyPress={handleKeyPress}
                          autoFocus
                          size="small"
                          fullWidth
                        />
                      ) : (
                        resource.quantity
                      )}
                    </TableCell>
                    <TableCell>{resource.usedQuantity}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <IconButton onClick={() => handleEditResource(resource)} color="primary" >
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteClick(resource.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                    {loading ? "Loading..." : "No resources found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <ResourceFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        resource={currentResource}
        onSubmit={handleResourceSubmit}
      />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this resource?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourceListPage;