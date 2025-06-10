import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Komponen FormDialog untuk menampilkan dialog dengan form di dalamnya.
 * 
 * @param {Object} props - Props komponen
 * @param {boolean} props.open - Status dialog terbuka atau tidak
 * @param {string} props.title - Judul dialog
 * @param {ReactNode} props.children - Konten dialog (form)
 * @param {string} props.submitText - Teks tombol submit
 * @param {string} props.cancelText - Teks tombol cancel
 * @param {function} props.onSubmit - Fungsi yang dipanggil saat tombol submit ditekan
 * @param {function} props.onClose - Fungsi yang dipanggil saat dialog ditutup
 * @param {boolean} props.loading - Status loading
 * @param {boolean} props.disableSubmit - Status tombol submit dinonaktifkan
 * @param {string} props.maxWidth - Lebar maksimum dialog
 * @param {boolean} props.fullWidth - Dialog menggunakan lebar penuh
 * @param {Object} props.submitButtonProps - Props tambahan untuk tombol submit
 * @param {Object} props.cancelButtonProps - Props tambahan untuk tombol cancel
 * @returns {JSX.Element} Komponen FormDialog
 */
const FormDialog = ({
  open,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onSubmit,
  onClose,
  loading = false,
  disableSubmit = false,
  maxWidth = 'sm',
  fullWidth = true,
  submitButtonProps = {},
  cancelButtonProps = {},
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          {!loading && (
            <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          disabled={loading}
          {...cancelButtonProps}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onSubmit}
          color="primary"
          variant="contained"
          disabled={disableSubmit || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          {...submitButtonProps}
        >
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;