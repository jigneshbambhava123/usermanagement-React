import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { User } from '../api/userApi';
import { getUserIdFromToken } from '../helpers/authHelpers';

type AddUserFormData = Omit<User, 'id' | 'isActive'>;
type UpdateUserFormData = Omit<User, 'password' | 'dateofbirth'>;

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (userData: AddUserFormData | UpdateUserFormData) => void;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, onClose, user, onSubmit }) => {
  const isEditMode = Boolean(user);
  const loggedInUserId = getUserIdFromToken();

  const initialFormikValues = {
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    password: '', 
    phoneNumber: user?.phoneNumber?.toString() || '',
    dateofbirth: user?.dateofbirth?.split('T')[0] || '', 
    roleId: user?.roleId || 2,
  };

  const AddUserSchema = Yup.object().shape({
    firstname: Yup.string()
      .min(2, "First name must be at least 2 characters long.")
      .max(50, "First name must be at most 50 characters long.")
      .matches(/^[a-zA-Z0-9_]+$/, "First name can only contain letters, numbers and underscore")
      .required("First name is required"),
    lastname: Yup.string()
      .min(2, "Last name must be at least 2 characters long.")
      .max(50, "Last name must be at most 50 characters long.")
      .matches(/^[a-zA-Z0-9_]+$/, "Last name can only contain letters, numbers and underscore")
      .required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .required("Phone number is required"),
    dateofbirth: Yup.date().required("Date of birth is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .required("Password is required"),
    roleId: Yup.number().oneOf([1, 2], "Invalid role selected").required("Role is required"),
  });

  const EditUserSchema = Yup.object().shape({
    firstname: Yup.string()
      .min(2, "First name must be at least 2 characters long.")
      .max(50, "First name must be at most 50 characters long.")
      .matches(/^[a-zA-Z0-9_]+$/, "First name can only contain letters, numbers and underscore")
      .required("First name is required"),
    lastname: Yup.string()
      .min(2, "Last name must be at least 2 characters long.")
      .max(50, "Last name must be at most 50 characters long.")
      .matches(/^[a-zA-Z0-9_]+$/, "Last name can only contain letters, numbers and underscore")
      .required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .required("Phone number is required"),
    roleId: Yup.number().oneOf([1, 2], "Invalid role selected").required("Role is required"),
  });

  const handleSubmit = (values: typeof initialFormikValues) => {
    if (isEditMode) {
      if (!user) return;
      const dataToSubmit: UpdateUserFormData = {
        id: user.id,
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        roleId: values.roleId,
        phoneNumber: Number(values.phoneNumber),
        isActive: user.isActive,
      };
      onSubmit(dataToSubmit);
    } else {
      const dataToSubmit: AddUserFormData = {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        password: values.password,
        roleId: values.roleId,
        phoneNumber: Number(values.phoneNumber),
        dateofbirth: values.dateofbirth,
      };
      onSubmit(dataToSubmit);
    }
  };

  // max date for DOB input (today)
  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      maxWidth="sm"
      fullWidth
      // PaperProps={{ sx: { maxWidth: 600 } }} 
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
        },
      }}
    >
      <DialogTitle
        id="form-dialog-title"
        className="text-xl font-bold text-center text-white"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #2575ee 100%)',
          py: 2,
          px: 3,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}      >
        {isEditMode ? 'Edit User' : 'Add New User'}
      </DialogTitle>

      <DialogContent>
        <Formik
          initialValues={initialFormikValues}
          validationSchema={isEditMode ? EditUserSchema : AddUserSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, setFieldValue }) => (
            <Form>
              <div className="space-y-4 mt-4">
                {/* First Name */}
                <div>
                  <Field
                    type="text"
                    name="firstname"
                    placeholder="First Name"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                      errors.firstname && touched.firstname
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  <ErrorMessage
                    name="firstname"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Field
                    type="text"
                    name="lastname"
                    placeholder="Last Name"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                      errors.lastname && touched.lastname
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  <ErrorMessage
                    name="lastname"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Email */}
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                      errors.email && touched.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Password - only if add mode */}
                {!isEditMode && (
                  <div>
                    <Field
                      type="password"
                      name="password"
                      placeholder="Password"
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                        errors.password && touched.password
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                )}

                {/* Phone Number */}
                <div>
                  <Field
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                      errors.phoneNumber && touched.phoneNumber
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  <ErrorMessage
                    name="phoneNumber"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Role Select */}
                <FormControl
                  fullWidth
                  margin="dense"
                  className={`border rounded-lg ${
                    touched.roleId && errors.roleId
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  sx={{ mt: 1 }}
                >
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Field
                    as={Select}
                    labelId="role-select-label"
                    id="roleId"
                    name="roleId"
                    label="Role"
                    disabled={isEditMode && user?.id === loggedInUserId}
                    onChange={(event: SelectChangeEvent<number>) => {
                      setFieldValue('roleId', event.target.value);
                    }}
                  >
                    <MenuItem value={1}>Admin</MenuItem>
                    <MenuItem value={2}>User</MenuItem>
                  </Field>
                  <ErrorMessage
                    name="roleId"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </FormControl>

                {/* Date of Birth - only if add mode */}
                {!isEditMode && (
                  <div className="mt-4">
                    <Field
                      type="date"
                      name="dateofbirth"
                      max={maxDate}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                        errors.dateofbirth && touched.dateofbirth
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <ErrorMessage
                      name="dateofbirth"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                )}
              </div>

              <DialogActions>
                <Button onClick={onClose} color="primary" variant="outlined">
                  Cancel
                </Button>
                <Button type="submit" color="primary" variant="contained">
                  {isEditMode ? 'Save Changes' : 'Add User'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
