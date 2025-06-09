import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Stack,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
  Feedback as FeedbackIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  ErrorOutline as IssueIcon,
  Schedule as ScheduleIcon,
  ShoppingCart as MarketplaceIcon,
} from "@mui/icons-material";
import feedbackService from "../../api/feedbackService";

const FeedbackList = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedbackService.getAllFeedback();
      setFeedbacks(response.data || response || []);
    } catch (err) {
      setError("Failed to fetch production feedbacks.");
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await feedbackService.deleteFeedback(id);
        fetchFeedbacks(); // Refresh the list after deletion
      } catch (err) {
        setError("Failed to delete feedback.");
        console.error("Error deleting feedback:", err);
      }
    }
  };

  const handleMenuOpen = (event, feedbackId) => {
    setAnchorEl(event.currentTarget);
    setSelectedFeedbackId(feedbackId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFeedbackId(null);
  };

  const handleViewDetails = (id) => {
    navigate(`/feedback/${id}`);
    handleMenuClose();
  };

  const handleEditFeedback = (id) => {
    navigate(`/feedback/${id}/edit`);
    handleMenuClose();
  };

  const handleCreateFeedback = () => {
    navigate("/feedback/create");
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: {
        color: "warning",
        label: "Pending",
        bgcolor: "#fff3e0",
        icon: <PendingIcon fontSize="small" />,
      },
      in_progress: {
        color: "info",
        label: "In Progress",
        bgcolor: "#e3f2fd",
        icon: <ScheduleIcon fontSize="small" />,
      },
      completed: {
        color: "success",
        label: "Completed",
        bgcolor: "#e8f5e9",
        icon: <CompletedIcon fontSize="small" />,
      },
      issue: {
        color: "error",
        label: "Issue",
        bgcolor: "#ffebee",
        icon: <IssueIcon fontSize="small" />,
      },
    };

    const config = statusConfig[status] || {
      color: "default",
      label: status,
      bgcolor: "#f5f5f5",
      icon: <FeedbackIcon fontSize="small" />,
    };

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          fontWeight: 500,
          bgcolor: config.bgcolor,
          color:
            config.color === "default"
              ? "text.primary"
              : `${config.color}.main`,
          border: `1px solid`,
          borderColor:
            config.color === "default" ? "grey.300" : `${config.color}.light`,
        }}
      />
    );
  };

  const getMarketplaceChip = (marketplaceStatus) => {
    const statusConfig = {
      pending: {
        color: "warning",
        label: "Pending",
        bgcolor: "#fff3e0",
      },
      updated: {
        color: "success",
        label: "Updated",
        bgcolor: "#e8f5e9",
      },
      not_required: {
        color: "default",
        label: "N/A",
        bgcolor: "#f5f5f5",
      },
    };

    const config = statusConfig[marketplaceStatus] || {
      color: "default",
      label: marketplaceStatus || "N/A",
      bgcolor: "#f5f5f5",
    };

    return (
      <Chip
        icon={<MarketplaceIcon fontSize="small" />}
        label={config.label}
        size="small"
        sx={{
          fontWeight: 500,
          bgcolor: config.bgcolor,
          color:
            config.color === "default"
              ? "text.primary"
              : `${config.color}.main`,
          border: `1px solid`,
          borderColor:
            config.color === "default" ? "grey.300" : `${config.color}.light`,
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

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.feedbackId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.productionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.batchId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.productId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || feedback.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedFeedbacks = filteredFeedbacks.slice(
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
    <Box sx={{ width: "100%", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Production Feedback
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateFeedback}
        >
          New Feedback
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by ID, Production ID, Batch ID..."
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
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="issue">Issue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  gap: 1,
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={fetchFeedbacks}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          <Table stickyHeader aria-label="production feedback table">
            <TableHead>
              <TableRow>
                <TableCell>Feedback ID</TableCell>
                <TableCell>Production ID</TableCell>
                <TableCell>Batch ID</TableCell>
                <TableCell>Product ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Completion</TableCell>
                <TableCell>Quality Score</TableCell>
                <TableCell>Marketplace</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedFeedbacks.length > 0 ? (
                paginatedFeedbacks.map((feedback) => (
                  <TableRow
                    key={feedback.id || feedback.feedbackId}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>{feedback.feedbackId}</TableCell>
                    <TableCell>{feedback.productionId}</TableCell>
                    <TableCell>{feedback.batchId}</TableCell>
                    <TableCell>{feedback.productId}</TableCell>
                    <TableCell>{getStatusChip(feedback.status)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ width: "100%", mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={feedback.completionPercentage || 0}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              bgcolor: "#e0e0e0",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 5,
                              },
                            }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >{`${Math.round(
                            feedback.completionPercentage || 0
                          )}%`}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {feedback.qualityScore ? (
                        <Chip
                          label={`${feedback.qualityScore}/10`}
                          size="small"
                          color={
                            feedback.qualityScore >= 8
                              ? "success"
                              : feedback.qualityScore >= 6
                              ? "warning"
                              : "error"
                          }
                          variant="outlined"
                        />
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {getMarketplaceChip(feedback.marketplaceUpdateStatus)}
                    </TableCell>
                    <TableCell>
                      {feedback.startDate
                        ? new Date(feedback.startDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {feedback.endDate
                        ? new Date(feedback.endDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              handleViewDetails(
                                feedback.id || feedback.feedbackId
                              )
                            }
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Feedback">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() =>
                              handleEditFeedback(
                                feedback.id || feedback.feedbackId
                              )
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) =>
                            handleMenuOpen(
                              e,
                              feedback.id || feedback.feedbackId
                            )
                          }
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      {searchTerm || statusFilter !== "all"
                        ? "No matching feedback found"
                        : "No feedback records available"}
                    </Typography>
                    {searchTerm || statusFilter !== "all" ? (
                      <Button
                        variant="text"
                        startIcon={<ClearIcon />}
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                        }}
                        sx={{ mt: 1 }}
                      >
                        Clear Filters
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateFeedback}
                        sx={{ mt: 1 }}
                      >
                        Create First Feedback
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredFeedbacks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => handleViewDetails(selectedFeedbackId)}
          dense
        >
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => handleEditFeedback(selectedFeedbackId)}
          dense
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Feedback
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            handleDeleteFeedback(selectedFeedbackId);
          }}
          dense
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete Feedback
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FeedbackList;