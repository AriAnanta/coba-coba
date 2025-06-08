import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import productionService from "../../api/productionService";

const ProductionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productionService.getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching production requests:", err);
      setError("Failed to load production requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (
      window.confirm("Are you sure you want to delete this production request?")
    ) {
      try {
        setLoading(true);
        await productionService.deleteRequest(requestId);
        fetchRequests();
      } catch (err) {
        console.error("Error deleting production request:", err);
        setError("Failed to delete production request");
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      received: { color: "info", label: "Received" },
      planned: { color: "warning", label: "Planned" },
      in_production: { color: "primary", label: "In Production" },
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

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      low: { color: "success", label: "Low" },
      normal: { color: "info", label: "Normal" },
      high: { color: "warning", label: "High" },
      urgent: { color: "error", label: "Urgent" },
    };

    const config = priorityConfig[priority] || {
      color: "default",
      label: priority,
    };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const filteredRequests = requests.filter(
    (request) =>
      (request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.productName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus ? request.status === filterStatus : true)
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

  if (error) {
    return (
      <Fade in>
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      </Fade>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
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
                  <AssignmentIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                    Production Requests
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Manage production requests and orders
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate("/production-requests/add")}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                New Request
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Grow in timeout={800}>
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.200",
            width: "100%",
          }}
        >
          {/* Filters Section */}
          <Box
            sx={{
              p: 3,
              bgcolor: "grey.50",
              borderBottom: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search Requests"
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
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status Filter"
                    sx={{
                      bgcolor: "white",
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="received">Received</MenuItem>
                    <MenuItem value="planned">Planned</MenuItem>
                    <MenuItem value="in_production">In Production</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Request ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Priority
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request, index) => (
                  <Fade in timeout={300 + index * 100} key={request.id}>
                    <TableRow
                      sx={{
                        "&:hover": {
                          bgcolor: "grey.50",
                        },
                        "&:last-child td": { border: 0 },
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "primary.main" }}
                        >
                          {request.requestId}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {request.productName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {request.quantity.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {getStatusChip(request.status)}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {getPriorityChip(request.priority)}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                navigate(`/production-requests/${request.id}`)
                              }
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() =>
                                navigate(
                                  `/production-requests/${request.id}/edit`
                                )
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {request.status !== "received" ? (
                            <Tooltip title="Can only delete requests with 'received' status">
                              <span>
                                <IconButton size="small" color="error" disabled>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteRequest(request.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grow>
    </Box>
  );
};

export default ProductionRequests;
