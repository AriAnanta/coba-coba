import { useState, useEffect } from 'react';
import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Komponen AlertMessage untuk menampilkan pesan peringatan atau informasi kepada pengguna.
 * 
 * @param {Object} props - Props komponen
 * @param {string} props.severity - Tingkat keparahan pesan (error, warning, info, success)
 * @param {string} props.title - Judul pesan
 * @param {string} props.message - Isi pesan
 * @param {boolean} props.open - Status pesan terbuka atau tidak
 * @param {function} props.onClose - Fungsi yang dipanggil saat pesan ditutup
 * @param {boolean} props.autoHideDuration - Durasi pesan ditampilkan sebelum otomatis tertutup (dalam milidetik)
 * @param {Object} props.sx - Style tambahan untuk pesan
 * @returns {JSX.Element} Komponen AlertMessage
 */
const AlertMessage = ({
  severity = 'info',
  title,
  message,
  open = false,
  onClose,
  autoHideDuration = 0, // 0 berarti tidak otomatis tertutup
  sx = {},
}) => {
  const [isOpen, setIsOpen] = useState(open);

  // Mengupdate state isOpen saat prop open berubah
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Mengatur auto hide jika autoHideDuration > 0
  useEffect(() => {
    if (autoHideDuration > 0 && isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        if (onClose) onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, isOpen, onClose]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <Collapse in={isOpen}>
      <Alert
        severity={severity}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{
          mb: 2,
          ...sx,
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Collapse>
  );
};

export default AlertMessage;