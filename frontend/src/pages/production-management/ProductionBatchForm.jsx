import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  Stack,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import batchService from "../../api/batchService"; // Import the new service
import productionService from "../../api/productionService"; // Import production service for requests

const ProductionBatchForm = () => {
  const { id } = useParams(); // Get batch ID from URL for edit mode
  const navigate = useNavigate();
  const location = useLocation();
  const [batch, setBatch] = useState(null);
  const [requests, setRequests] = useState([]); // To populate dropdown for requestId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    requestId: "",
    quantity: "",
    status: "pending", // Default status for new batches
  });

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const requestIdFromUrl = query.get("requestId");

    if (id) {
      setIsEditMode(true);
      fetchBatchData(id);
    } else {
      setIsEditMode(false);
      setLoading(false); // No batch to load for create mode
      if (requestIdFromUrl) {
        setFormData((prev) => ({ ...prev, requestId: requestIdFromUrl }));
      }
    }
    fetchProductionRequests(); // Fetch requests for dropdown in both modes
  }, [id, location.search]);

  const fetchBatchData = async (batchId) => {
    try {
      const data = await batchService.getBatchById(batchId); // Use batchService
      const fetchedBatch = data;
      setBatch(fetchedBatch);
      setFormData({
        requestId: fetchedBatch.requestId,
        quantity: fetchedBatch.quantity,
        status: fetchedBatch.status || "pending",
      });
    } catch (err) {
      console.error("Error fetching batch data:", err);
      setError("Gagal memuat data batch.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionRequests = async () => {
    try {
      const data = await productionService.getAllRequests(); // Use productionService
      setRequests(data);
    } catch (err) {
      console.error("Error fetching production requests for dropdown:", err);
      // Not critical, can still proceed without this data
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    console.log("formData before saving:", formData);
    try {
      setLoading(true);
      setError(null);
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
      };

      console.log("Payload being sent to batchService:", payload);

      if (isEditMode) {
        await batchService.updateBatch(id, payload); // Use batchService
      } else {
        // For creating a new batch, we need to send requestId
        if (!payload.requestId) {
          setError("Request ID is required for new batches.");
          setLoading(false);
          return;
        }
        await batchService.createBatch(payload); // Use batchService
      }

      // Defer navigation slightly to ensure state updates are processed
      setTimeout(() => {
        navigate("/production-batches"); // Redirect back to batches list
      }, 0);
    } catch (err) {
      console.error("Error saving batch:", err);
      setError("Gagal menyimpan batch produksi.");
    } finally {
      setLoading(false); // Ensure loading is always false after attempt
    }
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
                  {isEditMode
                    ? `Edit Batch: ${batch?.batchNumber}`
                    : "Create New Production Batch"}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {isEditMode
                    ? "Modify batch details and settings"
                    : "Set up a new production batch"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Navigation */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/production-batches")}
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: "grey.100",
            },
          }}
        >
          Back to Production Batches
        </Button>
      </Box>

      {/* Form Section */}
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
          <Box sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Batch Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Production Request</InputLabel>
                  <Select
                    name="requestId"
                    value={formData.requestId}
                    onChange={handleInputChange}
                    label="Production Request"
                    disabled={isEditMode}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    {requests.map((req) => (
                      <MenuItem key={req.id} value={req.id}>
                        {req.requestId} - {req.productName} ({req.quantity})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ px: 4 }}
                  >
                    {isEditMode ? "Save Changes" : "Create Batch"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/production-batches")}
                    sx={{ px: 4 }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
};

export default ProductionBatchForm;
