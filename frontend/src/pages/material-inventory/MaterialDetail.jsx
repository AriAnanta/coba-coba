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
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

function MaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterialDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5004/api/materials/${id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMaterial(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialDetail();
  }, [id]);

  const getStatusChip = (material) => {
    if (material.stockQuantity <= material.reorderLevel) {
      return (
        <Chip
          label="Low Stock"
          color="error"
          icon={<WarningIcon />}
          sx={{ fontWeight: 500 }}
        />
      );
    }
    
    const statusConfig = {
      active: { color: "success", label: "Active" },
      discontinued: { color: "error", label: "Discontinued" },
      out_of_stock: { color: "warning", label: "Out of Stock" },
    };

    const config = statusConfig[material.status] || { color: "default", label: material.status };
    return (
      <Chip
        label={config.label}
        color={config.color}
        sx={{ fontWeight: 500 }}
      />
    );
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
          Error: {error.message}
        </Alert>
      </Fade>
    );
  }

  if (!material) {
    return (
      <Fade in>
        <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
          Material not found.
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
                    {material.name}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Material ID: {material.materialId || material.id}
                  </Typography>
                </Box>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/materials")}
                  fullWidth={{ xs: true, sm: false }}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/materials/${id}/edit`)}
                  fullWidth={{ xs: true, sm: false }}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  Edit Material
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Grid container spacing={4}>
        {/* Basic Information */}
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
                    <InfoIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Material ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {material.materialId || material.id}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {material.name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {material.description || "No description available."}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Category
                    </Typography>
                    <Chip 
                      label={material.category} 
                      color="primary"
                      sx={{ mt: 1, fontWeight: 500 }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {material.type}
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
                    <Box sx={{ mt: 1 }}>{getStatusChip(material)}</Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Inventory Information */}
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
                  <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Inventory Details
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Stock Quantity
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: material.stockQuantity <= material.reorderLevel ? 'error.main' : 'success.main'
                      }}
                    >
                      {material.stockQuantity.toLocaleString()} {material.unit}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Unit of Measure
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {material.unit}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Reorder Level
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {material.reorderLevel}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Price
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      ${material.price.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Lead Time
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {material.leadTime} days
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {material.location || "Not specified"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Supplier Information */}
        <Grid item xs={12}>
          <Grow in timeout={1200}>
            <Card sx={{ border: "1px solid", borderColor: "grey.200" }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "info.main", mr: 2 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Supplier & Additional Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Supplier ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {material.supplierId || "Not assigned"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {material.notes || "No additional notes."}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MaterialDetail;
