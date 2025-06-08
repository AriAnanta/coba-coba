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
  Divider,
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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import batchService from "../../api/batchService";
import ProductionStepsManager from "./ProductionStepsManager";
import MaterialAllocationsManager from "./MaterialAllocationsManager";

const ProductionBatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchBatchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch data from backend API
        const data = await batchService.getBatchById(id);
        if (data) {
          setBatch(data);
        } else {
          setError("Batch not found");
        }
      } catch (err) {
        console.error("Error fetching batch details:", err);
        setError("Failed to fetch batch details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBatchDetail();
  }, [id]);

  const handleStepsChange = (updatedSteps) => {
    setSteps(updatedSteps);
  };

  const handleMaterialsChange = (updatedMaterials) => {
    setMaterials(updatedMaterials);
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

  if (!batch) {
    return (
      <Fade in>
        <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
          No batch details found.
        </Alert>
      </Fade>
    );
  }

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
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
                  Batch: {batch.batchNumber}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Production batch details and tracking
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

      <Grid container spacing={4}>
        {/* Batch Information */}
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
                    <AssignmentIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Batch Information
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Batch Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {batch.batchNumber}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Status
                    </Typography>
                    <Box sx={{ mt: 1 }}>{getStatusChip(batch.status)}</Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Quantity
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {batch.quantity.toLocaleString()}
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
                      {batch.notes || "No notes available"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Schedule Information */}
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
                    <ScheduleIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Schedule Information
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Scheduled Start Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(batch.scheduledStartDate)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Scheduled End Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(batch.scheduledEndDate)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Production Request */}
        <Grid item xs={12}>
          <Grow in timeout={1200}>
            <Card sx={{ border: "1px solid", borderColor: "grey.200" }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Production Request
                  </Typography>
                </Box>

                {batch.request ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Request ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {batch.request.requestId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Product Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {batch.request.productName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Customer ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {batch.request.customerId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Priority
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {batch.request.priority}
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="warning" variant="outlined">
                    No associated production request found.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Production Steps */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1400}>
            <Card
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}>
                    <BuildIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Production Steps
                  </Typography>
                </Box>

                {batch.steps && batch.steps.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {batch.steps.map((step, index) => (
                      <ListItem key={step.id} sx={{ px: 0, py: 2 }}>
                        <ListItemIcon>
                          <Typography
                            variant="h6"
                            color="primary.main"
                            sx={{ fontWeight: 700 }}
                          >
                            {step.stepOrder}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {step.stepName}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Machine: {step.machineType || "N/A"}
                              </Typography>
                              <Chip
                                label={step.status}
                                size="small"
                                color={
                                  step.status === "completed"
                                    ? "success"
                                    : "primary"
                                }
                                sx={{ mt: 1, fontWeight: 500 }}
                              />
                            </Box>
                          }
                          secondaryTypographyProps={{ component: "div" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info" variant="outlined">
                    No production steps defined for this batch.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Material Allocations */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1600}>
            <Card
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
                    <InventoryIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Material Allocations
                  </Typography>
                </Box>

                {batch.materialAllocations &&
                batch.materialAllocations.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {batch.materialAllocations.map((material) => (
                      <ListItem key={material.id} sx={{ px: 0, py: 2 }}>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              Material ID: {material.materialId}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Required: {material.quantityRequired}{" "}
                                {material.unitOfMeasure}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Allocated: {material.quantityAllocated}{" "}
                                {material.unitOfMeasure}
                              </Typography>
                              <Chip
                                label={material.status}
                                size="small"
                                color={
                                  material.status === "allocated"
                                    ? "success"
                                    : "warning"
                                }
                                sx={{ mt: 1, fontWeight: 500 }}
                              />
                            </Box>
                          }
                          secondaryTypographyProps={{ component: "div" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info" variant="outlined">
                    No material allocations for this batch.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Production Steps Manager */}
      <ProductionStepsManager batchId={id} onStepsChange={handleStepsChange} />

      {/* Material Allocations Manager */}
      <MaterialAllocationsManager
        batchId={id}
        onMaterialsChange={handleMaterialsChange}
      />
    </Box>
  );
};

export default ProductionBatchDetail;
