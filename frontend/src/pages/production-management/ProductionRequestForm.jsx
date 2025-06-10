import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import productionService from "../../api/productionService"; // Import production service

const ProductionRequestForm = () => {
  const { id } = useParams(); // Get request ID from URL for edit mode
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    requestId: "", // Keep it for edit mode loading, but not for new creation
    productName: "",
    quantity: "",
    priority: "normal", // Default priority changed from medium to normal
    status: "received", // Default status for new requests, changed from pending to received
  });

  useEffect(() => {
    // console.log("ProductionRequestForm rendered. ID from params:", id);
    if (id) {
      setIsEditMode(true);
      fetchRequestData(id);
    } else {
      setIsEditMode(false);
      setLoading(false); // No request to load for create mode
      // Generate requestId for new requests here, if not in edit mode
      setFormData((prev) => ({
        ...prev,
        requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`, // Auto-generate 4-digit ID
      }));
    }
  }, [id]);

  const fetchRequestData = async (requestId) => {
    try {
      const data = await productionService.getRequestById(requestId);
      const fetchedRequest = data;
      setRequest(fetchedRequest);
      setFormData({
        requestId: fetchedRequest.requestId || "",
        productName: fetchedRequest.productName || "",
        quantity: fetchedRequest.quantity || "",
        priority: fetchedRequest.priority || "normal", // Ensure fetched priority defaults to normal if invalid
        status: fetchedRequest.status || "received",
      });
    } catch (err) {
      console.error("Error fetching request data:", err);
      setError("Gagal memuat data permintaan produksi.");
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

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
      };

      // No need to generate requestId here, it's handled in useEffect
      // console.log("Payload being sent to backend:", payload); // Removed console.log

      if (isEditMode) {
        await productionService.updateRequest(id, payload);
      } else {
        await productionService.createRequest(payload);
      }

      setTimeout(() => {
        navigate("/production-requests"); // Redirect back to requests list
      }, 0);
    } catch (err) {
      console.error("Error saving request:", err);
      setError("Gagal menyimpan permintaan produksi.");
    } finally {
      setLoading(false);
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
                    ? `Edit Request: ${request?.productName}`
                    : "Create New Production Request"}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {isEditMode
                    ? "Modify request details and settings"
                    : "Set up a new production request"}
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
          onClick={() => navigate("/production-requests")}
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: "grey.100",
            },
          }}
        >
          Back to Production Requests
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
          <Box p={{ xs: 3, sm: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Request Details
            </Typography>
            <Grid container spacing={3}>
              {isEditMode && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Request ID"
                    name="requestId"
                    value={formData.requestId}
                    onChange={handleInputChange}
                    disabled
                  />
                </Grid>
              )}
              <Grid item xs={12} md={isEditMode ? 6 : 12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority-select"
                    name="priority"
                    value={formData.priority}
                    label="Priority"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {isEditMode && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status-select"
                      name="status"
                      value={formData.status}
                      label="Status"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="received">Received</MenuItem>
                      <MenuItem value="planned">Planned</MenuItem>
                      <MenuItem value="in_production">In Production</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>
          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              pt: 0,
              borderTop: "1px solid",
              borderColor: "grey.200",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
            >
              {isEditMode ? "Update Request" : "Create Request"}
            </Button>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
};

export default ProductionRequestForm;
