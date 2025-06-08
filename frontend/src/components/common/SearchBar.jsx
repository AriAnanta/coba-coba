import { useState, useEffect } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Divider,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const SearchBar = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  onClear,
  filters = [],
  selectedFilters = [],
  onFilterChange,
  width = '100%',
  showFilterButton = true,
  debounceTime = 300,
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Update local state when prop value changes
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) {
        onChange(searchValue);
      }
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue, onChange, debounceTime]);

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchValue);
    }
  };

  const handleClear = () => {
    setSearchValue('');
    if (onClear) {
      onClear();
    }
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (filter) => {
    if (onFilterChange) {
      const isSelected = selectedFilters.includes(filter.value);
      let newFilters;
      
      if (isSelected) {
        newFilters = selectedFilters.filter(f => f !== filter.value);
      } else {
        newFilters = [...selectedFilters, filter.value];
      }
      
      onFilterChange(newFilters);
    }
    // Don't close the menu to allow multiple selections
  };

  return (
    <Box sx={{ width, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Paper
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          borderRadius: 2,
        }}
        elevation={1}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          inputProps={{ 'aria-label': 'search' }}
        />
        {searchValue && (
          <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={handleClear}>
            <ClearIcon />
          </IconButton>
        )}

        {showFilterButton && filters.length > 0 && (
          <>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <Tooltip title="Filter">
              <IconButton 
                sx={{ p: '10px' }} 
                aria-label="filter"
                onClick={handleFilterClick}
                color={selectedFilters.length > 0 ? 'primary' : 'default'}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleFilterClose}
              PaperProps={{
                elevation: 3,
                sx: { minWidth: 200, maxHeight: 300, overflow: 'auto' },
              }}
            >
              {filters.map((filter) => {
                const isSelected = selectedFilters.includes(filter.value);
                return (
                  <MenuItem
                    key={filter.value}
                    onClick={() => handleFilterSelect(filter)}
                    selected={isSelected}
                  >
                    <ListItemIcon>
                      {isSelected ? <CheckIcon color="primary" /> : <Box sx={{ width: 24 }} />}
                    </ListItemIcon>
                    <ListItemText primary={filter.label} />
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        )}
      </Paper>

      {/* Display selected filters as chips */}
      {selectedFilters.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedFilters.map((filterValue) => {
            const filter = filters.find(f => f.value === filterValue);
            if (!filter) return null;
            
            return (
              <Chip
                key={filter.value}
                label={filter.label}
                onDelete={() => handleFilterSelect(filter)}
                color="primary"
                variant="outlined"
                size="small"
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;