import { Box } from '@mui/material';

/**
 * Komponen TabPanel untuk menampilkan konten tab dalam komponen Tab Material UI.
 * 
 * @param {Object} props - Props komponen
 * @param {ReactNode} props.children - Konten tab
 * @param {number} props.value - Nilai tab saat ini
 * @param {number} props.index - Indeks tab
 * @param {string} props.dir - Arah teks (ltr, rtl)
 * @param {Object} props.sx - Style tambahan untuk tab panel
 * @returns {JSX.Element} Komponen TabPanel
 */
const TabPanel = ({
  children,
  value,
  index,
  dir,
  sx = {},
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      dir={dir}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3, ...sx }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * Fungsi untuk mendapatkan properti yang diperlukan untuk tab.
 * 
 * @param {number} index - Indeks tab
 * @returns {Object} Properti tab
 */
export const a11yProps = (index) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
};

export default TabPanel;