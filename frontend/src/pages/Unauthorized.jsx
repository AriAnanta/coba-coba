import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon, Lock as LockIcon } from '@mui/icons-material';

const Unauthorized = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'error.light',
              mb: 3,
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mb: 4 }}>
            You do not have permission to access this page. Please contact your administrator if you believe this is an error.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/"
              startIcon={<HomeIcon />}
            >
              Go to Home
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.history.back()}
              startIcon={<ArrowBackIcon />}
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;