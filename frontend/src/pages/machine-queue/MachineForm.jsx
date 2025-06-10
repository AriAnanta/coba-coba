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
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Settings as MachineIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import batchService from "../../api/batchService";

const MachineForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingId, setGeneratingId] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    machineId: "",
    name: "",
    type: "",
    status: "operational",
    location: "",
    manufacturer: "",
    modelNumber: "",
    capacity: "",
    capacityUnit: "",
    installationDate: "",
    lastMaintenance: "",
    nextMaintenance: "",
    hoursPerDay: "8.00",
    notes: "",
  });

  useEffect(() => {
    if (isEdit) {
      loadMachine();
    } else {
      generateMachineId();
    }
  }, [id, isEdit]);

  const generateMachineId = async () => {
    try {
      setGeneratingId(true);
      const response = await batchService.generateMachineId();
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          machineId: response.machineId,
        }));
      }
    } catch (error) {
      console.error("Error generating machine ID:", error);
      setError("Failed to generate machine ID");
    } finally {
      setGeneratingId(false);
    }
  };

  const loadMachine = async () => {
    try {
      setLoading(true);
      const response = await batchService.getMachineById(id);
      const machine = response.data || response;

      setFormData({
        machineId: machine.machine_id || "",
        name: machine.name || "",
        type: machine.type || "",
        status: machine.status || "operational",
        location: machine.location || "",
        manufacturer: machine.manufacturer || "",
        modelNumber: machine.model_number || "",
        capacity: machine.capacity || "",
        capacityUnit: machine.capacity_unit || "",
        installationDate: machine.installation_date
          ? new Date(machine.installation_date).toISOString().slice(0, 10)
          : "",
        lastMaintenance: machine.last_maintenance
          ? new Date(machine.last_maintenance).toISOString().slice(0, 10)
          : "",
        nextMaintenance: machine.next_maintenance
          ? new Date(machine.next_maintenance).toISOString().slice(0, 10)
          : "",
        hoursPerDay: machine.hours_per_day || "8.00",
        notes: machine.notes || "",
      });
    } catch (error) {
      setError("Failed to load machine data");
      console.error("Error loading machine:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseFloat(formData.capacity) : null,
        hoursPerDay: formData.hoursPerDay ? parseFloat(formData.hoursPerDay) : 8.0,
        installationDate: formData.installationDate || null,
        lastMaintenance: formData.lastMaintenance || null,
        nextMaintenance: formData.nextMaintenance || null,
      };

      if (isEdit) {
        await batchService.updateMachine(id, submitData);
      } else {
        await batchService.createMachine(submitData);
      }

      navigate("/machines");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save machine");
      console.error("Error saving machine:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
        return "success";
      case "maintenance":
        return "warning";
      case "breakdown":
        return "error";
      case "inactive":
        return "default";
      default:
        return "default";
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
                alignItems: "center",
                justifyContent: "space-between",
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
                  <MachineIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                    {isEdit ? "Edit Machine" : "Add New Machine"}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {isEdit
                      ? "Modify machine details and specifications"
                      : "Register a new production machine to the system"}
                  </Typography>
                </Box>
              </Box>
              {formData.status && (
                <Chip
                  label={formData.status.toUpperCase()}
                  color={getStatusColor(formData.status)}
                  size="medium"
                  sx={{ color: "white", fontWeight: "bold" }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Navigation */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/machines")}
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: "grey.100",
            },
          }}
        >
          Back to Machines
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
            {/* Basic Information */}
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "text.primary",
                display: "flex",
                alignItems: "center",
              }}
            >
              Basic Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Machine ID"
                    name="machineId"
                    value={formData.machineId}
                    onChange={handleChange}
                    required
                    disabled={isEdit}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  {!isEdit && (
                    <Tooltip title="Generate new Machine ID">
                      <IconButton
                        onClick={generateMachineId}
                        disabled={generatingId}
                        sx={{ ml: 1 }}
                      >
                        {generatingId ? (
                          <CircularProgress size={20} />
                        ) : (
                          <RefreshIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Machine Name"
                  name="name"
                  value={formData.name}
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
                  label="Type/Category"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  placeholder="e.g., CNC Machine, Lathe, Press"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="operational">Operational</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="breakdown">Breakdown</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Shop Floor A, Building 2"
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
                  label="Hours Per Day"
                  name="hoursPerDay"
                  type="number"
                  value={formData.hoursPerDay}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 24, step: 0.25 }}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Technical Specifications */}
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Technical Specifications
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
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
                  label="Model Number"
                  name="modelNumber"
                  value={formData.modelNumber}
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
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
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
                  label="Capacity Unit"
                  name="capacityUnit"
                  value={formData.capacityUnit}
                  onChange={handleChange}
                  placeholder="e.g., pcs/hour, kg/hour, units/day"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Maintenance & Installation */}
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Installation & Maintenance
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Installation Date"
                  name="installationDate"
                  type="date"
                  value={formData.installationDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Last Maintenance"
                  name="lastMaintenance"
                  type="date"
                  value={formData.lastMaintenance}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Next Maintenance"
                  name="nextMaintenance"
                  type="date"
                  value={formData.nextMaintenance}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
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
                  rows={4}
                  placeholder="Additional notes, specifications, or important information about this machine..."
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
                    startIcon={
                      saving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    disabled={saving}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    {saving
                      ? "Saving..."
                      : isEdit
                      ? "Update Machine"
                      : "Create Machine"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/machines")}
                    sx={{ px: 4, py: 1.5 }}
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

export default MachineForm;
