import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Build as BuildIcon,
} from "@mui/icons-material";
import batchService from "../../api/batchService"; // Import the new service

const ProductionStepsManager = ({ batchId, onStepsChange }) => {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [formData, setFormData] = useState({
    stepName: "",
    stepOrder: "",
    machineType: "",
    notes: "",
  });

  useEffect(() => {
    if (batchId) {
      fetchSteps();
    }
  }, [batchId]);

  const fetchSteps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await batchService.getBatchSteps(batchId); // Use service
      setSteps(data);
      if (onStepsChange) onStepsChange(data);
    } catch (err) {
      console.error("Error fetching steps:", err);
      setError("Failed to fetch production steps");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStep = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      await batchService.createProductionStep(batchId, {
        ...formData,
        stepOrder: parseInt(formData.stepOrder),
      });

      setOpenDialog(false);
      resetForm();
      await fetchSteps(); // Make sure to wait for the fetch to complete
    } catch (err) {
      console.error("Error creating step:", err);
      setError(
        err.response?.data?.message || "Failed to create production step"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStep = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      await batchService.updateProductionStep(batchId, editingStep.id, {
        ...formData,
        stepOrder: parseInt(formData.stepOrder),
      });

      setOpenDialog(false);
      resetForm();
      await fetchSteps(); // Make sure to wait for the fetch to complete
    } catch (err) {
      console.error("Error updating step:", err);
      setError(
        err.response?.data?.message || "Failed to update production step"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (window.confirm("Are you sure you want to delete this step?")) {
      try {
        setLoading(true);
        await batchService.deleteProductionStep(batchId, stepId); // Use service
        fetchSteps();
      } catch (err) {
        console.error("Error deleting step:", err);
        setError("Failed to delete production step");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartStep = async (stepId) => {
    try {
      setLoading(true);
      await batchService.startProductionStep(batchId, stepId, {
        machineId: null, // Can be extended to select machine
        operatorId: null, // Can be extended to select operator
      }); // Use service
      fetchSteps();
    } catch (err) {
      console.error("Error starting step:", err);
      setError("Failed to start production step");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStep = async (stepId) => {
    try {
      setLoading(true);
      await batchService.completeProductionStep(batchId, stepId, {
        notes: "Step completed successfully",
      }); // Use service
      fetchSteps();
    } catch (err) {
      console.error("Error completing step:", err);
      setError("Failed to complete production step");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStep = (step) => {
    setEditingStep(step);
    setFormData({
      stepName: step.stepName,
      stepOrder: step.stepOrder.toString(),
      machineType: step.machineType || "",
      notes: step.notes || "",
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      stepName: "",
      stepOrder: "",
      machineType: "",
      notes: "",
    });
    setEditingStep(null);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending" },
      scheduled: { color: "info", label: "Scheduled" },
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && steps.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
              <BuildIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Production Steps
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            sx={{ borderRadius: 2 }}
          >
            Add Step
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {steps.length === 0 ? (
          <Alert severity="info" variant="outlined">
            No production steps defined. Click "Add Step" to create the first
            step.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Step Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Machine Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {steps.map((step) => (
                  <TableRow key={step.id}>
                    <TableCell>
                      <Typography
                        variant="h6"
                        color="primary.main"
                        sx={{ fontWeight: 700 }}
                      >
                        {step.stepOrder}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {step.stepName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {step.machineType || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(step.status)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {step.status === "pending" && (
                          <Tooltip title="Start Step">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStartStep(step.id)}
                            >
                              <StartIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {step.status === "in_progress" && (
                          <Tooltip title="Complete Step">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleCompleteStep(step.id)}
                            >
                              <CompleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {step.status === "completed" ? (
                          <Tooltip title="Cannot edit completed step">
                            <span>
                              <IconButton size="small" color="info" disabled>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleEditStep(step)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {step.status === "in_progress" ||
                        step.status === "completed" ? (
                          <Tooltip title="Cannot delete step that is in progress or completed">
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
                              onClick={() => handleDeleteStep(step.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create/Edit Step Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          disableEscapeKeyDown={loading}
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
          // Fix accessibility issues
          aria-labelledby="step-dialog-title"
          aria-describedby="step-dialog-description"
        >
          <DialogTitle id="step-dialog-title">
            {editingStep ? "Edit Production Step" : "Create Production Step"}
          </DialogTitle>
          <DialogContent id="step-dialog-description">
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Step Name"
                  value={formData.stepName}
                  onChange={(e) =>
                    setFormData({ ...formData, stepName: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Step Order"
                  type="number"
                  value={formData.stepOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, stepOrder: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={loading}>
                  <InputLabel>Machine Type</InputLabel>
                  <Select
                    value={formData.machineType}
                    onChange={(e) =>
                      setFormData({ ...formData, machineType: e.target.value })
                    }
                    label="Machine Type"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="cutting">Cutting Machine</MenuItem>
                    <MenuItem value="drilling">Drilling Machine</MenuItem>
                    <MenuItem value="milling">Milling Machine</MenuItem>
                    <MenuItem value="turning">Turning Machine</MenuItem>
                    <MenuItem value="grinding">Grinding Machine</MenuItem>
                    <MenuItem value="molding">Molding Machine</MenuItem>
                    <MenuItem value="assembly">Assembly Station</MenuItem>
                    <MenuItem value="inspection">Inspection Station</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={editingStep ? handleUpdateStep : handleCreateStep}
              disabled={loading || !formData.stepName || !formData.stepOrder}
              startIcon={loading && <CircularProgress size={16} />}
            >
              {loading ? "Processing..." : editingStep ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProductionStepsManager;
