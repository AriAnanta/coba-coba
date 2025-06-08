import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  Box,
  Typography,
  Toolbar,
  IconButton,
  Tooltip,
  alpha,
  Chip,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import EmptyState from './EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  totalCount = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  sortBy,
  sortDirection,
  selectable = false,
  selectedRows = [],
  onSelectRows,
  onSelectAllRows,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onRowClick,
  loading = false,
  emptyStateProps,
  toolbarTitle,
  toolbarActions,
  rowActions = [],
  getRowId = (row) => row.id,
  stickyHeader = false,
  maxHeight,
  dense = false,
  hideToolbar = false,
  hidePagination = false,
  customRowComponent,
  customCellComponent,
  rowsPerPageOptions = [5, 10, 25, 50],
  showFirstLastPageButtons = true,
  disableSorting = false,
  highlightOnHover = true,
  paperProps = {},
  tableContainerProps = {},
  tableProps = {},
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  
  const handleSelectAllClick = (event) => {
    if (onSelectAllRows) {
      onSelectAllRows(event.target.checked);
    }
  };

  const handleRowSelect = (event, id) => {
    event.stopPropagation();
    if (onSelectRows) {
      const selectedIndex = selectedRows.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = [...selectedRows, id];
      } else {
        newSelected = selectedRows.filter(rowId => rowId !== id);
      }

      onSelectRows(newSelected);
    }
  };

  const handleRowClick = (event, row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleViewClick = (event, row) => {
    event.stopPropagation();
    if (onViewRow) {
      onViewRow(row);
    }
  };

  const handleEditClick = (event, row) => {
    event.stopPropagation();
    if (onEditRow) {
      onEditRow(row);
    }
  };

  const handleDeleteClick = (event, row) => {
    event.stopPropagation();
    if (onDeleteRow) {
      onDeleteRow(row);
    }
  };

  const handleMenuOpen = (event, row) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveRow(null);
  };

  const handleActionClick = (action, row) => {
    handleMenuClose();
    if (action.onClick) {
      action.onClick(row);
    }
  };

  const handleSort = (property) => {
    if (disableSorting) return;
    
    const isAsc = sortBy === property && sortDirection === 'asc';
    const direction = isAsc ? 'desc' : 'asc';
    
    if (onSort) {
      onSort(property, direction);
    }
  };

  const isSelected = (id) => selectedRows.indexOf(id) !== -1;

  // Render loading state
  if (loading) {
    return (
      <Paper {...paperProps} sx={{ width: '100%', mb: 2, ...paperProps.sx }}>
        {!hideToolbar && (
          <Toolbar
            sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
            }}
          >
            <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
              <Skeleton width="40%" />
            </Typography>
          </Toolbar>
        )}
        <TableContainer {...tableContainerProps} sx={{ maxHeight, ...tableContainerProps.sx }}>
          <Table
            {...tableProps}
            stickyHeader={stickyHeader}
            size={dense ? 'small' : 'medium'}
            sx={{ minWidth: 750, ...tableProps.sx }}
          >
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={24} height={24} />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.numeric ? 'right' : 'left'}
                    padding={column.disablePadding ? 'none' : 'normal'}
                    sortDirection={sortBy === column.id ? sortDirection : false}
                    width={column.width}
                    sx={column.sx}
                  >
                    <Skeleton width="80%" />
                  </TableCell>
                ))}
                {(onViewRow || onEditRow || onDeleteRow || rowActions.length > 0) && (
                  <TableCell align="right" padding="normal" width="120px">
                    <Skeleton width={80} />
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={index} hover>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rectangular" width={24} height={24} />
                    </TableCell>
                  )}
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      align={column.numeric ? 'right' : 'left'}
                      padding={column.disablePadding ? 'none' : 'normal'}
                    >
                      <Skeleton width={`${Math.floor(Math.random() * 50) + 30}%`} />
                    </TableCell>
                  ))}
                  {(onViewRow || onEditRow || onDeleteRow || rowActions.length > 0) && (
                    <TableCell align="right" padding="normal">
                      <Skeleton variant="rectangular" width={80} height={24} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!hidePagination && (
          <TablePagination
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            rowsPerPageOptions={rowsPerPageOptions}
            showFirstButton={showFirstLastPageButtons}
            showLastButton={showFirstLastPageButtons}
          />
        )}
      </Paper>
    );
  }

  // Render empty state
  if (!loading && (!data || data.length === 0)) {
    return (
      <Paper {...paperProps} sx={{ width: '100%', mb: 2, ...paperProps.sx }}>
        {!hideToolbar && toolbarTitle && (
          <Toolbar
            sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
            }}
          >
            <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
              {toolbarTitle}
            </Typography>
            {toolbarActions}
          </Toolbar>
        )}
        <EmptyState
          title="No data available"
          description="There are no items to display at the moment."
          height={300}
          paper={false}
          {...emptyStateProps}
        />
        {!hidePagination && (
          <TablePagination
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={rowsPerPageOptions}
            showFirstButton={showFirstLastPageButtons}
            showLastButton={showFirstLastPageButtons}
          />
        )}
      </Paper>
    );
  }

  // Render data table
  return (
    <Paper {...paperProps} sx={{ width: '100%', mb: 2, ...paperProps.sx }}>
      {!hideToolbar && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selectedRows.length > 0 && {
              bgcolor: (theme) =>
                alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            }),
          }}
        >
          {selectedRows.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selectedRows.length} selected
            </Typography>
          ) : (
            <Typography variant="h6" id="tableTitle" component="div" sx={{ flex: '1 1 100%' }}>
              {toolbarTitle}
            </Typography>
          )}

          {selectedRows.length > 0 ? (
            <Tooltip title="Delete">
              <IconButton onClick={() => onDeleteRow(selectedRows)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            toolbarActions
          )}
        </Toolbar>
      )}
      <TableContainer {...tableContainerProps} sx={{ maxHeight, ...tableContainerProps.sx }}>
        <Table
          {...tableProps}
          stickyHeader={stickyHeader}
          size={dense ? 'small' : 'medium'}
          sx={{ minWidth: 750, ...tableProps.sx }}
        >
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 && selectedRows.length < data.length
                    }
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all' }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.numeric ? 'right' : 'left'}
                  padding={column.disablePadding ? 'none' : 'normal'}
                  sortDirection={sortBy === column.id ? sortDirection : false}
                  width={column.width}
                  sx={column.sx}
                >
                  {column.sortable !== false && !disableSorting ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {(onViewRow || onEditRow || onDeleteRow || rowActions.length > 0) && (
                <TableCell align="right" padding="normal" width="120px">
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const id = getRowId(row);
              const isItemSelected = isSelected(id);
              const labelId = `table-checkbox-${index}`;

              if (customRowComponent) {
                return customRowComponent({
                  row,
                  index,
                  isSelected: isItemSelected,
                  onSelect: (event) => handleRowSelect(event, id),
                  columns,
                  labelId,
                });
              }

              return (
                <TableRow
                  hover={highlightOnHover}
                  onClick={(event) => handleRowClick(event, row)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={id}
                  selected={isItemSelected}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={(event) => handleRowSelect(event, id)}
                        inputProps={{ 'aria-labelledby': labelId }}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = row[column.id];
                    
                    if (customCellComponent) {
                      return customCellComponent({
                        column,
                        row,
                        value,
                      });
                    }

                    return (
                      <TableCell
                        key={column.id}
                        align={column.numeric ? 'right' : 'left'}
                        padding={column.disablePadding ? 'none' : 'normal'}
                      >
                        {column.render ? column.render(value, row) : value}
                      </TableCell>
                    );
                  })}
                  {(onViewRow || onEditRow || onDeleteRow || rowActions.length > 0) && (
                    <TableCell align="right" padding="normal">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {onViewRow && (
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={(event) => handleViewClick(event, row)}
                              sx={{ ml: 1 }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEditRow && (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={(event) => handleEditClick(event, row)}
                              sx={{ ml: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDeleteRow && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(event) => handleDeleteClick(event, row)}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {rowActions.length > 0 && (
                          <Tooltip title="More actions">
                            <IconButton
                              size="small"
                              onClick={(event) => handleMenuOpen(event, row)}
                              sx={{ ml: 1 }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {!hidePagination && (
        <TablePagination
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={rowsPerPageOptions}
          showFirstButton={showFirstLastPageButtons}
          showLastButton={showFirstLastPageButtons}
        />
      )}
    </Paper>
  );
};

export default DataTable;