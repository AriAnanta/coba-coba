import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { PageHeader } from '../../components/common';

// Mutation untuk membuat production feedback
const CREATE_PRODUCTION_FEEDBACK = gql`
  mutation CreateFeedback($input: ProductionFeedbackInput!) {
    createFeedback(input: $input) {
      id
      feedbackId
      batchId
      status
      createdAt
    }
  }
`;

const ProductionFeedbackForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    batchId: '',
    productName: '',
    plannedQuantity: 0,
    actualQuantity: 0,
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Mutation untuk membuat production feedback
  const [createFeedback, { loading: createLoading }] = useMutation(CREATE_PRODUCTION_FEEDBACK, {
    onCompleted: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate('/feedback');
      }, 2000);
    },
    onError: (error) => {
      setError(`Error creating feedback: ${error.message}`);
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
      batchId: formData.batchId,
      productName: formData.productName,
      status: 'pending',
      plannedQuantity: parseInt(formData.plannedQuantity),
      actualQuantity: parseInt(formData.actualQuantity) || 0,
      notes: formData.notes,
    };

    // Panggil mutation
    createFeedback({ variables: { input } });
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Create Production Feedback" />
      
      <Paper sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Production feedback created successfully! Redirecting...
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
                disabled={createLoading}
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
                disabled={createLoading}
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
                disabled={createLoading}
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
                disabled={createLoading}
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
                disabled={createLoading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={createLoading}
                  sx={{ mr: 2 }}
                >
                  {createLoading ? <CircularProgress size={24} /> : 'Create Feedback'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/feedback')}
                  disabled={createLoading}
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

export default ProductionFeedbackForm;