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
  Business as BusinessIcon,
  Info as InfoIcon,
  ContactPhone as ContactPhoneIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";

function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplierDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5004/api/suppliers/${id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSupplier(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDetail();
  }, [id]);

  const getStatusChip = (status) => {
    const statusConfig = {
      Active: { color: "success", label: "Active" },
      Inactive: { color: "default", label: "Inactive" },
      "On Hold": { color: "warning", label: "On Hold" },
      Terminated: { color: "error", label: "Terminated" },
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

  if (!supplier) {
    return (
      <Fade in>
        <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
          Supplier not found.
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
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
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
                  <BusinessIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: "1.75rem", sm: "2.125rem" },
                      color: "text.primary",
                    }}
                  >
                    {supplier.name}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ opacity: 0.8, color: "text.secondary" }}
                  >
                    Supplier Details and Information
                  </Typography>
                </Box>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/suppliers")}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "text.primary",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)",
                    },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/suppliers/${id}/edit`)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.9)",
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,1)",
                    },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Edit Supplier
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
                      Supplier ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplier.supplierId || supplier.id}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Company Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplier.name}
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
                      {supplier.description || "No description available."}
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
                    <Box sx={{ mt: 1 }}>
                      {getStatusChip(supplier.status || "Active")}
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Contact Information */}
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
                    <ContactPhoneIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Contact Information
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Contact Person
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplier.contactPerson || "Not specified"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplier.email || "Not specified"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Phone Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplier.phone || "Not specified"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Website
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplier.website || "Not specified"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <Grow in timeout={1200}>
            <Card sx={{ border: "1px solid", borderColor: "grey.200" }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "info.main", mr: 2 }}>
                    <LocationOnIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Address Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Street Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplier.address || "Not specified"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      City
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplier.city || "Not specified"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Country
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {supplier.country || "Not specified"}
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
                      {supplier.notes || "No additional notes."}
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

export default SupplierDetail;
