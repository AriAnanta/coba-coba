import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_FEEDBACKS,
  DELETE_FEEDBACK,
} from "../../graphql/productionFeedback";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth untuk role check
import { toast } from "react-toastify";

const FeedbackList = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Dapatkan informasi user dari AuthContext

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState(null); // State untuk konfirmasi hapus

  const {
    loading,
    error,
    data,
    refetch: refetchFeedbacks,
  } = useQuery(GET_FEEDBACKS, {
    variables: {
      pagination: { page, limit },
      filter: {
        productName: search || undefined,
        status: statusFilter || undefined,
      },
    },
    fetchPolicy: "network-only",
  });

  const [deleteFeedbackMutation, { loading: deleting }] = useMutation(
    DELETE_FEEDBACK,
    {
      onCompleted: () => {
        toast.success("Feedback berhasil dihapus!");
        refetchFeedbacks();
        setDeleteId(null);
      },
      onError: (err) => {
        toast.error(`Gagal menghapus feedback: ${err.message}`);
        console.error("Error deleting feedback:", err);
      },
    }
  );

  const feedbacks = data?.feedbacks?.items || [];
  const totalCount = data?.feedbacks?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeLimit = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1); // Reset ke halaman pertama saat limit berubah
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1); // Reset ke halaman pertama saat pencarian berubah
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset ke halaman pertama saat filter status berubah
  };

  const handleCreateNew = () => {
    navigate("/feedback/new");
  };

  const handleViewDetail = (id) => {
    navigate(`/feedback/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/feedback/${id}/edit`);
  };

  const handleDelete = (id) => {
    setDeleteId(id); // Set ID yang akan dihapus untuk konfirmasi
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteFeedbackMutation({ variables: { id: deleteId } });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "in_production":
        return "blue";
      case "on_hold":
        return "purple";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      case "rejected":
        return "red";
      default:
        return "gray";
    }
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
        Gagal memuat daftar feedback: {error.message}
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
        <Typography variant="h4" component="h1">
          Daftar Feedback Produksi
        </Typography>
        {(user?.role === "admin" ||
          user?.role === "production_manager" ||
          user?.role === "production_operator") && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Tambah Feedback Baru
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            label="Cari Produk"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          />
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">Semua</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_production">Dalam Produksi</MenuItem>
              <MenuItem value="on_hold">Ditunda</MenuItem>
              <MenuItem value="completed">Selesai</MenuItem>
              <MenuItem value="cancelled">Dibatalkan</MenuItem>
              <MenuItem value="rejected">Ditolak</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Feedback</TableCell>
                <TableCell>Nama Produk</TableCell>
                <TableCell>Kuantitas Aktual</TableCell>
                <TableCell>Kuantitas Cacat</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tanggal Mulai</TableCell>
                <TableCell>Tanggal Selesai</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Tidak ada feedback yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                feedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{feedback.feedbackId}</TableCell>
                    <TableCell>{feedback.productName}</TableCell>
                    <TableCell>{feedback.actualQuantity || "N/A"}</TableCell>
                    <TableCell>{feedback.defectQuantity || "N/A"}</TableCell>
                    <TableCell>
                      <span style={{ color: getStatusColor(feedback.status) }}>
                        {feedback.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {feedback.startDate
                        ? new Date(feedback.startDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {feedback.endDate
                        ? new Date(feedback.endDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetail(feedback.id)}
                      >
                        Detail
                      </Button>
                      {(user?.role === "admin" ||
                        user?.role === "production_manager") && (
                        <>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(feedback.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(feedback.id)}
                            disabled={deleting}
                          >
                            Hapus
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="rows-per-page-label">Baris per Halaman</InputLabel>
            <Select
              labelId="rows-per-page-label"
              value={limit}
              label="Baris per Halaman"
              onChange={handleChangeLimit}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Konfirmasi Dialog Hapus */}
      <Alert
        severity="warning"
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          display: deleteId ? "flex" : "none",
          alignItems: "center",
        }}
        action={
          <Box>
            <Button
              color="inherit"
              size="small"
              onClick={() => setDeleteId(null)}
            >
              Batal
            </Button>
            <Button color="error" size="small" onClick={confirmDelete}>
              Konfirmasi Hapus
            </Button>
          </Box>
        }
      >
        Anda yakin ingin menghapus feedback ini?
      </Alert>
    </Box>
  );
};

export default FeedbackList;
