import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  useTheme,
  Avatar,
  Fade,
  Grow,
  LinearProgress,
} from '@mui/material';
import {
  Factory as FactoryIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  Feedback as FeedbackIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { GET_PRODUCTION_REQUESTS_SUMMARY } from '../graphql/productionManagement';
import { GET_PLANS_SUMMARY } from '../graphql/productionPlanning';
import { GET_MACHINES_SUMMARY } from '../graphql/machineQueue';
import { GET_MATERIALS_SUMMARY } from '../graphql/materialInventory';
import { GET_FEEDBACK_SUMMARY } from '../graphql/productionFeedback';
import { GET_USERS_SUMMARY } from '../graphql/userService';

// Enhanced Dashboard service card component
const ServiceCard = ({ title, icon, count, status, loading, error, linkTo, buttonText }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const getGradientColor = (title) => {
    const gradients = {
      'Production Management': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Production Planning': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Machine Queue': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Material Inventory': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Production Feedback': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'User Management': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    };
    return gradients[title] || gradients['Production Management'];
  };

  return (
    <Grow in timeout={600}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'grey.200',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderColor: 'primary.main',
          },
        }}
      >
        {/* Header with gradient */}
        <Box
          sx={{
            background: getGradientColor(title),
            p: 3,
            color: 'white',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'rgba(255,255,255,0.3)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 48,
                height: 48,
                mr: 2,
              }}
            >
              {icon}
            </Avatar>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
            {loading ? (
              <CircularProgress size={32} color="inherit" />
            ) : error ? (
              '—'
            ) : (
              count
            )}
          </Typography>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {loading ? (
            <Box sx={{ mt: 2 }}>
              <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading data...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" variant="outlined" sx={{ mt: 1 }}>
              Failed to load
            </Alert>
          ) : (
            <Box>
              {status && status.length > 0 && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {status.slice(0, 3).map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={item.status}
                        size="small"
                        color={item.color || 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.count}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate(linkTo)}
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontWeight: 500,
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            {buttonText || 'View Details'}
          </Button>
        </CardActions>
      </Card>
    </Grow>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();

  // Production Management
  const {
    data: productionData,
    loading: productionLoading,
    error: productionError,
  } = useQuery(GET_PRODUCTION_REQUESTS_SUMMARY);

  // Production Planning
  const {
    data: planningData,
    loading: planningLoading,
    error: planningError,
  } = useQuery(GET_PLANS_SUMMARY);

  // Machine Queue
  const {
    data: machineData,
    loading: machineLoading,
    error: machineError,
  } = useQuery(GET_MACHINES_SUMMARY);

  // Material Inventory
  const {
    data: materialData,
    loading: materialLoading,
    error: materialError,
  } = useQuery(GET_MATERIALS_SUMMARY);

  // Production Feedback
  const {
    data: feedbackData,
    loading: feedbackLoading,
    error: feedbackError,
  } = useQuery(GET_FEEDBACK_SUMMARY);

  // User Service
  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USERS_SUMMARY);

  // Process data for display
  const productionSummary = productionData?.productionRequestsSummary || {
    total: 0,
    status: [],
  };

  const planningSummary = planningData?.plansSummary || {
    total: 0,
    status: [],
  };

  const machineSummary = machineData?.machinesSummary || {
    total: 0,
    status: [],
  };

  const materialSummary = materialData?.materialsSummary || {
    total: 0,
    status: [],
  };

  const feedbackSummary = feedbackData?.feedbackSummary || {
    total: 0,
    status: [],
  };

  const userSummary = userData?.usersSummary || {
    total: 0,
    status: [],
  };

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '100%',
      mx: 'auto',
      p: { xs: 2, sm: 3 },
      overflow: 'hidden'
    }}>
      {/* Welcome Header */}
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
              Welcome back, {user?.username || 'User'}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: { xs: '100%', md: 600 } }}>
              Your manufacturing command center. Monitor operations, track progress, and manage your on-demand production seamlessly.
            </Typography>
          </Box>
        </Paper>
      </Fade>

      {/* Service Cards Grid */}
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Production Management */}
          <Grid item xs={12} sm={6} lg={4}>
            <ServiceCard
              title="Production Management"
              icon={<FactoryIcon sx={{ fontSize: 28 }} />}
              count={productionSummary.total}
              status={productionSummary.status}
              loading={productionLoading}
              error={productionError}
              linkTo="/production-requests"
              buttonText="Manage Production"
            />
          </Grid>

          {/* Production Planning */}
          <Grid item xs={12} sm={6} lg={4}>
            <ServiceCard
              title="Production Planning"
              icon={<ScheduleIcon sx={{ fontSize: 28 }} />}
              count={planningSummary.total}
              status={planningSummary.status}
              loading={planningLoading}
              error={planningError}
              linkTo="/production-plans"
              buttonText="View Plans"
            />
          </Grid>

          {/* Machine Queue */}
          <Grid item xs={12} sm={6} lg={4}>
            <ServiceCard
              title="Machine Queue"
              icon={<SettingsIcon sx={{ fontSize: 28 }} />}
              count={machineSummary.total}
              status={machineSummary.status}
              loading={machineLoading}
              error={machineError}
              linkTo="/machines"
              buttonText="Manage Machines"
            />
          </Grid>

          {/* Material Inventory */}
          <Grid item xs={12} sm={6} lg={4}>
            <ServiceCard
              title="Material Inventory"
              icon={<InventoryIcon sx={{ fontSize: 28 }} />}
              count={materialSummary.total}
              status={materialSummary.status}
              loading={materialLoading}
              error={materialError}
              linkTo="/materials"
              buttonText="View Inventory"
            />
          </Grid>

          {/* Production Feedback */}
          <Grid item xs={12} sm={6} lg={4}>
            <ServiceCard
              title="Production Feedback"
              icon={<FeedbackIcon sx={{ fontSize: 28 }} />}
              count={feedbackSummary.total}
              status={feedbackSummary.status}
              loading={feedbackLoading}
              error={feedbackError}
              linkTo="/feedback"
              buttonText="View Feedback"
            />
          </Grid>

          {/* User Management */}
          <Grid item xs={12} sm={6} lg={4}>
            <ServiceCard
              title="User Management"
              icon={<PeopleIcon sx={{ fontSize: 28 }} />}
              count={userSummary.total}
              status={userSummary.status}
              loading={userLoading}
              error={userError}
              linkTo="/users"
              buttonText="Manage Users"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;