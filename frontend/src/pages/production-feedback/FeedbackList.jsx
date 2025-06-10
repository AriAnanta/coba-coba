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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Visibility as VisibilityIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FEEDBACKS, DELETE_FEEDBACK, GET_FEEDBACK } from '../../graphql/productionFeedback';
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
  
  // State untuk dialog konfirmasi delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  
  // State untuk dialog detail
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  
  // Query untuk mendapatkan daftar production feedback
  const { loading, error, data, refetch } = useQuery(GET_FEEDBACKS, {
    variables: {
      filters: {},
      pagination: { page: 1, limit: 10 },
    },
  });
  
  // Query untuk mendapatkan detail feedback
  const { data: feedbackDetail, loading: detailLoading } = useQuery(GET_FEEDBACK, {
    variables: { id: selectedFeedbackId },
    skip: !selectedFeedbackId,
  });

  // Mutation untuk menghapus feedback
  const [deleteFeedback, { loading: deleteLoading }] = useMutation(DELETE_FEEDBACK, {
    onCompleted: () => {
      // Tutup dialog dan refresh data
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting feedback:', error);
      // Tampilkan pesan error jika diperlukan
    }
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
    setSelectedFeedbackId(id);
    setDetailDialogOpen(true);
  };
  
  // Handle edit feedback
  const handleEditFeedback = (id) => {
    navigate(`/feedback/edit/${id}`);
  };
  
  // Handle delete feedback
  const handleDeleteClick = (feedback) => {
    setFeedbackToDelete(feedback);
    setDeleteDialogOpen(true);
  };
  
  // Konfirmasi delete feedback
  const confirmDelete = () => {
    if (feedbackToDelete) {
      deleteFeedback({ variables: { id: feedbackToDelete.id } });
    }
  };
  
  // Tutup dialog detail
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedFeedbackId(null);
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
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewFeedback(feedback.id)}
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditFeedback(feedback.id)}
                          title="Edit Feedback"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(feedback)}
                          title="Delete Feedback"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Dialog konfirmasi delete */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Konfirmasi Hapus
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Apakah Anda yakin ingin menghapus feedback {feedbackToDelete?.feedbackId} untuk batch {feedbackToDelete?.batchId}?
            Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            Batal
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={24} /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog detail feedback */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detail Production Feedback
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : feedbackDetail?.getFeedbackById ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Informasi Umum</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Feedback ID</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{feedbackDetail.getFeedbackById.feedbackId}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Batch ID</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{feedbackDetail.getFeedbackById.batchId}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Produk</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{feedbackDetail.getFeedbackById.productName}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Chip
                          label={feedbackDetail.getFeedbackById.status}
                          color={getStatusColor(feedbackDetail.getFeedbackById.status)}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Informasi Produksi</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Planned Quantity</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{feedbackDetail.getFeedbackById.plannedQuantity}</Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Actual Quantity</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{feedbackDetail.getFeedbackById.actualQuantity || '-'}</Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Defect Quantity</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{feedbackDetail.getFeedbackById.defectQuantity || '-'}</Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Start Date</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {feedbackDetail.getFeedbackById.startDate 
                            ? new Date(feedbackDetail.getFeedbackById.startDate).toLocaleDateString() 
                            : '-'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">End Date</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {feedbackDetail.getFeedbackById.endDate 
                            ? new Date(feedbackDetail.getFeedbackById.endDate).toLocaleDateString() 
                            : '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Catatan</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2">
                      {feedbackDetail.getFeedbackById.notes || 'Tidak ada catatan'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Informasi Tambahan</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={1}>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">Dibuat Oleh</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">{feedbackDetail.getFeedbackById.createdBy || '-'}</Typography>
                      </Grid>
                      
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">Diperbarui Oleh</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">{feedbackDetail.getFeedbackById.updatedBy || '-'}</Typography>
                      </Grid>
                      
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">Tanggal Dibuat</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">
                          {new Date(feedbackDetail.getFeedbackById.createdAt).toLocaleString()}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">Tanggal Diperbarui</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">
                          {new Date(feedbackDetail.getFeedbackById.updatedAt).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography>Data tidak ditemukan</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Tutup</Button>
          {feedbackDetail?.getFeedbackById && (
            <Button 
              color="primary" 
              onClick={() => {
                handleCloseDetailDialog();
                handleEditFeedback(feedbackDetail.getFeedbackById.id);
              }}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackList;