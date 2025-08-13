import {Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Switch, CircularProgress, Box,} from '@mui/material';
import { useState } from 'react';
import { updateConfigurationValue } from '../api/configurationApi';
import { toast } from 'react-toastify';
import useLanguage from '../hooks/useLanguage';
 
interface EnabledMfaDialogProps {
  open: boolean;
  onClose: () => void;
}
 
const EnabledMfaDialog: React.FC<EnabledMfaDialogProps> = ({ open, onClose }) => {
  const { t } = useLanguage();
  const [isEnabled, setIsEnabled] = useState(false); 
  const [saving, setSaving] = useState(false);
 
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfigurationValue('EnableMFA', isEnabled);
      toast.success(
        isEnabled
          ? t('mfaUpdateSuccessEnabled')
          : t('mfaUpdateSuccessDisabled')
      );      
      onClose();
    } catch (error) {
      toast.error(t('mfaUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
        <Button onClick={onClose} disabled={saving}>
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