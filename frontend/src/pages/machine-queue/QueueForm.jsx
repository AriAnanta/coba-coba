import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
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
  AccessTime as QueueIcon,
} from "@mui/icons-material";
import { machineQueueAPI, productionApiService } from "../../services/api";

const QueueForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [machines, setMachines] = useState([]);
  const [batches, setBatches] = useState([]);

  const [formData, setFormData] = useState({
    machineId: "",
    batchId: "",
    batchNumber: "",
    productName: "",
    stepId: "",
    stepName: "",
    scheduledStartTime: "",
    scheduledEndTime: "",
    hoursRequired: "",
    priority: "normal",
    operatorId: "",
    operatorName: "",
    setupTime: "",
    notes: "",
  });

  useEffect(() => {
    loadMachines();
    loadBatches();
    if (isEdit) {
      loadQueue();
    }
  }, [id, isEdit]);

  const loadMachines = async () => {
    try {
      const response = await machineQueueAPI.getAvailableMachines();
      setMachines(response.data.data || response.data);
    } catch (error) {
      console.error("Error loading machines:", error);
    }
  };

  const loadBatches = async () => {
    try {
      // Load batches from production API
      const response = await productionApiService.getProductionBatches({
        status: "approved",
      });
      setBatches(response.data || []);
    } catch (error) {
      console.error("Error loading batches:", error);
      // Set empty array if API call fails
      setBatches([]);
    }
  };

  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await machineQueueAPI.getQueueById(id);
      const queue = response.data.data || response.data;

      setFormData({
        machineId: queue.machineId || "",
        batchId: queue.batchId || "",
        batchNumber: queue.batchNumber || "",
        productName: queue.productName || "",
        stepId: queue.stepId || "",
        stepName: queue.stepName || "",
        scheduledStartTime: queue.scheduledStartTime
          ? new Date(queue.scheduledStartTime).toISOString().slice(0, 16)
          : "",
        scheduledEndTime: queue.scheduledEndTime
          ? new Date(queue.scheduledEndTime).toISOString().slice(0, 16)
          : "",
        hoursRequired: queue.hoursRequired || "",
        priority: queue.priority || "normal",
        operatorId: queue.operatorId || "",
        operatorName: queue.operatorName || "",
        setupTime: queue.setupTime || "",
        notes: queue.notes || "",
      });
    } catch (error) {
      setError("Failed to load queue data");
      console.error("Error loading queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    const selectedBatch = batches.find((b) => b.id === batchId);

    setFormData((prev) => ({
      ...prev,
      batchId,
      batchNumber: selectedBatch?.batchNumber || "",
      productName: selectedBatch?.productName || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const submitData = {
        ...formData,
        batchId: parseInt(formData.batchId),
        machineId: parseInt(formData.machineId),
        hoursRequired: parseFloat(formData.hoursRequired),
        setupTime: formData.setupTime ? parseFloat(formData.setupTime) : null,
        stepId: formData.stepId ? parseInt(formData.stepId) : null,
      };

      if (isEdit) {
        await machineQueueAPI.updateQueue(id, submitData);
      } else {
        await machineQueueAPI.addToQueue(submitData);
      }

      navigate("/queue");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save queue item");
      console.error("Error saving queue:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEdit) {
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
            background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
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
                <QueueIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: "1.75rem", sm: "2.125rem" },
                    color: 'text.primary'
                  }}
                >
                  {isEdit ? "Edit Queue Item" : "Add Queue Item"}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.8, color: 'text.secondary' }}>
                  {isEdit ? "Modify queue item details" : "Create a new queue item for production"}
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
          onClick={() => navigate("/queue")}
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: "grey.100",
            },
          }}
        >
          Back to Queue Management
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form Section */}
      <Grow in timeout={800}>
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
              }}
            >
              Queue Item Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Machine</InputLabel>
                  <Select
                    name="machineId"
                    value={formData.machineId}
                    onChange={handleChange}
                    label="Machine"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    {machines.map((machine) => (
                      <MenuItem key={machine.id} value={machine.id}>
                        {machine.name} ({machine.type})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Batch</InputLabel>
                  <Select
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleBatchChange}
                    label="Batch"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    {batches.map((batch) => (
                      <MenuItem key={batch.id} value={batch.id}>
                        {batch.batchNumber} - {batch.productName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Batch Number"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  required
                  disabled
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "grey.50",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Step Name"
                  name="stepName"
                  value={formData.stepName}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hours Required"
                  name="hoursRequired"
                  type="number"
                  value={formData.hoursRequired}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 0.5 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scheduled Start Time"
                  name="scheduledStartTime"
                  type="datetime-local"
                  value={formData.scheduledStartTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scheduled End Time"
                  name="scheduledEndTime"
                  type="datetime-local"
                  value={formData.scheduledEndTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    label="Priority"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Setup Time (hours)"
                  name="setupTime"
                  type="number"
                  value={formData.setupTime}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.25 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Operator ID"
                  name="operatorId"
                  value={formData.operatorId}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Operator Name"
                  name="operatorName"
                  value={formData.operatorName}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={saving}
                    sx={{ px: 4 }}
                  >
                    {saving ? "Saving..." : (isEdit ? "Update Queue" : "Create Queue")}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/queue")}
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

export default QueueForm;
