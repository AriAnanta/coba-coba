import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { GET_FEEDBACK, UPDATE_FEEDBACK } from '../../graphql/productionFeedback';
import { PageHeader } from '../../components/common';

const EditProductionFeedbackForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID dari parameter URL
  
  const [formData, setFormData] = useState({
    batchId: '',
    productName: '',
    plannedQuantity: 0,
    actualQuantity: 0,
    notes: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Query untuk mendapatkan data feedback berdasarkan ID
  const { loading: fetchLoading, error: fetchError, data } = useQuery(GET_FEEDBACK, {
    variables: { id },
    onCompleted: (data) => {
      if (data && data.getFeedbackById) {
        // Mengisi form dengan data yang sudah ada
        setFormData({
          batchId: data.getFeedbackById.batchId || '',
          productName: data.getFeedbackById.productName || '',
          plannedQuantity: data.getFeedbackById.plannedQuantity || 0,
          actualQuantity: data.getFeedbackById.actualQuantity || 0,
          notes: data.getFeedbackById.notes || '',
        });
      }
    },
    onError: (error) => {
      setError(`Error fetching feedback data: ${error.message}`);
    },
  });

  // Mutation untuk mengupdate production feedback
  const [updateFeedback, { loading: updateLoading }] = useMutation(UPDATE_FEEDBACK, {
    onCompleted: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate('/feedback');
      }, 2000);
    },
    onError: (error) => {
      setError(`Error updating feedback: ${error.message}`);
    },
  });

  // Handle perubahan pada form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.batchId || !formData.productName || formData.plannedQuantity <= 0) {
      setError('Please fill all required fields');
      return;
    }

    // Buat input untuk mutation
    const input = {
      batchId: String(formData.batchId), // Konversi ke string untuk memastikan tipe data sesuai
      productName: formData.productName,
      plannedQuantity: parseInt(formData.plannedQuantity),
      actualQuantity: parseInt(formData.actualQuantity) || 0,
      notes: formData.notes,
    };

    // Panggil mutation
    updateFeedback({ variables: { id, input } });
  };

  if (fetchLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading feedback data: {fetchError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Edit Production Feedback" />
      
      <Paper sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Production feedback updated successfully! Redirecting...
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Production Feedback Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Batch ID"
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                disabled={updateLoading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                disabled={updateLoading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Planned Quantity"
                name="plannedQuantity"
                type="number"
                value={formData.plannedQuantity}
                onChange={handleChange}
                disabled={updateLoading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Actual Quantity"
                name="actualQuantity"
                type="number"
                value={formData.actualQuantity}
                onChange={handleChange}
                disabled={updateLoading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                disabled={updateLoading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={updateLoading}
                  sx={{ mr: 2 }}
                >
                  {updateLoading ? <CircularProgress size={24} /> : 'Update Feedback'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/feedback')}
                  disabled={updateLoading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditProductionFeedbackForm;