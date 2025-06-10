import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  GET_QUANTITY_STOCKS,
  DELETE_QUANTITY_STOCK 
} from '../../graphql/quantityStock';

// Status chip colors
const statusColors = {
  received: 'success',
  cancelled: 'error',
  in_transit: 'warning',
  returned: 'info'
};

const QuantityStockList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    productName: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // GraphQL query to fetch quantity stocks
  const { loading, error, data, refetch } = useQuery(GET_QUANTITY_STOCKS, {
    variables: {
      pagination: {
        page: page + 1, // GraphQL uses 1-based indexing
        limit: rowsPerPage
      },
      filters: {
        status: filters.status || undefined,
        productName: filters.productName || undefined
      }
    },
    fetchPolicy: 'network-only'
  });

  // GraphQL mutation to delete a quantity stock
  const [deleteQuantityStock] = useMutation(DELETE_QUANTITY_STOCK, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: 'Stock deleted successfully',
        severity: 'success'
      });
      refetch();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error deleting stock: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

  // Apply filters
  const applyFilters = () => {
    setPage(0);
    refetch();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      productName: ''
    });
    setPage(0);
    refetch();
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (stock) => {
    setSelectedStock(stock);
    setOpenDeleteDialog(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedStock(null);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (selectedStock) {
      deleteQuantityStock({
        variables: { id: selectedStock.id }
      });
    }
    setOpenDeleteDialog(false);
  };

  // Navigate to create new stock page
  const handleCreateStock = () => {
    navigate('/feedback/quantity-stock/create');
  };

  // Navigate to edit stock page
  const handleEditStock = (id) => {
    navigate(`/feedback/quantity-stock/edit/${id}`);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quantity Stock Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateStock}
        >
          Add New Stock
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Product Name"
              name="productName"
              value={filters.productName}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="received">Received</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="in_transit">In Transit</MenuItem>
                <MenuItem value="returned">Returned</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={applyFilters}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading quantity stocks: {error.message}
        </Alert>
      )}

      {/* Data table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Reorder Point</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.getAllQuantityStocks?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No quantity stocks found
                  </TableCell>
                </TableRow>
              ) : (
                data?.getAllQuantityStocks?.items?.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell>{stock.id}</TableCell>
                    <TableCell>{stock.productName}</TableCell>
                    <TableCell align="right">{stock.quantity}</TableCell>
                    <TableCell align="right">{stock.reorderPoint || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={stock.status.replace('_', ' ').toUpperCase()} 
                        color={statusColors[stock.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(stock.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(stock.updatedAt).toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleEditStock(stock.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(stock)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {data?.getAllQuantityStocks && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.getAllQuantityStocks.totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the stock for "{selectedStock?.productName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuantityStockList;