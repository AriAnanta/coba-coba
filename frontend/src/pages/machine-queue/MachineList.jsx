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
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Paper,
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
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
  Settings as MachineIcon,
} from '@mui/icons-material';
import { machineQueueAPI } from '../../services/api';

const MachineList = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMachineId, setSelectedMachineId] = useState(null);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await machineQueueAPI.getAllMachines();
      setMachines(response.data || []);
    } catch (err) {
      setError('Failed to fetch machines.');
      console.error('Error fetching machines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMachine = async (id) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      try {
        await machineQueueAPI.deleteMachine(id);
        fetchMachines();
      } catch (err) {
        setError('Failed to delete machine.');
        console.error('Error deleting machine:', err);
      }
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      operational: { color: "success", label: "Operational", bgcolor: "#e8f5e8" },
      maintenance: { color: "warning", label: "Maintenance", bgcolor: "#fff3e0" },
      breakdown: { color: "error", label: "Breakdown", bgcolor: "#ffebee" },
      inactive: { color: "default", label: "Inactive", bgcolor: "#f5f5f5" },
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredMachines = machines.filter(machine =>
    machine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedMachines = filteredMachines.slice(
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  <MachineIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' }
                  }}>
                    Machine Management
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Manage and monitor production machines
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/machines/add')}
                fullWidth={{ xs: true, sm: false }}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Add Machine
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

      {/* Summary Cards */}
      <Fade in timeout={800}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Total Machines
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {machines.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Operational
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {machines.filter(m => m.status === 'operational').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Maintenance
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {machines.filter(m => m.status === 'maintenance').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Breakdown
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {machines.filter(m => m.status === 'breakdown').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      <Grow in timeout={1000}>
        <Paper sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          border: '1px solid', 
          borderColor: 'grey.200',
          width: '100%'
        }}>
          {/* Search Section */}
          <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200' }}>
            <TextField
              fullWidth
              label="Search Machines"
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
          </Box>

          {/* Table Section */}
          {machines.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No machines available.
            </Alert>
          ) : (
            <>
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Machine ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Manufacturer</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Capacity</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedMachines.map((machine, index) => (
                      <Fade in timeout={300 + index * 100} key={machine.id}>
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
                              {machine.machineId}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {machine.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1">
                              {machine.type}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {getStatusChip(machine.status)}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {machine.location || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {machine.manufacturer || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {machine.capacity && machine.capacityUnit 
                                ? `${machine.capacity} ${machine.capacityUnit}` 
                                : machine.capacity || '-'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/machines/${machine.id}`)}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: 'primary.light',
                                      color: 'white',
                                    }
                                  }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => navigate(`/machines/${machine.id}/edit`)}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: 'info.light',
                                      color: 'white',
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteMachine(machine.id)}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: 'error.light',
                                      color: 'white',
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
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
                count={filteredMachines.length}
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
    </Box>
  );
};

export default MachineList;