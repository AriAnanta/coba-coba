import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";

function EditMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    materialId: "",
    name: "",
    description: "",
    category: "",
    type: "",
    unit: "",
    stockQuantity: 0,
    reorderLevel: 10,
    price: 0,
    leadTime: 0,
    location: "",
    supplierId: "",
    status: "active",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Define ENUM values for dropdowns
  const categories = [
    "Raw Material",
    "Component",
    "Work-in-Progress (WIP)",
    "Finished Goods",
    "Packaging Material",
    "Consumable",
    "Spare Part",
    "Tool",
  ];

  const units = [
    "Kilogram (kg)",
    "Gram (g)",
    "Liter (L)",
    "Milliliter (mL)",
    "Pieces (pcs)",
    "Meter (m)",
    "Square Meter (m²)",
    "Cubic Meter (m³)",
    "Ton",
  ];

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await fetch(
          `http://localhost:5004/api/materials/${id}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFormData(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5004/api/materials/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      alert("Material updated successfully!");
      navigate("/materials");
    } catch (e) {
      setError(e);
      alert(`Failed to update material: ${e.message}`);
    } finally {
      setSaving(false);
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

  if (error && !formData.name) {
    return (
      <Fade in>
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
          Error: {error.message}
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
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
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
                <InventoryIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                  Edit Material
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Update material information and inventory details
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
          onClick={() => navigate("/materials")}
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: "grey.100",
            },
          }}
        >
          Back to Materials
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error.message}
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
              Material Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Material ID"
                  name="materialId"
                  value={formData.materialId || ""}
                  onChange={handleChange}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "grey.50",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Material Name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category || ""}
                    onChange={handleChange}
                    label="Category"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Type"
                  name="type"
                  value={formData.type || ""}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Unit of Measure</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit || ""}
                    onChange={handleChange}
                    label="Unit of Measure"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    {units.map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity || 0}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reorder Level"
                  name="reorderLevel"
                  type="number"
                  value={formData.reorderLevel || 0}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price || 0}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lead Time (days)"
                  name="leadTime"
                  type="number"
                  value={formData.leadTime || 0}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supplier ID"
                  name="supplierId"
                  value={formData.supplierId || ""}
                  onChange={handleChange}
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
                    value={formData.status || "active"}
                    onChange={handleChange}
                    label="Status"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="discontinued">Discontinued</MenuItem>
                    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description || ""}
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
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes || ""}
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
                    startIcon={
                      saving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    type="submit"
                    disabled={saving}
                    sx={{ px: 4 }}
                  >
                    {saving ? "Updating..." : "Update Material"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/materials")}
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
}

export default EditMaterial;
