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
  Container,
  Breadcrumbs,
  Link,
  LinearProgress,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import batchService from "../../api/batchService";
import ProductionStepsManager from "./ProductionStepsManager";
import MaterialAllocationsManager from "./MaterialAllocationsManager";

const ProductionBatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography
              variant="h6"
              sx={{ mt: 2, color: "text.secondary" }}
            >
              Loading batch details...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!batch) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No batch details found.
        </Alert>
      </Container>
    );
  }

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending", icon: "⏳" },
      scheduled: { color: "info", label: "Scheduled", icon: "📅" },
      in_progress: { color: "primary", label: "In Progress", icon: "⚡" },
      completed: { color: "success", label: "Completed", icon: "✅" },
      cancelled: { color: "error", label: "Cancelled", icon: "❌" },
    };

    const config = statusConfig[status] || {
      color: "default",
      label: status,
      icon: "📋",
    };
    return (
      <Chip
        label={`${config.icon} ${config.label}`}
        color={config.color}
        sx={{
          fontWeight: 600,
          px: 1,
          "& .MuiChip-label": {
            fontSize: "0.875rem",
          },
        }}
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

  const getProgressPercentage = () => {
    if (!batch.steps || batch.steps.length === 0) return 0;
    const completedSteps = batch.steps.filter(
      (step) => step.status === "completed"
    ).length;
    return Math.round((completedSteps / batch.steps.length) * 100);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            color="inherit"
            href="#"
            onClick={() => navigate("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Link
            color="inherit"
            href="#"
            onClick={() => navigate("/production-batches")}
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Production Batches
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {batch.batchNumber}
          </Typography>
        </Breadcrumbs>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/production-batches")}
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: "grey.100",
              color: "primary.main",
            },
            borderRadius: 2,
            px: 2,
          }}
        >
          Back to Production Batches
        </Button>
      </Box>

      {/* Hero Header Section */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 3,
          mb: 4,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "200px",
            height: "200px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
            transform: "translate(50%, -50%)",
          }}
        />
        <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 }, position: "relative" }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: { xs: 60, sm: 80 },
                    height: { xs: 60, sm: 80 },
                    mr: 3,
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                    }}
                  >
                    {batch.batchNumber}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    Production Batch Management
                  </Typography>
                  <Box sx={{ mt: 2 }}>{getStatusChip(batch.status)}</Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {batch.quantity?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                  Units to Produce
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                    Production Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage()}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        backgroundColor: "#4caf50",
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    {getProgressPercentage()}% Complete
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column - Batch Information */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={4}>
            {/* Quick Info Cards */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 3,
                    textAlign: "center",
                    background:
                      "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                  }}
                >
                  <Avatar
                    sx={{ bgcolor: "primary.main", mx: "auto", mb: 2 }}
                  >
                    <AssignmentIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {batch.batchNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Batch Number
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 3,
                    textAlign: "center",
                    background:
                      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                  }}
                >
                  <Avatar
                    sx={{ bgcolor: "warning.main", mx: "auto", mb: 2 }}
                  >
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {batch.quantity?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Quantity
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 3,
                    textAlign: "center",
                    background:
                      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                  }}
                >
                  <Avatar sx={{ bgcolor: "info.main", mx: "auto", mb: 2 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {batch.steps?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Production Steps
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 3,
                    textAlign: "center",
                    background:
                      "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
                  }}
                >
                  <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 2 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {getProgressPercentage()}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completion
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Batch Details Card */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <InfoIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Batch Information
                  </Typography>
                </Box>

                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Batch Number
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {batch.batchNumber}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Quantity
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {batch.quantity?.toLocaleString()} units
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
                      <Box sx={{ mt: 1 }}>{getStatusChip(batch.status)}</Box>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Progress
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={getProgressPercentage()}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getProgressPercentage()}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Notes
                      </Typography>
                      <Typography variant="body1">
                        {batch.notes || "No notes available"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Schedule Information */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "info.main", mr: 2 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Schedule Information
                  </Typography>
                </Box>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        📅 Scheduled Start Date
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatDate(batch.scheduledStartDate)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        🏁 Scheduled End Date
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatDate(batch.scheduledEndDate)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column - Production Request & Summary */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            {/* Production Request */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Production Request
                  </Typography>
                </Box>

                {batch.request ? (
                  <Stack spacing={3}>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Request ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {batch.request.requestId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Product Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {batch.request.productName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Priority
                      </Typography>
                      <Chip
                        label={batch.request.priority}
                        color={
                          batch.request.priority === "high"
                            ? "error"
                            : batch.request.priority === "medium"
                            ? "warning"
                            : "primary"
                        }
                        size="small"
                      />
                    </Box>
                  </Stack>
                ) : (
                  <Alert
                    severity="warning"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    No associated production request found.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Production Steps Summary */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}>
                    <BuildIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Production Steps
                  </Typography>
                </Box>

                {batch.steps && batch.steps.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {batch.steps
                      .slice(0, 5)
                      .map((step, index) => (
                        <ListItem
                          key={step.id}
                          sx={{
                            px: 0,
                            py: 2,
                            borderBottom:
                              index === batch.steps.length - 1
                                ? "none"
                                : "1px solid",
                            borderColor: "grey.100",
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "primary.main",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                              }}
                            >
                              {step.stepOrder}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600, mb: 0.5 }}
                              >
                                {step.stepName}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.8rem" }}
                                >
                                  Machine: {step.machineName || "N/A"}
                                </Typography>
                                <Chip
                                  label={step.status}
                                  size="small"
                                  color={
                                    step.status === "completed"
                                      ? "success"
                                      : step.status === "in_progress"
                                      ? "primary"
                                      : "default"
                                  }
                                  sx={{ mt: 1, fontSize: "0.7rem", height: 20 }}
                                />
                              </Box>
                            }
                            secondaryTypographyProps={{ component: "div" }}
                          />
                        </ListItem>
                      ))}
                    {batch.steps.length > 5 && (
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          +{batch.steps.length - 5} more steps
                        </Typography>
                      </Box>
                    )}
                  </List>
                ) : (
                  <Alert
                    severity="info"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    No production steps defined for this batch.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Material Allocations Summary */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
                    <InventoryIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Material Allocations
                  </Typography>
                </Box>

                {batch.materialAllocations && batch.materialAllocations.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {batch.materialAllocations
                      .slice(0, 3)
                      .map((material, index) => (
                        <ListItem
                          key={material.id}
                          sx={{
                            px: 0,
                            py: 2,
                            borderBottom:
                              index === batch.materialAllocations.length - 1
                                ? "none"
                                : "1px solid",
                            borderColor: "grey.100",
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600, mb: 0.5 }}
                              >
                                Material ID: {material.materialId}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.8rem" }}
                                >
                                  Required:{" "}
                                  {material.quantityRequired}{" "}
                                  {material.unitOfMeasure}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.8rem" }}
                                >
                                  Allocated:{" "}
                                  {material.quantityAllocated}{" "}
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
                                  sx={{ mt: 1, fontSize: "0.7rem", height: 20 }}
                                />
                              </Box>
                            }
                            secondaryTypographyProps={{ component: "div" }}
                          />
                        </ListItem>
                      ))}
                    {batch.materialAllocations.length > 3 && (
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          +{batch.materialAllocations.length - 3} more materials
                        </Typography>
                      </Box>
                    )}
                  </List>
                ) : (
                  <Alert
                    severity="info"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    No material allocations for this batch.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Management Sections */}
      <Box sx={{ mt: 6 }}>
        <ProductionStepsManager batchId={id} onStepsChange={handleStepsChange} />
        <MaterialAllocationsManager batchId={id} onMaterialsChange={handleMaterialsChange} />
      </Box>
    </Container>
  );
};

export default ProductionBatchDetail;
