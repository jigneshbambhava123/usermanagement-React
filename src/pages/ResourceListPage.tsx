import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,TextField,
  Paper, TablePagination, IconButton, Typography, Box, TableSortLabel, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getfilterResources, createResource, updateResource, deleteResource,updateResourceField } from '../api/resourceApi';
import type { Resource } from '../api/resourceApi';
import { getUserRoles } from '../helpers/authHelpers';
import { toast } from "react-toastify";
import { debounce } from 'lodash';
import * as Yup from 'yup';
import ResourceFormDialog from '../components/ResourceFormDialog';
import Loader from '../components/Loader';
import useLanguage from '../hooks/useLanguage';

type CreateResourceFormData = Omit<Resource, 'id' | 'usedQuantity'>;
type UpdateResourceFormData = Omit<Resource, 'usedQuantity'>;



const ResourceListPage: React.FC = () => {
  const { t } = useLanguage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortColumn, setSortColumn] = useState<'name' | 'quantity' | 'usedquantity'>('name');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);

  const roles = getUserRoles();
  const isAdmin = roles.includes("Admin");

  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof Resource } | null>(null);
  const [editedValue, setEditedValue] = useState<string | number>('');

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      
      const [res] = await Promise.all([
        getfilterResources({
          search: searchQuery,
          pageNumber: page + 1,
          pageSize: rowsPerPage,
          sortColumn,
          sortDirection,
        }),
        delay(800) 
      ]);
  
    setResources(res.data.data); 
    setTotal(res.data.totalCount);
      
    } catch {
      toast.error(t('fetchResourcesError'));
      setResources([]);
      setTotal(0);
      await delay(500);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    const debounced = debounce(() => {
      fetchResources();
    }, 300);

    debounced();
    return () => debounced.cancel();
  }, [fetchResources]);

  const handleSortClick = (column: 'name' | 'quantity'| 'usedquantity') => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const handleResourceSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setSearchQuery(e.target.value);
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
        toast.success(t('resourceUpdated'));
        } else {
        await createResource(data);
        toast.success(t('resourceAdded'));
        }
        setIsFormOpen(false);
        fetchResources();
    } catch {
        if ('id' in data) {
          toast.error(t('resourceUpdateError'));
        } else {
          toast.error(t('resourceAddError'));
        }
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
        toast.success(t('resourceDeleted'));
        setPage(0);
        fetchResources();
      } catch {
        toast.error(t('resourceDeleteError'));
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

  // Define the validation schema for inline editing
  const inlineValidationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('nameRequired'))
      .min(2, t('nameMinMax'))
      .max(50, t('nameMinMax'))
      .matches(
        /^(?!.*[\x00-\x1F\x7F])[a-zA-Z0-9_]+(?: [a-zA-Z0-9_]+)*$/,
        t('namePattern')
      ),
    description: Yup.string()
      .max(500, t('descriptionMax'))
      .nullable(),
    quantity: Yup.number()
      .integer(t('quantityInteger'))
      .min(0, t('quantityMin'))
      .required(t('quantityRequired'))
      .typeError(t('inlineQuantityType')),
  });

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
          toast.error(t('quantityLessThanUsed'));
          setEditingCell(null);
          setEditedValue('');
          return;
        }
      }

      const valueToSend = (field === 'description' && valueToValidate === null) ? '' : valueToValidate;

      if (originalResource && originalResource[field] !== valueToSend) {
        await updateResourceField(id, field as string, String(valueToSend));
        toast.success(t('fieldUpdateSuccess', { field }));
        setResources(prevResources =>
          prevResources.map(res =>
            res.id === id ? { ...res, [field]: valueToSend } : res
          )
        );
      }
    } catch (error: any) {
      toast.error(error.message);
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
    <Box sx={{ width: '100%',p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column',sm: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-start', md: 'center' },
            pb:4,
            gap: 2
          }}
        >
          <Typography
            variant="h4"
            color="primary"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '24px', sm: '28px',md: '28px' },
              letterSpacing: '-0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {t("resourceManagement")}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              gap: 2,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <input
              type="text"
              placeholder={t("searchResourcePlaceholder")}
              value={searchQuery}
              onChange={handleResourceSearchChange}
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
                startIcon={<AddIcon />}
                onClick={handleAddResource}
                sx={{
                  height: '42px',
                  width: { xs: '100%', sm: 'auto' },whiteSpace: 'nowrap', overflow: 'hidden',minWidth:'190px'
                }}
              >
                {t("addResource")}
              </Button>
            )}
          </Box>
        </Box>
        
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                      {t("name")}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t("description")}</TableCell>
                  <TableCell sortDirection={sortColumn === 'quantity' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'quantity'}
                      direction={sortColumn === 'quantity' ? sortDirection : 'asc'}
                      onClick={() => handleSortClick('quantity')}
                    >
                      {t("quantity")}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }} sortDirection={sortColumn === 'usedquantity' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'usedquantity'}
                      direction={sortColumn === 'usedquantity' ? sortDirection : 'asc'}
                      onClick={() => handleSortClick('usedquantity')}
                    >
                      {t("bookedQuantity")}
                    </TableSortLabel>
                  </TableCell>
                  {isAdmin && <TableCell>{t("actions")}</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {resources?.length > 0 ? (
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
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 120 }}>
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
                  !loading && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                        {t("noResourcesFound")}
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

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle
        id="confirm-dialog-title"
        className="text-xl font-bold text-center text-white"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #2575ee 100%)'
        }}>{t("confirmDeleteTitle")}</DialogTitle>
        <DialogContent sx={{ pt: 5 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography
              id="confirm-dialog-description"
              sx={{ pt:5, pb: 5, fontSize: '1rem', color: '#333', textAlign: 'center' }}
            >
              {t("confirmResourceDeleteMessage")}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={() => setConfirmOpen(false)} color="primary" variant="outlined">
            {t("cancel")}
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Loader open={loading} />
    </Box>
  );
};

export default ResourceListPage;