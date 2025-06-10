import { useState } from 'react';
import {
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TextField,
  Box,
  Button,
  Divider,
  Typography,
  IconButton,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

/**
 * Komponen FilterChip untuk menampilkan dan mengelola filter dalam bentuk chip.
 * 
 * @param {Object} props - Props komponen
 * @param {string} props.label - Label filter
 * @param {Array} props.options - Opsi filter
 * @param {Array} props.selectedValues - Nilai yang dipilih
 * @param {function} props.onChange - Fungsi yang dipanggil saat nilai berubah
 * @param {boolean} props.multiple - Apakah dapat memilih banyak nilai
 * @param {boolean} props.searchable - Apakah dapat mencari opsi
 * @param {string} props.color - Warna chip
 * @param {string} props.size - Ukuran chip
 * @param {Object} props.sx - Style tambahan untuk chip
 * @returns {JSX.Element} Komponen FilterChip
 */
const FilterChip = ({
  label,
  options = [],
  selectedValues = [],
  onChange,
  multiple = true,
  searchable = false,
  color = 'default',
  size = 'medium',
  sx = {},
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const open = Boolean(anchorEl);

  // Menangani klik pada chip
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Menangani penutupan menu
  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  // Menangani perubahan nilai
  const handleValueChange = (value) => {
    let newSelectedValues;

    if (multiple) {
      if (selectedValues.includes(value)) {
        newSelectedValues = selectedValues.filter(v => v !== value);
      } else {
        newSelectedValues = [...selectedValues, value];
      }
    } else {
      newSelectedValues = [value];
      handleClose();
    }

    if (onChange) {
      onChange(newSelectedValues);
    }
  };

  // Menangani reset filter
  const handleReset = () => {
    if (onChange) {
      onChange([]);
    }
    handleClose();
  };

  // Menangani pencarian
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter opsi berdasarkan pencarian
  const filteredOptions = searchQuery
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  // Mendapatkan label yang dipilih
  const getSelectedLabel = () => {
    if (selectedValues.length === 0) {
      return label;
    }

    if (selectedValues.length === 1) {
      const selectedOption = options.find(option => option.value === selectedValues[0]);
      return selectedOption ? `${label}: ${selectedOption.label}` : label;
    }

    return `${label}: ${selectedValues.length} dipilih`;
  };

  return (
    <>
      <Chip
        label={getSelectedLabel()}
        onClick={handleClick}
        onDelete={selectedValues.length > 0 ? handleReset : undefined}
        icon={<FilterIcon />}
        color={selectedValues.length > 0 ? color : 'default'}
        variant={selectedValues.length > 0 ? 'filled' : 'outlined'}
        size={size}
        sx={sx}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 250,
            maxHeight: 400,
            overflow: 'auto',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {label}
          </Typography>

          {searchable && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                size="small"
                placeholder="Cari..."
                value={searchQuery}
                onChange={handleSearchChange}
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: searchQuery ? (
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : null,
                }}
              />
            </Box>
          )}
        </Box>

        <Divider />

        {filteredOptions.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="Tidak ada opsi" />
          </MenuItem>
        ) : (
          filteredOptions.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <MenuItem
                key={option.value}
                onClick={() => handleValueChange(option.value)}
                dense
                sx={{ minHeight: 40 }}
              >
                {multiple ? (
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                    />
                  </ListItemIcon>
                ) : (
                  isSelected && (
                    <ListItemIcon>
                      <CheckIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                  )
                )}
                <ListItemText
                  primary={option.label}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </MenuItem>
            );
          })
        )}

        {multiple && selectedValues.length > 0 && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
              <Button size="small" onClick={handleReset} color="inherit">
                Reset
              </Button>
              <Button size="small" onClick={handleClose} color="primary" sx={{ ml: 1 }}>
                Selesai
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default FilterChip;