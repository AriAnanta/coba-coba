import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar,
  Fade,
  Grow,
  Stack,
  useTheme,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Factory as FactoryIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalMachines: 0,
    activeMachines: 0,
    totalMaterials: 0,
    lowStockMaterials: [],
    recentTransactions: [],
    productionSummary: {
      totalRequests: 0,
      completedBatches: 0,
      inProgressBatches: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData({
        totalMachines: 12,
        activeMachines: 8,
        totalMaterials: 45,
        lowStockMaterials: [
          { id: 1, name: 'Steel Plate', currentStock: 5, minStock: 10, unit: 'kg' },
          { id: 2, name: 'Aluminum Wire', currentStock: 2, minStock: 15, unit: 'meter' },
          { id: 3, name: 'Copper Rod', currentStock: 8, minStock: 20, unit: 'piece' }
        ],
        recentTransactions: [
          { id: 1, material: 'Steel Plate', type: 'INCOMING', quantity: 50, date: new Date() },
          { id: 2, material: 'Aluminum Wire', type: 'OUTGOING', quantity: 25, date: new Date() },
          { id: 3, material: 'Copper Rod', type: 'INCOMING', quantity: 30, date: new Date() }
        ],
        productionSummary: {
          totalRequests: 24,
          completedBatches: 18,
          inProgressBatches: 6
        }
      });
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'primary', gradient }) => (
    <Grow in timeout={600}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'grey.200',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderColor: 'primary.main',
          },
        }}
      >
        {/* Header with gradient */}
        <Box
          sx={{
            background: gradient || `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, opacity: 0.9 }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 56,
                height: 56,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </Box>
        
        <CardContent sx={{ p: 3 }}>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grow>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Fade in>
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      </Fade>
    );
  }

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
              Manufacturing Dashboard 📊
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: { xs: '100%', md: 600 } }}>
              Real-time overview of your manufacturing operations, production metrics, and system status.
            </Typography>
          </Box>
        </Paper>
      </Fade>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Machines"
            value={dashboardData.totalMachines}
            subtitle={`${dashboardData.activeMachines} machines currently active`}
            icon={<BuildIcon sx={{ fontSize: 32 }} />}
            color="primary"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Material Inventory"
            value={dashboardData.totalMaterials}
            subtitle={`${dashboardData.lowStockMaterials.length} items need restocking`}
            icon={<InventoryIcon sx={{ fontSize: 32 }} />}
            color="info"
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Production Requests"
            value={dashboardData.productionSummary.totalRequests}
            subtitle="Total active requests"
            icon={<AssessmentIcon sx={{ fontSize: 32 }} />}
            color="success"
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Batches"
            value={dashboardData.productionSummary.inProgressBatches}
            subtitle="Currently in production"
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            color="warning"
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          />
        </Grid>

        {/* Machine Utilization */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={800}>
            <Card sx={{ height: '100%', border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <BuildIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Machine Utilization
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Active Machines
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dashboardData.activeMachines} / {dashboardData.totalMachines}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(dashboardData.activeMachines / dashboardData.totalMachines) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'primary.light', 
                  color: 'primary.contrastText',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {Math.round((dashboardData.activeMachines / dashboardData.totalMachines) * 100)}%
                  </Typography>
                  <Typography variant="body2">
                    Overall Utilization
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Production Summary */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1000}>
            <Card sx={{ height: '100%', border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <FactoryIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Production Summary
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
                        {dashboardData.productionSummary.totalRequests}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Requests
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                        {dashboardData.productionSummary.completedBatches}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                        {dashboardData.productionSummary.inProgressBatches}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Low Stock Materials */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1200}>
            <Card sx={{ height: '100%', border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <WarningIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Low Stock Alert
                  </Typography>
                </Box>
                
                {dashboardData.lowStockMaterials.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {dashboardData.lowStockMaterials.map((material, index) => (
                      <Box key={material.id}>
                        <ListItem 
                          sx={{ 
                            px: 0,
                            py: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {material.name}
                              </Typography>
                            }
                            secondary={`Current: ${material.currentStock} ${material.unit} (Min: ${material.minStock})`}
                          />
                          <Chip 
                            label="Low Stock" 
                            color="warning" 
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        {index < dashboardData.lowStockMaterials.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: 'text.secondary'
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 48, mb: 2, color: 'success.main' }} />
                    <Typography variant="body1">
                      All materials are well stocked
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1400}>
            <Card sx={{ height: '100%', border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Transactions
                  </Typography>
                </Box>
                
                {dashboardData.recentTransactions.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {dashboardData.recentTransactions.map((transaction, index) => (
                      <Box key={transaction.id}>
                        <ListItem 
                          sx={{ 
                            px: 0,
                            py: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {transaction.material}
                              </Typography>
                            }
                            secondary={`${transaction.quantity} units - ${transaction.date.toLocaleDateString()}`}
                          />
                          <Chip 
                            label={transaction.type} 
                            color={transaction.type === 'INCOMING' ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        {index < dashboardData.recentTransactions.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: 'text.secondary'
                  }}>
                    <Typography variant="body1">
                      No recent transactions
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;