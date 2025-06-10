import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Avatar,
  Stack,
  Card,
  CardContent,
  FormHelperText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  GET_PLAN,
  CREATE_PLAN,
  UPDATE_PLAN,
} from "../../graphql/productionPlanning";
import {
  GET_PRODUCTION_REQUEST,
  GET_PENDING_BATCHES,
} from "../../graphql/productionManagement";
import { productionManagement } from "../../graphql/client";

const ProductionPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    productName: "",
    planningNotes: "",
    plannedStartDate: new Date(),
    plannedEndDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
    priority: "normal",
    requestId: "",
    requestDbId: null,
    batchId: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [pendingBatches, setPendingBatches] = useState([]);

  // Query for getting plan details in edit mode
  const {
    loading: planLoading,
    error: planError,
    data: planData,
  } = useQuery(GET_PLAN, {
    variables: { id },
    skip: !isEditMode,
    fetchPolicy: "cache-and-network",
  });

  // Query untuk mengambil batch yang tertunda
  const {
    loading: pendingBatchesLoading,
    error: pendingBatchesError,
    data: pendingBatchesData,
  } = useQuery(GET_PENDING_BATCHES, {
    skip: isEditMode,
    fetchPolicy: "network-only",
    client: productionManagement,
  });

  // Lazy query for getting production request details
  const [
    getProductionRequest,
    { loading: requestLoading, error: requestError, data: requestData },
  ] = useLazyQuery(GET_PRODUCTION_REQUEST, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data && data.productionRequest) {
        const req = data.productionRequest;
        setFormData((prevData) => ({
          ...prevData,
          productName: req.productName,
          plannedStartDate: req.dueDate ? new Date(req.dueDate) : null,
          plannedEndDate: req.dueDate ? new Date(req.dueDate) : null,
          priority: req.priority ? req.priority.toLowerCase() : "normal",
        }));
        toast.info("Detail permintaan produksi dimuat.");
      } else {
        toast.warn("Permintaan produksi tidak ditemukan.");
      }
    },
    onError: (error) => {
      toast.error(`Gagal memuat detail permintaan produksi: ${error.message}`);
    },
  });

  // Effect untuk memperbarui daftar batch yang tertunda
  useEffect(() => {
    if (pendingBatchesData && pendingBatchesData.productionBatchesByStatus) {
      setPendingBatches(pendingBatchesData.productionBatchesByStatus);
    }
  }, [pendingBatchesData]);

  // Mutation for creating a new plan
  const [createPlan, { loading: createLoading }] = useMutation(CREATE_PLAN, {
    onCompleted: (data) => {
      toast.success("Production plan created successfully");
      navigate(`/production-plans/${data.createPlan.id}`);
      setSubmitting(false);
    },
    onError: (error) => {
      toast.error(`Failed to create production plan: ${error.message}`);
      setSubmitting(false);
    },
  });

  // Mutation for updating an existing plan
  const [updatePlan, { loading: updateLoading }] = useMutation(UPDATE_PLAN, {
    onCompleted: () => {
      toast.success("Production plan updated successfully");
      navigate(`/production-plans/${id}`);
      setSubmitting(false);
    },
    onError: (error) => {
      toast.error(`Failed to update production plan: ${error.message}`);
      setSubmitting(false);
    },
    refetchQueries: [{ query: GET_PLAN, variables: { id } }],
  });

  // Load plan data in edit mode
  useEffect(() => {
    if (isEditMode && planData && planData.plan) {
      const { plan } = planData;
      setFormData({
        productName: plan.productName || "",
        planningNotes: plan.planningNotes || "",
        plannedStartDate: plan.plannedStartDate
          ? new Date(plan.plannedStartDate)
          : null,
        plannedEndDate: plan.plannedEndDate
          ? new Date(plan.plannedEndDate)
          : null,
        priority: plan.priority ? plan.priority.toLowerCase() : "normal",
        requestId: plan.requestId || "",
        batchId: plan.batchId || "",
      });
    }
  }, [isEditMode, planData]);

  // Trigger request data fetch when requestId changes in create mode
  useEffect(() => {
    if (!isEditMode && formData.requestDbId) {
      getProductionRequest({ variables: { id: formData.requestDbId } });
    }
  }, [formData.requestDbId, isEditMode, getProductionRequest]);

  // Effect untuk mengisi data form berdasarkan batch yang dipilih
  useEffect(() => {
    if (formData.batchId && !isEditMode) {
      const selectedBatch = pendingBatches.find(
        (batch) => batch.id === formData.batchId
      );
      if (selectedBatch) {
        console.log("Selected Batch:", selectedBatch);
        setFormData((prevData) => ({
          ...prevData,
          productName: selectedBatch.request?.productName || "",
          requestId: selectedBatch.request?.requestId || "",
          requestDbId: selectedBatch.request?.id || null,
          productionRequestId: selectedBatch.request?.requestId || "",
          plannedStartDate: selectedBatch.scheduledStartDate
            ? new Date(selectedBatch.scheduledStartDate)
            : null,
          plannedEndDate: selectedBatch.scheduledEndDate
            ? new Date(selectedBatch.scheduledEndDate)
            : null,
        }));
        toast.info(
          `Detail batch ${selectedBatch.batchNumber} dimuat secara otomatis.`
        );
      }
    }
  }, [formData.batchId, pendingBatches, isEditMode]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Jika mode edit, requestId dan batchId tidak wajib
    if (!isEditMode) {
      if (!formData.batchId && !formData.requestDbId) {
        newErrors.requestId = "Request ID or Batch ID is required";
      } else if (
        !formData.batchId &&
        formData.requestId &&
        (isNaN(Number(formData.requestId)) ||
          Number(formData.requestId) <= 0) &&
        !formData.requestDbId
      ) {
        newErrors.requestId =
          "Invalid Request ID format. Must be a positive number if entered manually without batch.";
      }
    }

    if (!formData.productName.trim()) {
      newErrors.productName = "Product Name is required";
    }

    if (!formData.plannedStartDate) {
      newErrors.plannedStartDate = "Planned Start Date is required";
    }

    if (!formData.plannedEndDate) {
      newErrors.plannedEndDate = "Planned End Date is required";
    } else if (
      formData.plannedStartDate &&
      formData.plannedEndDate < formData.plannedStartDate
    ) {
      newErrors.plannedEndDate =
        "Planned End Date cannot be before Planned Start Date";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit dipanggil.");
    setSubmitting(true);

    const newErrors = validateForm();
    console.log("Hasil validasi:", newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitting(false);
      toast.error("Please correct the form errors.");
      return;
    }

    const input = {
      productName: formData.productName,
      planningNotes: formData.planningNotes,
      plannedStartDate: formData.plannedStartDate
        ? formData.plannedStartDate.toISOString().split("T")[0]
        : null,
      plannedEndDate: formData.plannedEndDate
        ? formData.plannedEndDate.toISOString().split("T")[0]
        : null,
      priority: formData.priority.toUpperCase(),
      plannedBatches: 1, // Default to 1, or derive from batch/request if needed
    };

    // Hanya tambahkan requestId (ID integer) dan batchId jika ada dan valid
    if (formData.requestDbId) {
      input.requestId = formData.requestDbId;
    } else if (formData.requestId && !isNaN(Number(formData.requestId))) {
      input.requestId = Number(formData.requestId);
    }

    if (formData.batchId && !isNaN(Number(formData.batchId))) {
      input.batchId = Number(formData.batchId);
    }

    try {
      if (isEditMode) {
        console.log("Memanggil updatePlan dengan input:", input);
        await updatePlan({ variables: { id, input } });
      } else {
        console.log("Memanggil createPlan dengan input:", input);
        await createPlan({ variables: { input } });
      }
    } catch (err) {
      // Error handling is done in useMutation's onError callback
    }
  };

  const handleCancel = () => {
    navigate("/production-plans");
  };

  const loading = isEditMode ? planLoading : pendingBatchesLoading;
  const currentError = isEditMode ? planError : pendingBatchesError;

  if (loading || requestLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (currentError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading data: {currentError.message}
      </Alert>
    );
  }

  console.log("Current formData:", formData);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                  <ScheduleIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                      ? "Edit Production Plan"
                      : "Create Production Plan"}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {isEditMode
                      ? "Modify plan details and settings"
                      : "Set up a new production plan"}
                  </Typography>
                </Box>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleCancel}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={submitting || createLoading || updateLoading}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  {submitting || createLoading || updateLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Form Section */}
        <Paper
          component="form"
          onSubmit={handleSubmit}
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
                borderBottom: "1px solid",
                borderColor: "grey.300",
                pb: 2,
              }}
            >
              Plan Information
            </Typography>

            <Grid container spacing={3}>
              {!isEditMode && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(errors.batchId)}>
                    <InputLabel id="batch-id-label">Pilih Batch</InputLabel>
                    <Select
                      labelId="batch-id-label"
                      id="batchId"
                      name="batchId"
                      value={formData.batchId}
                      onChange={handleInputChange}
                      label="Pilih Batch"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {pendingBatches.map((batch) => (
                        <MenuItem key={batch.id} value={batch.id}>
                          {batch.batchNumber} - {batch.productName} (Qty:{" "}
                          {batch.quantity})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.batchId && (
                      <FormHelperText error>{errors.batchId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  error={Boolean(errors.productName)}
                  helperText={errors.productName}
                  InputProps={{
                    readOnly: Boolean(formData.batchId || formData.requestId),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              {!isEditMode && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Request ID"
                    name="requestId"
                    value={formData.requestId}
                    onChange={handleInputChange}
                    error={Boolean(errors.requestId)}
                    helperText={errors.requestId}
                    InputProps={{
                      readOnly: Boolean(formData.batchId),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Planning Notes"
                  name="planningNotes"
                  multiline
                  rows={4}
                  value={formData.planningNotes}
                  onChange={handleInputChange}
                  error={Boolean(errors.planningNotes)}
                  helperText={errors.planningNotes}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Planned Start Date"
                  value={formData.plannedStartDate}
                  onChange={(date) =>
                    handleDateChange("plannedStartDate", date)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.plannedStartDate),
                      helperText: errors.plannedStartDate,
                      required: true,
                      disabled:
                        !isEditMode &&
                        (Boolean(formData.batchId) ||
                          Boolean(formData.requestId)),
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Planned End Date"
                  value={formData.plannedEndDate}
                  onChange={(date) => handleDateChange("plannedEndDate", date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.plannedEndDate),
                      helperText: errors.plannedEndDate,
                      required: true,
                      disabled:
                        !isEditMode &&
                        (Boolean(formData.batchId) ||
                          Boolean(formData.requestId)),
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    label="Priority"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ProductionPlanForm;
