import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  IconButton, 
  Menu, 
  MenuItem, 
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  Stack,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
  AccessTime as QueueIcon,
} from '@mui/icons-material';
import { machineQueueAPI } from '../../services/api';

const QueueManagement = () => {
  const navigate = useNavigate();
  const [queueItems, setQueueItems] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [machineFilter, setMachineFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQueueId, setSelectedQueueId] = useState(null);

  useEffect(() => {
    fetchQueueItems();
    fetchMachines();
  }, []);

  const fetchQueueItems = async () => {
    try {
      setLoading(true);
      const response = await machineQueueAPI.getAllQueues();
      const data = response.data.data || response.data || [];
      setQueueItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching queue items:', error);
      setError('Failed to fetch queue items');
      setQueueItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await machineQueueAPI.getAllMachines();
      const data = response.data.data || response.data || [];
      setMachines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching machines:', error);
      setMachines([]);
    }
  };

  const handleMenuClick = (event, queueId) => {
    setAnchorEl(event.currentTarget);
    setSelectedQueueId(queueId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQueueId(null);
  };

  const handleEditClick = () => {
    navigate(`/queue/${selectedQueueId}/edit`);
    handleMenuClose();
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this queue item?')) {
      try {
        await machineQueueAPI.deleteQueue(selectedQueueId);
        fetchQueueItems();
      } catch (error) {
        console.error('Error deleting queue item:', error);
        setError('Failed to delete queue item');
      }
    }
    handleMenuClose();
  };

  const handleStartClick = async () => {
    try {
      await machineQueueAPI.updateQueueStatus(selectedQueueId, 'in_progress');
      fetchQueueItems();
    } catch (error) {
      console.error('Error starting queue item:', error);
      setError('Failed to start queue item');
    }
    handleMenuClose();
  };

  const handleCompleteClick = async () => {
    try {
      await machineQueueAPI.updateQueueStatus(selectedQueueId, 'completed');
      fetchQueueItems();
    } catch (error) {
      console.error('Error completing queue item:', error);
      setError('Failed to complete queue item');
    }
    handleMenuClose();
  };

  const handleCancelClick = async () => {
    try {
      await machineQueueAPI.updateQueueStatus(selectedQueueId, 'cancelled');
      fetchQueueItems();
    } catch (error) {
      console.error('Error cancelling queue item:', error);
      setError('Failed to cancel queue item');
    }
    handleMenuClose();
  };

  const getSelectedQueue = () => {
    return queueItems.find(queue => queue.id === selectedQueueId);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      waiting: { color: "warning", label: "Waiting", bgcolor: "#fff3e0" },
      in_progress: { color: "primary", label: "In Progress", bgcolor: "#e8f4fd" },
      completed: { color: "success", label: "Completed", bgcolor: "#e8f5e8" },
      cancelled: { color: "error", label: "Cancelled", bgcolor: "#ffebee" },
      paused: { color: "default", label: "Paused", bgcolor: "#f5f5f5" },
    };
    
    const config = statusConfig[status] || { color: "default", label: status, bgcolor: "#f5f5f5" };
    return (
      <Chip 
        label={config.label} 
        size="small" 
        sx={{ 
          fontWeight: 500,
          bgcolor: config.bgcolor,
          color: config.color === 'default' ? 'text.primary' : `${config.color}.main`,
          border: `1px solid`,
          borderColor: config.color === 'default' ? 'grey.300' : `${config.color}.light`,
        }} 
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      low: { color: "success", label: "Low", bgcolor: "#e8f5e8" },
      normal: { color: "info", label: "Normal", bgcolor: "#e3f2fd" },
      high: { color: "warning", label: "High", bgcolor: "#fff3e0" },
      urgent: { color: "error", label: "Urgent", bgcolor: "#ffebee" },
    };
    
    const config = priorityConfig[priority] || { color: "default", label: priority, bgcolor: "#f5f5f5" };
    return (
      <Chip 
        label={config.label} 
        size="small" 
        sx={{ 
          fontWeight: 500,
          bgcolor: config.bgcolor,
          color: `${config.color}.main`,
          border: `1px solid ${config.color}.light`,
        }} 
      />
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredQueueItems = queueItems.filter(queue =>
    (queue.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     queue.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     queue.machine?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter ? queue.status === statusFilter : true) &&
    (machineFilter ? queue.machine?.id === machineFilter : true)
  );

  const paginatedQueueItems = filteredQueueItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '100%',
      mx: 'auto', 
      p: { xs: 2, sm: 3 },
      overflow: 'hidden'
    }}>
      {/* Header Section */}
      <Fade in timeout={600}>
        <Card 
          elevation={0}
          sx={{ 
            mb: 4, 
            background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
            color: 'white',
            borderRadius: 3,
            width: '100%',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 3, sm: 0 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    mr: { xs: 2, sm: 3 },
                  }}
                >
                  <QueueIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' },
                    color: 'text.primary'
                  }}>
                    Queue Management
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.8, color: 'text.secondary' }}>
                    Manage machine production queues and scheduling
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/queue/add')}
                fullWidth={{ xs: true, sm: false }}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,1)',
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Add Queue
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}

      <Grow in timeout={800}>
        <Paper sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          border: '1px solid', 
          borderColor: 'grey.200',
          width: '100%'
        }}>
          {/* Filters Section */}
          <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Queues"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm("")}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                    sx={{
                      bgcolor: 'white',
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="waiting">Waiting</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Machine</InputLabel>
                  <Select
                    value={machineFilter}
                    onChange={(e) => setMachineFilter(e.target.value)}
                    label="Machine"
                    sx={{
                      bgcolor: 'white',
                    }}
                  >
                    <MenuItem value="">All Machines</MenuItem>
                    {machines.map((machine) => (
                      <MenuItem key={machine.id} value={machine.id}>
                        {machine.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Table Section */}
          {queueItems.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No queue items available.
            </Alert>
          ) : (
            <>
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Queue ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Machine</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Batch</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Position</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Hours</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Scheduled Start</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedQueueItems.map((queue, index) => (
                      <Fade in timeout={300 + index * 100} key={queue.id}>
                        <TableRow
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'grey.50',
                              transform: 'scale(1.001)',
                              transition: 'all 0.2s ease-in-out',
                            },
                            '&:last-child td': { border: 0 },
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {queue.queueId}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {queue.machine?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {queue.productName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {queue.batchNumber}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {getStatusChip(queue.status)}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {getPriorityChip(queue.priority)}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={queue.position === 0 ? 'Active' : queue.position}
                              size="small"
                              variant="outlined"
                              color={queue.position === 0 ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {queue.hoursRequired}h
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {queue.scheduledStartTime 
                                ? new Date(queue.scheduledStartTime).toLocaleString()
                                : '-'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <IconButton
                              aria-label="more"
                              aria-controls="queue-menu"
                              aria-haspopup="true"
                              onClick={(event) => handleMenuClick(event, queue.id)}
                              size="small"
                              sx={{
                                '&:hover': {
                                  bgcolor: 'primary.light',
                                  color: 'white',
                                }
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredQueueItems.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'grey.50',
                }}
              />
            </>
          )}
        </Paper>
      </Grow>

      {/* Action Menu */}
      <Menu
        id="queue-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 48 * 6,
            width: '20ch',
          },
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        {getSelectedQueue()?.status === 'waiting' && (
          <MenuItem onClick={handleStartClick}>
            <StartIcon sx={{ mr: 1 }} /> Start
          </MenuItem>
        )}
        {getSelectedQueue()?.status === 'in_progress' && (
          <MenuItem onClick={handleCompleteClick}>
            <CompleteIcon sx={{ mr: 1 }} /> Complete
          </MenuItem>
        )}
        {['waiting', 'in_progress'].includes(getSelectedQueue()?.status) && (
          <MenuItem onClick={handleCancelClick}>
            <CancelIcon sx={{ mr: 1 }} /> Cancel
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default QueueManagement;