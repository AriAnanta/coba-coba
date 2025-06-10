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
import { useNavigate } from 'react-router-dom';
import { useMutation, useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import axios from 'axios';
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
  const [completedBatches, setCompletedBatches] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Mengambil data batch yang sudah selesai dari machine_queue service
  useEffect(() => {
    const fetchCompletedBatches = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5003/api/queues?status=completed');
        console.log('API Response:', response.data); // Tambahkan log untuk debugging
        
        if (response.data && response.data.success) {
          // Mengelompokkan data berdasarkan batch_id untuk menghindari duplikasi
          const batchMap = {};
          
          // Pastikan response.data.data adalah array sebelum menggunakan forEach
          if (Array.isArray(response.data.data)) {
            response.data.data.forEach(queue => {
              // Periksa properti yang tersedia di objek queue
              console.log('Queue item:', queue);
              
              // Gunakan properti yang benar (batchId atau batch_id)
              const batchIdValue = queue.batchId || queue.batch_id;
              const productNameValue = queue.productName || queue.product_name;
              
              if (batchIdValue && !batchMap[batchIdValue]) {
                batchMap[batchIdValue] = {
                  batchId: batchIdValue,
                  productName: productNameValue,
                };
              }
            });
            
            // Konversi map ke array
            const uniqueBatches = Object.values(batchMap);
            console.log('Unique Batches:', uniqueBatches); // Tambahkan log untuk debugging
            setCompletedBatches(uniqueBatches);
          } else {
            console.error('Response data is not an array:', response.data.data);
            setError('Invalid data format received from server');
          }
        } else {
          console.error('API response error:', response.data);
          setError('Failed to load completed batches. Invalid response format.');
        }
      } catch (error) {
        console.error('Error fetching completed batches:', error);
        setError('Failed to load completed batches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedBatches();
  }, []);

  // Handle perubahan pada form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle perubahan batch
  const handleBatchChange = (e) => {
    const selectedBatchId = e.target.value;
    const selectedBatch = completedBatches.find(batch => batch.batchId === selectedBatchId);
    
    if (selectedBatch) {
      setFormData({
        ...formData,
        batchId: selectedBatch.batchId,
        productName: selectedBatch.productName,
      });
    } else {
      setFormData({
        ...formData,
        batchId: selectedBatchId,
        productName: '',
      });
    }
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
              <FormControl fullWidth>
                <InputLabel id="batch-select-label">Batch ID</InputLabel>
                <Select
                  labelId="batch-select-label"
                  id="batch-select"
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleBatchChange}
                  disabled={createLoading || loading}
                  label="Batch ID"
                  required
                >
                  {loading ? (
                    <MenuItem disabled>Loading batches...</MenuItem>
                  ) : completedBatches.length > 0 ? (
                    completedBatches.map((batch) => (
                      <MenuItem key={batch.batchId} value={batch.batchId}>
                        {batch.batchId} - {batch.productName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No completed batches found</MenuItem>
                  )}
                </Select>
              </FormControl>
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