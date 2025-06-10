import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

/**
 * AuthLayout Component
 *
 * Komponen layout untuk halaman otentikasi (login, register, dll.).
 * Menyediakan struktur dasar dengan latar belakang modern dan full-screen design.
 */
const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Outlet />
    </Box>
  );
};

export default AuthLayout;