import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_FEEDBACKS } from '../../graphql/productionFeedback';
import { PageHeader, SearchBar } from '../../components/common';

// Fungsi untuk mendapatkan warna chip berdasarkan status
const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_production':
      return 'primary';
    case 'on_hold':
      return 'warning';
    case 'cancelled':
      return 'error';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

const FeedbackList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Query untuk mendapatkan daftar production feedback
  const { loading, error, data } = useQuery(GET_FEEDBACKS, {
    variables: {
      filters: {},
      pagination: { page: 1, limit: 10 },
    },
  });

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Handle create new feedback
  const handleCreateFeedback = () => {
    navigate('/feedback/create');
  };

  // Handle view feedback detail
  const handleViewFeedback = (id) => {
    navigate(`/feedback/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Production Feedback" />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <SearchBar
          placeholder="Search by batch ID or product name"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateFeedback}
        >
          Create Feedback
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Feedback ID</TableCell>
                <TableCell>Batch ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Planned Qty</TableCell>
                <TableCell>Actual Qty</TableCell>
                {/* <TableCell>Created At</TableCell> */}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="error">Error loading data: {error.message}</Typography>
                  </TableCell>
                </TableRow>
              ) : data?.getAllFeedback?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>No feedback records found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.getAllFeedback?.items?.map((feedback) => (
                  <TableRow key={feedback.id} hover>
                    <TableCell>{feedback.feedbackId}</TableCell>
                    <TableCell>{feedback.batchId}</TableCell>
                    <TableCell>{feedback.productName}</TableCell>
                    <TableCell>
                      <Chip
                        label={feedback.status}
                        color={getStatusColor(feedback.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{feedback.plannedQuantity}</TableCell>
                    <TableCell>{feedback.actualQuantity || '-'}</TableCell>
                    {/* <TableCell>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </TableCell> */}
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewFeedback(feedback.id)}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default FeedbackList;