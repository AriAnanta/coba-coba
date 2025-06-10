import { useState, useEffect } from "react";
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
  TablePagination,
  Chip,
  IconButton,
  TextField,
  Grid,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import batchService from "../../api/batchService"; // Import the new service

/**
 * ProductionBatches Component
 *
 * Komponen untuk mengelola batch produksi. Memungkinkan penambahan, pengeditan, penghapusan, dan
 * melihat detail batch produksi.
 */
const ProductionBatches = () => {
  console.log("ProductionBatches component rendered.");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // New states for alert dialog
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertContent, setAlertContent] = useState("");

  useEffect(() => {
    console.log("ProductionBatches: useEffect triggered.");
    fetchBatches();
  }, [location.pathname]);

  /**
   * Mengambil daftar batch produksi dari API.
   */
  const fetchBatches = async () => {
    console.log(
      "ProductionBatches: fetchBatches started, setting loading to true."
    );
    try {
      setLoading(true);
      setError(null);
      const data = await batchService.getAllBatches(); // Use service
      setBatches(data);
      console.log(
        "ProductionBatches: Batches fetched successfully.",
        data.length,
        "items."
      );
    } catch (err) {
      console.error(
        "ProductionBatches: Error fetching production batches:",
        err
      );
      setError("Gagal memuat batch produksi");
    } finally {
      setLoading(false);
      console.log(
        "ProductionBatches: fetchBatches finished, setting loading to false."
      );
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending", bgcolor: "#fff3e0" },
      scheduled: { color: "info", label: "Scheduled", bgcolor: "#e3f2fd" },
      in_progress: {
        color: "primary",
        label: "In Progress",
        bgcolor: "#e8f4fd",
      },
      completed: { color: "success", label: "Completed", bgcolor: "#e8f5e8" },
      cancelled: { color: "error", label: "Cancelled", bgcolor: "#ffebee" },
    };

    const config = statusConfig[status] || {
      color: "default",
      label: status,
      bgcolor: "#f5f5f5",
    };
    return (
      <Chip
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

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      low: { color: "success", label: "Low", bgcolor: "#e8f5e8" },
      normal: { color: "info", label: "Normal", bgcolor: "#e3f2fd" },
      high: { color: "warning", label: "High", bgcolor: "#fff3e0" },
      urgent: { color: "error", label: "Urgent", bgcolor: "#ffebee" },
    };

    const config = priorityConfig[priority] || {
      color: "default",
      label: priority,
      bgcolor: "#f5f5f5",
    };
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

  const getProgressPercentage = (produced, total) => {
    return total > 0 ? Math.round((produced / total) * 100) : 0;
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (id) => {
    navigate(`/production-batches/${id}`);
  };

  const handleEditBatch = (id) => {
    navigate(`/production-batches/${id}`);
  };

  const handleDeleteBatch = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this batch? This action cannot be undone."
      )
    ) {
      try {
        setLoading(true);
        setError(null);
        await batchService.deleteBatch(id);
        fetchBatches();
      } catch (err) {
        if (err.response && err.response.status === 400) {
          const { message, steps, materialAllocations } = err.response.data;
          let content = message;

          if (steps && steps.length > 0) {
            content += "\n\nAssociated Steps:";
            steps.forEach((step) => {
              content += `\n- Step ID: ${step.id}, Name: ${step.stepName}, Status: ${step.status} (Order: ${step.stepOrder})`;
            });
          }

          if (materialAllocations && materialAllocations.length > 0) {
            content += "\n\nAssociated Material Allocations:";
            materialAllocations.forEach((ma) => {
              content += `\n- Material ID: ${ma.materialId}, Required: ${ma.quantityRequired}, Status: ${ma.status}`; // Adjusted to match backend response
            });
          }

          setAlertTitle("Cannot Delete Batch");
          setAlertContent(content);
          setOpenAlertDialog(true);
        } else {
          console.error("Error deleting batch:", err);
          setError("Gagal menghapus batch produksi.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartProduction = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await batchService.startProduction(id);
      fetchBatches();
    } catch (err) {
      console.error("Error starting production:", err);
      setError("Gagal memulai produksi batch.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(
    (batch) =>
      (batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (batch.request &&
          batch.request.productName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))) &&
      (filterStatus ? batch.status === filterStatus : true)
  );

  const paginatedBatches = filteredBatches.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  console.log(
    "ProductionBatches: Current loading state before render check:",
    loading
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
                    Production Batches
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Manage and track production batches
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate("/production-batches/add")}
                fullWidth={window.innerWidth < 600}
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
                New Batch
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
                  label="Search Batches"
                  value={searchTerm}
                  onChange={handleSearchChange}
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
                    onChange={handleFilterStatusChange}
                    label="Status Filter"
                    sx={{
                      bgcolor: "white",
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Table Section */}
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Batch Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Priority
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Scheduled Start
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Scheduled End
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBatches.map((batch, index) => (
                  <Fade in timeout={300 + index * 100} key={batch.id}>
                    <TableRow
                      sx={{
                        "&:hover": {
                          bgcolor: "grey.50",
                          transform: "scale(1.001)",
                          transition: "all 0.2s ease-in-out",
                        },
                        "&:last-child td": { border: 0 },
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "primary.main" }}
                        >
                          {batch.batchNumber}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {batch.request ? batch.request.productName : "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Request ID:{" "}
                            {batch.request ? batch.request.requestId : "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {batch.quantity.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {getPriorityChip(
                          batch.request ? batch.request.priority : "normal"
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {getStatusChip(batch.status)}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2">
                          {batch.scheduledStartDate
                            ? new Date(
                                batch.scheduledStartDate
                              ).toLocaleDateString()
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2">
                          {batch.scheduledEndDate
                            ? new Date(
                                batch.scheduledEndDate
                              ).toLocaleDateString()
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Stack direction="row" spacing={1}>
                          {(batch.status === "pending" ||
                            batch.status === "scheduled") && (
                            <Tooltip title="Start Production">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleStartProduction(batch.id)}
                                sx={{
                                  "&:hover": {
                                    bgcolor: "success.light",
                                    color: "white",
                                  },
                                }}
                              >
                                <StartIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewDetails(batch.id)}
                              sx={{
                                "&:hover": {
                                  bgcolor: "primary.light",
                                  color: "white",
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() =>
                                navigate(`/production-batches/${batch.id}/edit`)
                              }
                              sx={{
                                "&:hover": {
                                  bgcolor: "info.light",
                                  color: "white",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {batch.status === "in_progress" ||
                          batch.status === "completed" ? (
                            <Tooltip title="Cannot delete active or completed batches">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled
                                  sx={{
                                    "&:hover": {
                                      bgcolor: "error.light",
                                      color: "white",
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteBatch(batch.id)}
                                sx={{
                                  "&:hover": {
                                    bgcolor: "error.light",
                                    color: "white",
                                  },
                                }}
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
          </Box>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredBatches.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: "1px solid",
              borderColor: "grey.200",
              bgcolor: "grey.50",
            }}
          />
        </Paper>
      </Grow>

      {/* Alert Dialog for Delete Errors */}
      <Dialog
        open={openAlertDialog}
        onClose={() => setOpenAlertDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
        // Fix accessibility issues
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            bgcolor: "error.main",
            color: "white",
            py: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {alertTitle}
          </Typography>
        </DialogTitle>
        <DialogContent id="alert-dialog-description" sx={{ p: 4 }}>
          <Typography component="pre" sx={{ whiteSpace: "pre-wrap" }}>
            {alertContent}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: "grey.50" }}>
          <Button
            onClick={() => setOpenAlertDialog(false)}
            variant="contained"
            size="large"
            sx={{ px: 4 }}
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionBatches;
