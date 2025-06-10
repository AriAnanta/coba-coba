import { Chip } from '@mui/material';

/**
 * Komponen StatusBadge untuk menampilkan status dalam bentuk badge dengan warna yang sesuai.
 * 
 * @param {Object} props - Props komponen
 * @param {string} props.status - Status yang akan ditampilkan
 * @param {Object} props.statusMap - Pemetaan status ke konfigurasi warna dan label
 * @param {string} props.size - Ukuran badge (small, medium)
 * @param {string} props.variant - Variant badge (filled, outlined)
 * @param {Object} props.sx - Style tambahan untuk badge
 * @returns {JSX.Element} Komponen StatusBadge
 */
const StatusBadge = ({
  status,
  statusMap = {
    active: { color: 'success', label: 'Active' },
    inactive: { color: 'error', label: 'Inactive' },
    pending: { color: 'warning', label: 'Pending' },
    completed: { color: 'success', label: 'Completed' },
    inProgress: { color: 'info', label: 'In Progress' },
    cancelled: { color: 'error', label: 'Cancelled' },
    draft: { color: 'default', label: 'Draft' },
  },
  size = 'small',
  variant = 'filled',
  sx = {},
}) => {
  // Mendapatkan konfigurasi status dari statusMap atau menggunakan default
  const statusConfig = statusMap[status] || { color: 'default', label: status };
  
  return (
    <Chip
      label={statusConfig.label}
      color={statusConfig.color}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 'medium',
        textTransform: 'capitalize',
        ...sx,
      }}
    />
  );
};

export default StatusBadge;