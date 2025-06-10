import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  PageHeader,
  DataTable,
  ConfirmDialog,
  AlertMessage,
} from "../../components/common";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * UserManagement Component
 *
 * Komponen untuk mengelola pengguna, termasuk melihat, menambah, mengedit, dan menghapus pengguna.
 * Menggunakan komponen umum seperti PageHeader, DataTable, ConfirmDialog, dan AlertMessage.
 */
const UserManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formMode, setFormMode] = useState("add"); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({
    open: false,
    severity: "",
    message: "",
  });

  // Kolom untuk DataTable
  const columns = [
    { id: "username", label: "Nama Pengguna" },
    { id: "email", label: "Email" },
    { id: "role", label: "Peran" },
    {
      id: "actions",
      label: "Aksi",
      align: "center",
      render: (row) => (
        <Box>
          <Tooltip title="Edit Pengguna">
            <IconButton color="primary" onClick={() => handleEditClick(row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus Pengguna">
            <IconButton color="error" onClick={() => handleDeleteClick(row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Data dummy untuk contoh
  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Mengambil daftar pengguna dari API.
   */
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulasi panggilan API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers([
        {
          id: "1",
          username: "admin",
          email: "admin@example.com",
          role: "Admin",
        },
        {
          id: "2",
          username: "user1",
          email: "user1@example.com",
          role: "User",
        },
      ]);
      setLoading(false);
    } catch (err) {
      setError("Gagal memuat pengguna.");
      setLoading(false);
      setAlert({
        open: true,
        severity: "error",
        message: "Gagal memuat pengguna.",
      });
    }
  };

  /**
   * Menangani klik tombol tambah pengguna.
   */
  const handleAddClick = () => {
    setFormMode("add");
    setFormData({
      username: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
    setOpenFormDialog(true);
  };

  /**
   * Menangani klik tombol edit pengguna.
   * @param {object} user - Data pengguna yang akan diedit.
   */
  const handleEditClick = (user) => {
    setFormMode("edit");
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      password: "", // Password tidak diisi saat edit
      confirmPassword: "",
    });
    setFormErrors({});
    setOpenFormDialog(true);
  };

  /**
   * Menangani klik tombol hapus pengguna.
   * @param {object} user - Data pengguna yang akan dihapus.
   */
  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setOpenConfirmDialog(true);
  };

  /**
   * Menangani perubahan input form.
   * @param {object} e - Event perubahan input.
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  /**
   * Melakukan validasi form.
   * @returns {boolean} - True jika form valid, false jika tidak.
   */
  const validateForm = () => {
    let errors = {};
    if (!formData.username) errors.username = "Nama Pengguna wajib diisi.";
    if (!formData.email) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      errors.email = "Format email tidak valid.";
    }
    if (!formData.role) errors.role = "Peran wajib dipilih.";

    if (formMode === "add" || (formMode === "edit" && formData.password)) {
      if (!formData.password) errors.password = "Kata Sandi wajib diisi.";
      if (formData.password.length < 6)
        errors.password = "Kata Sandi minimal 6 karakter.";
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Konfirmasi Kata Sandi tidak cocok.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Menangani submit form (tambah/edit pengguna).
   */
  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulasi API call
      if (formMode === "add") {
        setUsers([...users, { id: String(users.length + 1), ...formData }]);
        setAlert({
          open: true,
          severity: "success",
          message: "Pengguna berhasil ditambahkan!",
        });
      } else {
        setUsers(
          users.map((user) =>
            user.id === currentUser.id ? { ...user, ...formData } : user
          )
        );
        setAlert({
          open: true,
          severity: "success",
          message: "Pengguna berhasil diperbarui!",
        });
      }
      setOpenFormDialog(false);
      setLoading(false);
    } catch (err) {
      setAlert({
        open: true,
        severity: "error",
        message: `Gagal ${
          formMode === "add" ? "menambahkan" : "memperbarui"
        } pengguna.`,
      });
      setLoading(false);
    }
  };

  /**
   * Menangani konfirmasi penghapusan pengguna.
   */
  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulasi API call
      setUsers(users.filter((user) => user.id !== currentUser.id));
      setAlert({
        open: true,
        severity: "success",
        message: "Pengguna berhasil dihapus!",
      });
      setOpenConfirmDialog(false);
      setLoading(false);
    } catch (err) {
      setAlert({
        open: true,
        severity: "error",
        message: "Gagal menghapus pengguna.",
      });
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Manajemen Pengguna"
        subtitle="Kelola pengguna sistem"
        actions={[
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Tambah Pengguna
          </Button>,
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchUsers} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>,
        ]}
      />

      <AlertMessage
        open={alert.open}
        severity={alert.severity}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
      />

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        emptyMessage="Tidak ada pengguna yang ditemukan."
      />

      {/* Form Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {formMode === "add" ? "Tambah Pengguna Baru" : "Edit Pengguna"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Nama Pengguna"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={handleFormChange}
            error={!!formErrors.username}
            helperText={formErrors.username}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleFormChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="role"
            label="Peran"
            select
            fullWidth
            variant="outlined"
            value={formData.role}
            onChange={handleFormChange}
            error={!!formErrors.role}
            helperText={formErrors.role}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Pilih Peran</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="password"
            label="Kata Sandi"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleFormChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Konfirmasi Kata Sandi"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.confirmPassword}
            onChange={handleFormChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormDialog(false)} color="secondary">
            Batal
          </Button>
          <Button
            onClick={handleFormSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : formMode === "add" ? (
              "Tambah"
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna ${currentUser?.username}?`}
        confirmText="Hapus"
        cancelText="Batal"
        loading={loading}
      />
    </Box>
  );
};

export default UserManagement;
