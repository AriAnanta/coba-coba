import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Avatar, Grid, TextField, MenuItem, CircularProgress, Divider, Paper } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { PageHeader, AlertMessage } from '../../components/common';

/**
 * UserProfile Component
 *
 * Komponen untuk menampilkan dan mengedit profil pengguna.
 * Menampilkan informasi pengguna seperti nama, email, peran, dan memungkinkan pengguna untuk mengedit profilnya.
 */
const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    fullName: '',
    phoneNumber: '',
    department: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, severity: '', message: '' });

  // Mengambil data profil pengguna saat komponen dimuat
  useEffect(() => {
    fetchUserProfile();
  }, []);

  /**
   * Mengambil data profil pengguna dari API.
   */
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulasi panggilan API
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userData = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'Admin',
        fullName: 'Administrator',
        phoneNumber: '+62812345678',
        department: 'IT',
        lastLogin: '2023-05-15T08:30:00Z',
        createdAt: '2023-01-01T00:00:00Z',
      };
      setProfile(userData);
      setFormData({
        username: userData.username,
        email: userData.email,
        role: userData.role,
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
        department: userData.department || '',
      });
      setLoading(false);
    } catch (err) {
      setError('Gagal memuat profil pengguna.');
      setLoading(false);
      setAlert({ open: true, severity: 'error', message: 'Gagal memuat profil pengguna.' });
    }
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
    if (!formData.username) errors.username = 'Nama Pengguna wajib diisi.';
    if (!formData.email) {
      errors.email = 'Email wajib diisi.';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      errors.email = 'Format email tidak valid.';
    }
    if (!formData.fullName) errors.fullName = 'Nama Lengkap wajib diisi.';
    if (formData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Format nomor telepon tidak valid.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Menangani klik tombol edit profil.
   */
  const handleEditClick = () => {
    setIsEditing(true);
  };

  /**
   * Menangani klik tombol batal edit.
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data ke data profil asli
    if (profile) {
      setFormData({
        username: profile.username,
        email: profile.email,
        role: profile.role,
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        department: profile.department || '',
      });
    }
    setFormErrors({});
  };

  /**
   * Menangani submit form update profil.
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulasi panggilan API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profil dengan data baru
      const updatedProfile = {
        ...profile,
        ...formData,
      };
      setProfile(updatedProfile);
      setIsEditing(false);
      setAlert({ open: true, severity: 'success', message: 'Profil berhasil diperbarui!' });
      setLoading(false);
    } catch (err) {
      setAlert({ open: true, severity: 'error', message: 'Gagal memperbarui profil.' });
      setLoading(false);
    }
  };

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Box>
      <PageHeader
        title="Profil Pengguna"
        subtitle="Lihat dan kelola informasi profil Anda"
        actions={[
          !isEditing ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              disabled={loading}
            >
              Edit Profil
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Simpan'}
              </Button>
            </Box>
          ),
        ]}
      />

      <AlertMessage
        open={alert.open}
        severity={alert.severity}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
      />

      {loading && !profile ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ my: 2 }}>
          {error}
        </Typography>
      ) : profile ? (
        <Grid container spacing={3}>
          {/* Kartu Profil */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {profile.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {profile.fullName || profile.username}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {profile.role}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Login Terakhir
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {formatDate(profile.lastLogin)}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                  Terdaftar Sejak
                </Typography>
                <Typography variant="body2">
                  {formatDate(profile.createdAt)}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Form Detail Profil */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informasi Pengguna
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nama Pengguna"
                    name="username"
                    value={formData.username}
                    onChange={handleFormChange}
                    disabled={!isEditing || loading}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    disabled={!isEditing || loading}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nama Lengkap"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    disabled={!isEditing || loading}
                    error={!!formErrors.fullName}
                    helperText={formErrors.fullName}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nomor Telepon"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    disabled={!isEditing || loading}
                    error={!!formErrors.phoneNumber}
                    helperText={formErrors.phoneNumber}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Departemen"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    disabled={!isEditing || loading}
                    select
                    margin="normal"
                  >
                    <MenuItem value="">Pilih Departemen</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="HR">HR</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Production">Production</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Peran"
                    name="role"
                    value={formData.role}
                    disabled={true} // Peran tidak dapat diubah oleh pengguna
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export default UserProfile;