import {Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Switch, CircularProgress, Box,} from '@mui/material';
import { useState } from 'react';
import { updateConfigurationValue } from '../api/configurationApi';
import { toast } from 'react-toastify';
 
interface EnabledMfaDialogProps {
  open: boolean;
  onClose: () => void;
}
 
const EnabledMfaDialog: React.FC<EnabledMfaDialogProps> = ({ open, onClose }) => {
  const [isEnabled, setIsEnabled] = useState(false); 
  const [saving, setSaving] = useState(false);
 
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfigurationValue('EnableMFA', isEnabled);
      toast.success(`Multi-Factor Authentication ${isEnabled ? 'enabled' : 'disabled'} successfully.`);
      onClose();
    } catch (error) {
      toast.error('Failed to update MFA setting.');
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
            Manage Multi-Factor Authentication
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
            label={isEnabled ? 'Enabled' : 'Disabled'}
            />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} variant="contained">
          {saving ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
export default EnabledMfaDialog;