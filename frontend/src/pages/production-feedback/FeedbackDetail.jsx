import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Divider,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client";
import { GET_FEEDBACK } from "../../graphql/productionFeedback";

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    loading,
    error,
    data,
    refetch: refetchFeedback,
  } = useQuery(GET_FEEDBACK, {
    variables: { id },
    fetchPolicy: "network-only",
  });

  const feedback = data?.feedback;

  const getStatusChip = (status) => {
    let color = "default";
    let label = status;

    switch (status) {
      case "pending":
        color = "warning";
        label = "Pending";
        break;
      case "in_production":
        color = "info";
        label = "Dalam Produksi";
        break;
      case "on_hold":
        color = "secondary";
        label = "Ditunda";
        break;
      case "completed":
        color = "success";
        label = "Selesai";
        break;
      case "cancelled":
        color = "error";
        label = "Dibatalkan";
        break;
      case "rejected":
        color = "error";
        label = "Ditolak";
        break;
      default:
        break;
    }

    return (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{ textTransform: "capitalize", fontWeight: "bold" }}
      />
    );
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : "N/A";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Gagal memuat detail feedback: {error.message}
      </Alert>
    );
  }

  if (!feedback) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Feedback tidak ditemukan.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/feedback")}
        >
          Kembali ke Daftar Feedback
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/feedback/${feedback.id}/edit`)}
        >
          Edit Feedback
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Detail Feedback Produksi
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              ID Feedback: {feedback.feedbackId}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              ID Batch: {feedback.batchId || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Nomor Batch:
            </Typography>
            <Typography variant="body1">
              {feedback.batchNumber || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Nama Produk: {feedback.productName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Status:
            </Typography>
            {getStatusChip(feedback.status)}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Kuantitas Terencana:
            </Typography>
            <Typography variant="body1">
              {feedback.plannedQuantity || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Kuantitas Aktual:
            </Typography>
            <Typography variant="body1">
              {feedback.actualQuantity || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Kuantitas Cacat:
            </Typography>
            <Typography variant="body1">
              {feedback.defectQuantity || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Tanggal Mulai:
            </Typography>
            <Typography variant="body1">
              {formatDate(feedback.startDate)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Tanggal Selesai:
            </Typography>
            <Typography variant="body1">
              {formatDate(feedback.endDate)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="text.secondary">
              Catatan:
            </Typography>
            <Typography variant="body1">
              {feedback.notes || "Tidak ada catatan."}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default FeedbackDetail;
