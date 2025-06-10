import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Snackbar
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import {
  GET_QUANTITY_STOCK,
  CREATE_QUANTITY_STOCK,
  UPDATE_QUANTITY_STOCK
} from '../../graphql/quantityStock';
import { GET_FEEDBACKS } from '../../graphql/productionFeedback';

const QuantityStockForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    quantity: 0,
    reorderPoint: '',
    status: 'received'
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get quantity stock data if in edit mode
  const { loading: stockLoading, error: stockError, data: stockData } = useQuery(
    GET_QUANTITY_STOCK,
    {
      variables: { id },
      skip: !isEditMode,
      fetchPolicy: 'network-only'
    }
  );

  // Get feedbacks for dropdown
  const { loading: feedbacksLoading, data: feedbacksData } = useQuery(GET_FEEDBACKS, {
    variables: {
      pagination: { page: 1, limit: 100 },
      filters: {}
    }
  });

  // Create quantity stock mutation
  const [createQuantityStock, { loading: createLoading }] = useMutation(CREATE_QUANTITY_STOCK, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: 'Stock created successfully',
        severity: 'success'
      });
      setTimeout(() => navigate('/feedback/quantity-stock'), 2000);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error creating stock: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // Update quantity stock mutation
  const [updateQuantityStock, { loading: updateLoading }] = useMutation(UPDATE_QUANTITY_STOCK, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: 'Stock updated successfully',
        severity: 'success'
      });
      setTimeout(() => navigate('/feedback/quantity-stock'), 2000);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error updating stock: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // Populate form with data when in edit mode
  useEffect(() => {
    if (isEditMode && stockData?.getQuantityStockById) {
      const stock = stockData.getQuantityStockById;
      setFormData({
        productName: stock.productName || '',
        quantity: stock.quantity || 0,
        reorderPoint: stock.reorderPoint || '',
        status: stock.status || 'received'
      });
    }
  }, [isEditMode, stockData]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    
    if (formData.quantity === '' || isNaN(formData.quantity)) {
      newErrors.quantity = 'Quantity must be a number';
    } else if (parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    
    if (formData.reorderPoint !== '' && isNaN(formData.reorderPoint)) {
      newErrors.reorderPoint = 'Reorder point must be a number';
    } else if (formData.reorderPoint !== '' && parseInt(formData.reorderPoint) < 0) {
      newErrors.reorderPoint = 'Reorder point cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const input = {
      productName: formData.productName,
      quantity: parseInt(formData.quantity),
      status: formData.status
    };
    
    if (formData.reorderPoint) {
      input.reorderPoint = parseInt(formData.reorderPoint);
    }
    
    if (isEditMode) {
      updateQuantityStock({
        variables: {
          id,
          quantity: parseInt(formData.quantity),
          reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : null,
          status: formData.status
        }
      });
    } else {
      createQuantityStock({
        variables: { input }
      });
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate('/feedback/quantity-stock');
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show loading state
  if (isEditMode && stockLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (isEditMode && stockError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading stock data: {stockError.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit' : 'Create'} Quantity Stock
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                error={Boolean(errors.productName)}
                helperText={errors.productName}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                error={Boolean(errors.quantity)}
                helperText={errors.quantity}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reorder Point"
                name="reorderPoint"
                type="number"
                value={formData.reorderPoint}
                onChange={handleChange}
                error={Boolean(errors.reorderPoint)}
                helperText={errors.reorderPoint || 'Optional: Set a threshold for low stock alerts'}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  required
                >
                  <MenuItem value="received">Received</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="in_transit">In Transit</MenuItem>
                  <MenuItem value="returned">Returned</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Removed feedbackId dropdown as relation is now based on productName */}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={createLoading || updateLoading}
                >
                  {createLoading || updateLoading ? (
                    <CircularProgress size={24} />
                  ) : isEditMode ? (
                    'Update Stock'
                  ) : (
                    'Create Stock'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

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

export default QuantityStockForm;