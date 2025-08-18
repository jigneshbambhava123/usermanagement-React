import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { Resource } from '../api/resourceApi';
import useLanguage from '../hooks/useLanguage';

type CreateResourceFormData = Omit<Resource, 'id' | 'usedQuantity'>;
type UpdateResourceFormData = Omit<Resource, 'usedQuantity'>;

interface ResourceFormDialogProps {
  open: boolean;
  onClose: () => void;
  resource: Resource | null;
  onSubmit: (data: CreateResourceFormData | UpdateResourceFormData) => Promise<void>;
}

const ResourceFormDialog: React.FC<ResourceFormDialogProps> = ({
  open,
  onClose,
  resource,
  onSubmit
}) => {
  const {t} = useLanguage();
  const isEditMode = Boolean(resource);

  const initialValues = {
    name: resource?.name || '',
    description: resource?.description || '',
    quantity: resource?.quantity ?? ''
  };

  const usedQuantity = resource?.usedQuantity || 0;

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('nameRequired'))
      .min(2, t('nameMinMax'))
      .max(50, t('nameMinMax'))
      .matches(
        /^(?!.*[\x00-\x1F\x7F])[a-zA-Z0-9_]+(?: [a-zA-Z0-9_]+)*$/,
        t('namePattern')
      ),
    description: Yup.string().max(500, t('descriptionMax')),
    quantity: Yup.number()
      .integer(t('quantityInteger'))
      .min(0, t('quantityMin'))
      .required(t('quantityRequired'))
      .test(
        'not-less-than-used',
        t('quantityNotLessThanUsed', { usedQuantity }),
        function (value) {
          if (resource && typeof value === 'number') {
            return value >= usedQuantity;
          }
          return true;
        }
      ),
  });


  const handleSubmit = (values: typeof initialValues) => {
    if (isEditMode && resource) {
      const payload: UpdateResourceFormData = {
        id: resource.id,
        name: values.name,
        description: values.description,
        quantity: Number(values.quantity)
      };
      onSubmit(payload);
    } else {
      const payload: CreateResourceFormData = {
        name: values.name,
        description: values.description,
        quantity: Number(values.quantity)
      };
      onSubmit(payload);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="resource-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="resource-dialog-title" 
        className="text-xl font-bold text-center text-white"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #2575ee 100%)'
        }}>
        {isEditMode ? t('editResource') : t('addNewResource')}
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched }) => (
            <Form>
              <div className="space-y-4 mt-4">
                {/* Name */}
                <div>
                  <Field
                    type="text"
                    name="name"
                    placeholder={t('resourceName')}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                      errors.name && touched.name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <Field
                    as="textarea"
                    name="description"
                    placeholder={t('resourceDescription')}
                    rows={3}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                      errors.description && touched.description
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <Field
                    type="number"
                    name="quantity"
                    placeholder={t('quantity')}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                      errors.quantity && touched.quantity
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  <ErrorMessage
                    name="quantity"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>

              <DialogActions>
                <Button onClick={onClose} color="primary" variant="outlined" sx={{fontSize: { xs: '12px'}}}>
                   {t('cancel')}
                </Button>
                <Button type="submit" color="primary" variant="contained" sx={{fontSize: { xs: '12px'}}}>
                  {isEditMode ? t('saveChanges') : t('addResource')}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceFormDialog;