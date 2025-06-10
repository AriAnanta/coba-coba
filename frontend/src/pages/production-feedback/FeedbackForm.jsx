import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
  Slider,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Factory as FactoryIcon,
  Category as ProductIcon,
  ShoppingCart as MarketplaceIcon,
  Note as NoteIcon,
} from "@mui/icons-material";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_FEEDBACK,
  CREATE_FEEDBACK,
  UPDATE_FEEDBACK,
  DELETE_FEEDBACK,
} from "../../graphql/productionFeedback";
import { toast } from "react-toastify";

const FeedbackForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    productName: "",
    productionPlanId: "",
    status: "pending",
    plannedQuantity: 0,
    actualQuantity: 0,
    defectQuantity: 0,
    startDate: null,
    endDate: null,
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    loading: queryLoading,
    error: queryError,
    data: queryData,
  } = useQuery(GET_FEEDBACK, {
    variables: { id },
    skip: !isEditMode,
    fetchPolicy: "network-only",
  });

  const [createFeedbackMutation] = useMutation(CREATE_FEEDBACK, {
    onCompleted: (data) => {
      toast.success("Feedback produksi berhasil dibuat!");
      navigate(`/feedback/${data.createFeedback.id}`);
      setSubmitting(false);
    },
    onError: (err) => {
      toast.error(`Gagal membuat feedback produksi: ${err.message}`);
      setSubmitting(false);
    },
  });

  const [updateFeedbackMutation] = useMutation(UPDATE_FEEDBACK, {
    onCompleted: (data) => {
      toast.success("Feedback produksi berhasil diperbarui!");
      navigate(`/feedback/${data.updateFeedback.id}`);
      setSubmitting(false);
    },
    onError: (err) => {
      toast.error(`Gagal memperbarui feedback produksi: ${err.message}`);
      setSubmitting(false);
    },
    refetchQueries: [{ query: GET_FEEDBACK, variables: { id } }],
  });

  const [deleteFeedbackMutation] = useMutation(DELETE_FEEDBACK, {
    onCompleted: () => {
      toast.success("Feedback produksi berhasil dihapus!");
      navigate("/feedback");
      setDeleteDialogOpen(false);
    },
    onError: (err) => {
      toast.error(`Gagal menghapus feedback produksi: ${err.message}`);
      setDeleteDialogOpen(false);
    },
  });

  useEffect(() => {
    if (isEditMode && queryData && queryData.feedback) {
      const { feedback } = queryData;
      setFormData({
        productName: feedback.productName || "",
        productionPlanId: feedback.productionPlanId || "",
        status: feedback.status || "pending",
        plannedQuantity: feedback.plannedQuantity || 0,
        actualQuantity: feedback.actualQuantity || 0,
        defectQuantity: feedback.defectQuantity || 0,
        startDate: feedback.startDate ? new Date(feedback.startDate) : null,
        endDate: feedback.endDate ? new Date(feedback.endDate) : null,
        notes: feedback.notes || "",
      });
    }
  }, [isEditMode, queryData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim()) {
      newErrors.productName = "Nama Produk wajib diisi.";
    }
    if (formData.plannedQuantity && isNaN(parseInt(formData.plannedQuantity))) {
      newErrors.plannedQuantity = "Kuantitas Terencana harus berupa angka.";
    }
    if (formData.actualQuantity && isNaN(parseInt(formData.actualQuantity))) {
      newErrors.actualQuantity = "Kuantitas Aktual harus berupa angka.";
    }
    if (formData.defectQuantity && isNaN(parseInt(formData.defectQuantity))) {
      newErrors.defectQuantity = "Kuantitas Cacat harus berupa angka.";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = "Tanggal Selesai tidak boleh sebelum Tanggal Mulai.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Mohon perbaiki kesalahan formulir.");
      return;
    }

    setSubmitting(true);
    const input = {
      productName: formData.productName,
      productionPlanId: formData.productionPlanId,
      status: formData.status,
      plannedQuantity: parseInt(formData.plannedQuantity),
      actualQuantity: parseInt(formData.actualQuantity),
      defectQuantity: parseInt(formData.defectQuantity),
      startDate: formData.startDate
        ? formData.startDate.toISOString().split("T")[0]
        : undefined,
      endDate: formData.endDate
        ? formData.endDate.toISOString().split("T")[0]
        : undefined,
      notes: formData.notes || undefined,
    };

    try {
      if (isEditMode) {
        await updateFeedbackMutation({ variables: { id, input } });
      } else {
        await createFeedbackMutation({ variables: { input } });
      }
    } catch (err) {
      // Error ditangani di onError mutation
    }
  };

  const handleCancel = () => {
    navigate("/feedback");
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteFeedbackMutation({ variables: { id } });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  if (queryLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (queryError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Gagal memuat detail feedback: {queryError.message}
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Button startIcon={<ArrowBackIcon />} onClick={handleCancel}>
            Kembali ke Daftar Feedback
          </Button>
          {isEditMode && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              disabled={submitting}
            >
              Hapus
            </Button>
          )}
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEditMode
              ? "Edit Feedback Produksi"
              : "Buat Feedback Produksi Baru"}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardHeader
                    title="Informasi Dasar"
                    avatar={
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <AssignmentIcon />
                      </Avatar>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Product Name"
                          name="productName"
                          value={formData.productName}
                          onChange={(e) =>
                            handleInputChange("productName", e.target.value)
                          }
                          error={!!errors.productName}
                          helperText={errors.productName}
                          fullWidth
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl
                          fullWidth
                          margin="normal"
                          error={!!errors.status}
                        >
                          <InputLabel id="status-label">Status</InputLabel>
                          <Select
                            labelId="status-label"
                            id="status"
                            name="status"
                            value={formData.status}
                            label="Status"
                            onChange={(e) =>
                              handleInputChange("status", e.target.value)
                            }
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in_production">
                              Dalam Produksi
                            </MenuItem>
                            <MenuItem value="on_hold">Ditunda</MenuItem>
                            <MenuItem value="completed">Selesai</MenuItem>
                            <MenuItem value="cancelled">Dibatalkan</MenuItem>
                            <MenuItem value="rejected">Ditolak</MenuItem>
                          </Select>
                          {errors.status && (
                            <FormHelperText>{errors.status}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardHeader
                    title="Detail Kuantitas & Tanggal"
                    avatar={
                      <Avatar sx={{ bgcolor: "secondary.main" }}>
                        <FactoryIcon />
                      </Avatar>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Planned Quantity"
                          name="plannedQuantity"
                          type="number"
                          value={formData.plannedQuantity}
                          onChange={(e) =>
                            handleInputChange("plannedQuantity", e.target.value)
                          }
                          error={!!errors.plannedQuantity}
                          helperText={errors.plannedQuantity}
                          inputProps={{ min: 0 }}
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
                          label="Actual Quantity"
                          name="actualQuantity"
                          type="number"
                          value={formData.actualQuantity}
                          onChange={(e) =>
                            handleInputChange("actualQuantity", e.target.value)
                          }
                          error={!!errors.actualQuantity}
                          helperText={errors.actualQuantity}
                          inputProps={{ min: 0 }}
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
                          label="Defect Quantity"
                          name="defectQuantity"
                          type="number"
                          value={formData.defectQuantity}
                          onChange={(e) =>
                            handleInputChange("defectQuantity", e.target.value)
                          }
                          error={!!errors.defectQuantity}
                          helperText={errors.defectQuantity}
                          inputProps={{ min: 0 }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="Start Date"
                          value={formData.startDate}
                          onChange={(date) =>
                            handleDateChange("startDate", date)
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              variant: "outlined",
                              error: !!errors.startDate,
                              helperText: errors.startDate,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="End Date"
                          value={formData.endDate}
                          onChange={(date) => handleDateChange("endDate", date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              variant: "outlined",
                              error: !!errors.endDate,
                              helperText: errors.endDate,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardHeader
                    title="Catatan"
                    avatar={
                      <Avatar sx={{ bgcolor: "info.main" }}>
                        <NoteIcon />
                      </Avatar>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Catatan"
                      name="notes"
                      multiline
                      rows={4}
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      placeholder="Masukkan catatan tambahan mengenai feedback ini"
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <CircularProgress size={24} />
                    ) : isEditMode ? (
                      "Perbarui Feedback"
                    ) : (
                      "Buat Feedback"
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Konfirmasi Penghapusan Feedback
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Anda yakin ingin menghapus feedback ini? Tindakan ini tidak dapat
              dibatalkan.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Batal</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              autoFocus
            >
              Hapus
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default FeedbackForm;
