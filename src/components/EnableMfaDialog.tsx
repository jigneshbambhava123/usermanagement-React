import {Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Switch, CircularProgress, Box,} from '@mui/material';
import { useEffect, useState } from 'react';
import { getMfaEnable, updateConfigurationValue } from '../api/configurationApi';
import { toast } from 'react-toastify';
import useLanguage from '../hooks/useLanguage';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { closeMfaDialog } from '../features/user/usersSlice';

const EnabledMfaDialog: React.FC = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const open = useSelector((state: RootState) => state.users.mfaDialogOpen);
  const [isEnabled, setIsEnabled] = useState(false); 
  const [saving, setSaving] = useState(false);

   useEffect(() => {
    if (open) {
      const fetchMfaStatus = async () => {
        try {
          const response = await getMfaEnable(); 
          setIsEnabled(response.enableMfa);
        } catch (error) {
          toast.error(t("mfaFetchFailed"));
        } 
      };
      fetchMfaStatus();
    }
  }, [open]);

  const handleClose = () => {
    dispatch(closeMfaDialog());
  };
 
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfigurationValue('EnableMFA', isEnabled);
      toast.success(
        isEnabled
          ? t('mfaUpdateSuccessEnabled')
          : t('mfaUpdateSuccessDisabled')
      );      
      handleClose();
    } catch (error) {
      toast.error(t('mfaUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle
            id="form-dialog-title"
            className="text-xl font-bold text-center text-white"
            sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #2575ee 100%)'
            }}>
             {t('manageMultiFactorAuthentication')}
        </DialogTitle>
      <DialogContent>
        <Box
            sx={{
                display:'flex',
                justifyContent:'center',
                mt: 3,
            }}
        >
            <FormControlLabel
            control={
                <Switch
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                disabled={saving}
                />
            }
             label={isEnabled ? t('mfaEnabled') : t('mfaDisabled')}
            />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSave} disabled={saving} variant="contained">
          {saving ? <CircularProgress size={24} /> : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
export default EnabledMfaDialog;