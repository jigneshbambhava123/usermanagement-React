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
  const isEditMode = Boolean(resource);

  const initialValues = {
    name: resource?.name || '',
    description: resource?.description || '',
    quantity: resource?.quantity ?? ''
  };

  const usedQuantity = resource?.usedQuantity || 0;

  const validationSchema = Yup.object().shape({
    name: Yup.string()
    .required('Name is required.')
    .min(2, 'Name must be between 2 and 50 characters.')
    .max(50, 'Name must be between 2 and 50 characters.')
    .matches(
      /^(?!.*[\x00-\x1F\x7F])[a-zA-Z0-9_]+(?: [a-zA-Z0-9_]+)*$/,
      'Name should only contain letters, numbers, underscores, and spaces between words. No leading/trailing spaces allowed.'
    ),
    description: Yup.string()
        .max(500, 'Description too long'),
    quantity: Yup.number()
        .integer('Quantity must be an integer.')
        .min(0, 'Please enter a valid quantity of zero or more.')
        .required('Quantity is required.')
         .test(
        'not-less-than-used',
        `Quantity cannot be less than the currently used quantity (${usedQuantity}).`,
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
      <DialogTitle id="resource-dialog-title">
        {isEditMode ? 'Edit Resource' : 'Add New Resource'}
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="space-y-4 mt-1">
                {/* Name */}
                <div>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Resource Name"
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
                    placeholder="Description (optional)"
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
                    placeholder="Quantity"
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
                <Button onClick={onClose} color="secondary">
                  Cancel
                </Button>
                <Button type="submit" color="primary" disabled={isSubmitting}>
                  {isEditMode ? 'Save Changes' : 'Add Resource'}
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