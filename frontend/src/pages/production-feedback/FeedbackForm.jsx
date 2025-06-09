import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
  Slider,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Factory as FactoryIcon,
  Category as ProductIcon,
  ShoppingCart as MarketplaceIcon,
  Note as NoteIcon,
} from "@mui/icons-material";
import feedbackService from "../../api/feedbackService";

const FeedbackForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    feedbackId: "",
    productionId: "",
    batchId: "",
    productId: "",
    status: "pending",
    startDate: null,
    endDate: null,
    expectedQuantity: "",
    actualQuantity: "",
    defectiveQuantity: "",
    completionPercentage: 0,
    qualityScore: "",
    notes: "",
    marketplaceUpdateStatus: "not_required",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchFeedbackDetails();
    }
  }, [id]);

  const fetchFeedbackDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedbackService.getFeedbackById(id);
      const feedbackData = response.data || response;
      
      // Format dates for form inputs
      const formattedData = {
        ...feedbackData,
        startDate: feedbackData.startDate ? new Date(feedbackData.startDate) : null,
        endDate: feedbackData.endDate ? new Date(feedbackData.endDate) : null,
      };
      
      setFormData(formattedData);
    } catch (err) {
      setError("Failed to fetch feedback details.");
      console.error("Error fetching feedback details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSliderChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      completionPercentage: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      // Prepare data for submission
      const submissionData = {
        ...formData,
        expectedQuantity: formData.expectedQuantity
          ? parseInt(formData.expectedQuantity)
          : null,
        actualQuantity: formData.actualQuantity
          ? parseInt(formData.actualQuantity)
          : null,
        defectiveQuantity: formData.defectiveQuantity
          ? parseInt(formData.defectiveQuantity)
          : null,
        qualityScore: formData.qualityScore
          ? parseInt(formData.qualityScore)
          : null,
      };

      if (isEditMode) {
        await feedbackService.updateFeedback(id, submissionData);
        navigate(`/feedback/${id}`, {
          state: { message: "Feedback updated successfully" },
        });
      } else {
        const response = await feedbackService.createFeedback(submissionData);
        const newId = response.data?.id || response.id;
        navigate(`/feedback/${newId}`, {
          state: { message: "Feedback created successfully" },
        });
      }
    } catch (err) {
      setError(
        `Failed to ${isEditMode ? "update" : "create"} feedback. ${err.message}`
      );
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} feedback:`,
        err
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/feedback/${id}`);
    } else {
      navigate("/feedback");
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await feedbackService.deleteFeedback(id);
      setDeleteDialogOpen(false);
      navigate("/feedback", {
        state: { message: "Feedback deleted successfully" },
      });
    } catch (err) {
      setError("Failed to delete feedback.");
      console.error("Error deleting feedback:", err);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
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

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/feedback")}
        >
          Back to Feedback List
        </Button>
        {isEditMode && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? "Edit Feedback" : "Create New Feedback"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardHeader
                  title="Basic Information"
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <AssignmentIcon />
                    </Avatar>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Feedback ID"
                        name="feedbackId"
                        value={formData.feedbackId}
                        onChange={handleInputChange}
                        disabled={isEditMode}
                        helperText={
                          isEditMode
                            ? "Feedback ID cannot be changed"
                            : "Enter a unique identifier for this feedback"
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Production ID"
                        name="productionId"
                        value={formData.productionId}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Batch ID"
                        name="batchId"
                        value={formData.batchId}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Product ID"
                        name="productId"
                        value={formData.productId}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                          labelId="status-label"
                          id="status"
                          name="status"
                          value={formData.status}
                          label="Status"
                          onChange={handleInputChange}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="issue">Issue</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardHeader
                  title="Production Details"
                  avatar={
                    <Avatar sx={{ bgcolor: "secondary.main" }}>
                      <FactoryIcon />
                    </Avatar>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={formData.startDate}
                          onChange={(date) => handleDateChange("startDate", date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              variant: "outlined",
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="End Date"
                          value={formData.endDate}
                          onChange={(date) => handleDateChange("endDate", date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              variant: "outlined",
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography id="completion-slider-label" gutterBottom>
                        Completion Percentage: {formData.completionPercentage}%
                      </Typography>
                      <Slider
                        aria-labelledby="completion-slider-label"
                        value={formData.completionPercentage}
                        onChange={handleSliderChange}
                        valueLabelDisplay="auto"
                        step={5}
                        marks
                        min={0}
                        max={100}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardHeader
                  title="Quality Information"
                  avatar={
                    <Avatar sx={{ bgcolor: "success.main" }}>
                      <AssignmentIcon />
                    </Avatar>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Expected Quantity"
                        name="expectedQuantity"
                        type="number"
                        value={formData.expectedQuantity}
                        onChange={handleInputChange}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Actual Quantity"
                        name="actualQuantity"
                        type="number"
                        value={formData.actualQuantity}
                        onChange={handleInputChange}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Defective Quantity"
                        name="defectiveQuantity"
                        type="number"
                        value={formData.defectiveQuantity}
                        onChange={handleInputChange}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Quality Score (0-10)"
                        name="qualityScore"
                        type="number"
                        value={formData.qualityScore}
                        onChange={handleInputChange}
                        inputProps={{ min: 0, max: 10 }}
                        helperText="Rate the quality from 0 to 10"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="marketplace-status-label">
                          Marketplace Update Status
                        </InputLabel>
                        <Select
                          labelId="marketplace-status-label"
                          id="marketplaceUpdateStatus"
                          name="marketplaceUpdateStatus"
                          value={formData.marketplaceUpdateStatus}
                          label="Marketplace Update Status"
                          onChange={handleInputChange}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="updated">Updated</MenuItem>
                          <MenuItem value="not_required">Not Required</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardHeader
                  title="Notes"
                  avatar={
                    <Avatar sx={{ bgcolor: "info.main" }}>
                      <NoteIcon />
                    </Avatar>
                  }
                />
                <Divider />
                <CardContent>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    multiline
                    rows={4}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter any additional notes or comments about this feedback"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} />
                  ) : isEditMode ? (
                    "Update Feedback"
                  ) : (
                    "Create Feedback"
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Feedback Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this feedback? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackForm;