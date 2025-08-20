import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem,TextField
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { User } from '../api/userApi';
import { getUserIdFromToken } from '../helpers/authHelpers';
import useLanguage from '../hooks/useLanguage';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { closeForm } from '../features/user/usersSlice';
import { addUserThunk, fetchUsersThunk, updateUserThunk } from '../features/user/usersThunks'; 
import { toast } from "react-toastify";

const UserFormDialog: React.FC = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const {
    page,
    rowsPerPage,
    sortColumn,
    sortDirection,
    search
  } = useSelector((state:RootState) => state.users);

  const open = useSelector((state:RootState) => state.users.formOpen);
  const user = useSelector((state:RootState) => state.users.editingUser);
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
      .min(2, t('firstNameMin'))
      .max(50, t('firstNameMax'))
      .matches(/^[a-zA-Z0-9_]+$/, t('firstNamePattern'))
      .required("First name is required"),
    lastname: Yup.string()
      .min(2, t('lastNameMin'))
      .max(50, t('lastNameMax'))
      .matches(/^[a-zA-Z0-9_]+$/, t('lastNamePattern'))
      .required(t('lastNameRequired')),
    email: Yup.string().email(t('invalidEmail')).required(t('emailRequired')),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, t('phoneInvalid'))
      .required(t('phoneRequired')),
    dateofbirth: Yup.date().required(t('dobRequired')),
    password: Yup.string()
      .min(8, t('passwordMin'))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        t('passwordPattern')
      )
      .required(t('passwordRequired')),
    roleId: Yup.number().oneOf([1, 2], t('roleInvalid')).required(t('roleRequired')),
  });

  const EditUserSchema = Yup.object().shape({
    firstname: Yup.string()
      .min(2, t('firstNameMin'))
      .max(50, t('firstNameMax'))
      .matches(/^[a-zA-Z0-9_]+$/, t('firstNamePattern'))
      .required(t('firstNameRequired')),
    lastname: Yup.string()
      .min(2, t('lastNameMin'))
      .max(50, t('lastNameMax'))
      .matches(/^[a-zA-Z0-9_]+$/, t('lastNamePattern'))
      .required(t('lastNameRequired')),
    email: Yup.string().email(t('emailInvalid')).required(t('emailRequired')),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, t('phoneInvalid'))
      .required(t('phoneRequired')),
    roleId: Yup.number().oneOf([1, 2], t('roleInvalid')).required(t('roleRequired')),
  });

  const handleSubmit = async (values: typeof initialFormikValues) => {
    try {
      if (isEditMode) {
        if (!user) return;
        await dispatch(updateUserThunk({
          id: user.id,
          firstname: values.firstname,
          lastname: values.lastname,
          email: values.email,
          phoneNumber: Number(values.phoneNumber),
          roleId: values.roleId,
          isActive: user.isActive,
        })).unwrap();
        toast.success(t('userUpdated'));
      } else {
        await dispatch(addUserThunk({
          firstname: values.firstname,
          lastname: values.lastname,
          email: values.email,
          password: values.password,
          phoneNumber: Number(values.phoneNumber),
          dateofbirth: values.dateofbirth,
          roleId: values.roleId,
        })).unwrap();
        toast.success(t('userAdded'));
      }

      dispatch(closeForm());

      dispatch(fetchUsersThunk({
        search,
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        sortColumn,
        sortDirection,
      }));

    } catch (error) {
      toast.error(t('checkUserDetails'));
    }
  };

  // max date for DOB input (today)
  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(closeForm())}
      aria-labelledby="form-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        id="form-dialog-title"
        className="text-xl font-bold text-center text-white"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #2575ee 100%)'
        }}      >
        {isEditMode ? t('editUser') : t('addNewUser')}
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
                    placeholder={t('firstName')}
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
                    placeholder={t('lastName')}
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
                    placeholder={t('email')}
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
                      placeholder={t('passwordField')}
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
                    placeholder={t('phoneNumber')}
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
                  <InputLabel id="role-select-label">{t('role')}</InputLabel>
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
                    <MenuItem value={1}>{t('roleAdmin')}</MenuItem>
                    <MenuItem value={2}>{t('roleUser')}</MenuItem>
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
                    <Field name="dateofbirth">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          label={t('dateOfBirth')}
                          type="date"
                          fullWidth
                          max={new Date().toISOString().split('T')[0]}
                          InputLabelProps={{
                            shrink: true, 
                          }}
                          inputProps={{
                            max: new Date().toISOString().split("T")[0],
                          }}
                          error={meta.touched && Boolean(meta.error)}
                          helperText={meta.touched && meta.error}
                        />
                      )}
                    </Field>
                  </div>
                )}
              </div>

              <DialogActions  sx={{
                backgroundColor: 'white'
              }}>
                <Button onClick={() => dispatch(closeForm())} color="primary" variant="outlined" sx={{fontSize: { xs: '12px'}}}>
                  {t('cancel')}
                </Button>
                <Button type="submit" variant="contained" color="primary" sx={{fontSize: { xs: '12px'}}}>
                  {isEditMode ? t('saveChanges') : t('addUser')}
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
