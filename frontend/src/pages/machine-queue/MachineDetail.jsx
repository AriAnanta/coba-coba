import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Avatar,
  Fade,
  Grow,
  Stack,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Settings as MachineIcon, // Changed from Precision to Settings
  Info as InfoIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { machineQueueAPI } from '../../services/api';

const MachineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMachineDetail();
    fetchMachineQueue();
  }, [id]);

  const fetchMachineDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await machineQueueAPI.getMachineById(id);
      setMachine(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching machine details:', err);
      setError('Failed to fetch machine details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMachineQueue = async () => {
    try {
      const response = await machineQueueAPI.getMachineQueue(id);
      setQueueItems(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching machine queue:', err);
      // Non-critical error, don't set main error state
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

  const getQueueStatusChip = (status) => {
    const statusConfig = {
      waiting: { color: "warning", label: "Waiting" },
      in_progress: { color: "primary", label: "In Progress" },
      completed: { color: "success", label: "Completed" },
      cancelled: { color: "error", label: "Cancelled" },
    };

    const config = statusConfig[status] || { color: "default", label: status };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

  if (error) {
    return (
      <Fade in>
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      </Fade>
    );
  }

  if (!machine) {
    return (
      <Fade in>
        <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
          Machine not found.
        </Alert>
      </Fade>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
        p: { xs: 2, sm: 3 },
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <Fade in timeout={600}>
        <Card
          elevation={0}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 3,
            width: "100%",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 3, sm: 0 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    mr: { xs: 2, sm: 3 },
                  }}
                >
                  <MachineIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: "1.75rem", sm: "2.125rem" },
                    }}
                  >
                    {machine.name}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Machine ID: {machine.machineId}
                  </Typography>
                </Box>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/machines")}
                  fullWidth={{ xs: true, sm: false }}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/machines/${id}/edit`)}
                  fullWidth={{ xs: true, sm: false }}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  Edit Machine
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Grid container spacing={4}>
        {/* Machine Information */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={800}>
            <Card
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <InfoIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Machine Information
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Status
                    </Typography>
                    <Box sx={{ mt: 1 }}>{getStatusChip(machine.status)}</Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {machine.type}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {machine.location || '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Manufacturer
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {machine.manufacturer || '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Model
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {machine.model || '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Capacity
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {machine.capacity && machine.capacityUnit 
                        ? `${machine.capacity} ${machine.capacityUnit}` 
                        : machine.capacity || '-'
                      }
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Technical Details */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1000}>
            <Card
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "info.main", mr: 2 }}>
                    <BuildIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Technical Details
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Serial Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {machine.serialNumber || '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Installation Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(machine.installationDate)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Maintenance Schedule
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {machine.maintenanceSchedule || '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Specifications
                    </Typography>
                    <Typography variant="body1">
                      {machine.specifications || 'No specifications available'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {machine.notes || 'No additional notes'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Current Queue */}
        <Grid item xs={12}>
          <Grow in timeout={1200}>
            <Card sx={{ border: "1px solid", borderColor: "grey.200" }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Current Production Queue
                  </Typography>
                </Box>

                {queueItems && queueItems.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Batch</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Hours Required</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {queueItems.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Chip 
                                label={item.position === 0 ? 'Active' : item.position}
                                size="small"
                                color={item.position === 0 ? 'success' : 'default'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {item.productName}
                            </TableCell>
                            <TableCell>{item.batchNumber}</TableCell>
                            <TableCell>{getQueueStatusChip(item.status)}</TableCell>
                            <TableCell>
                              <Chip
                                label={item.priority}
                                size="small"
                                color={
                                  item.priority === 'urgent' ? 'error' :
                                  item.priority === 'high' ? 'warning' :
                                  item.priority === 'normal' ? 'info' : 'success'
                                }
                              />
                            </TableCell>
                            <TableCell>{item.hoursRequired}h</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info" variant="outlined">
                    No items currently in the production queue for this machine.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MachineDetail;