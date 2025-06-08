import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Chip,
  Avatar,
  Fade,
  Grow,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import productionService from "../../api/productionService";

const ProductionRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productionService.getRequestById(id);
        if (data) {
          setRequest(data);
        } else {
          setError("Request not found");
        }
      } catch (err) {
        console.error("Error fetching request details:", err);
        setError("Failed to fetch request details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetail();
  }, [id]);

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

  if (!request) {
    return (
      <Fade in>
        <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
          No request details found.
        </Alert>
      </Fade>
    );
  }

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
        sx={{ fontWeight: 500 }}
      />
    );
  };

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
                  Request: {request.requestId}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Production request details and tracking
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

      {/* Request Information */}
      <Grow in timeout={800}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper
              sx={{
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Request Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Request ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {request.requestId}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Product Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {request.productName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Quantity
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {request.quantity.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Status
                      </Typography>
                      {getStatusChip(request.status)}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Priority
                      </Typography>
                      {getPriorityChip(request.priority)}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Quick Stats */}
              <Paper
                sx={{
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Quick Stats
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        Created:{" "}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <InventoryIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {request.quantity.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Paper>

              {/* Actions */}
              <Paper
                sx={{
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Actions
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() =>
                        navigate(
                          `/production-batches/add?requestId=${request.id}`
                        )
                      }
                      disabled={request.status !== "received"}
                    >
                      Create Batch
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() =>
                        navigate(`/production-requests/${request.id}/edit`)
                      }
                    >
                      Edit Request
                    </Button>
                  </Stack>
                </CardContent>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Grow>
    </Box>
  );
};

export default ProductionRequestDetail;
