import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Schedule as ScheduleIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import feedbackService from "../../api/feedbackService";

const ConsumerStatus = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchConsumerStatus();
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchConsumerStatus, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchConsumerStatus = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await feedbackService.getConsumerStatus();
      setStatus(response.data || response);
    } catch (err) {
      setError("Failed to fetch consumer status.");
      console.error("Error fetching consumer status:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    navigate("/feedback");
  };

  const getStatusChip = (isRunning) => {
    return isRunning ? (
      <Chip
        icon={<CheckCircleIcon />}
        label="Running"
        color="success"
        variant="outlined"
        sx={{ fontWeight: "bold" }}
      />
    ) : (
      <Chip
        icon={<StopIcon />}
        label="Stopped"
        color="error"
        variant="outlined"
        sx={{ fontWeight: "bold" }}
      />
    );
  };

  const getConnectionStatusChip = (isConnected) => {
    return isConnected ? (
      <Chip
        icon={<CheckCircleIcon />}
        label="Connected"
        color="success"
        variant="outlined"
        sx={{ fontWeight: "bold" }}
      />
    ) : (
      <Chip
        icon={<ErrorIcon />}
        label="Disconnected"
        color="error"
        variant="outlined"
        sx={{ fontWeight: "bold" }}
      />
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (ms) => {
    if (!ms) return "0s";
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
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
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Feedback List
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchConsumerStatus}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh Status"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Machine Queue Consumer Status
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              title="Consumer Status"
              avatar={
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <SettingsIcon />
                </Avatar>
              }
              action={
                <Tooltip title="Last updated">
                  <Typography variant="caption" sx={{ pt: 1, pr: 2 }}>
                    {status?.lastUpdated
                      ? `Updated: ${formatTimestamp(status.lastUpdated)}`
                      : ""}
                  </Typography>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SpeedIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Status"
                    secondary={getStatusChip(status?.isRunning)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SyncIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Uptime"
                    secondary={formatDuration(status?.uptime)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Started At"
                    secondary={formatTimestamp(status?.startedAt)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MemoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Memory Usage"
                    secondary={
                      status?.memoryUsage
                        ? `${Math.round(status.memoryUsage / 1024 / 1024)} MB`
                        : "Unknown"
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              title="RabbitMQ Connection"
              avatar={
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  <SyncIcon />
                </Avatar>
              }
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Connection Status"
                    secondary={getConnectionStatusChip(status?.rabbitmq?.connected)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Connected"
                    secondary={formatTimestamp(status?.rabbitmq?.lastConnected)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Connection Errors"
                    secondary={status?.rabbitmq?.connectionErrors || 0}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Queue Name"
                    secondary={status?.rabbitmq?.queueName || "machine_queue"}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader
              title="Processing Statistics"
              avatar={
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <SpeedIcon />
                </Avatar>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#e3f2fd",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Messages Processed
                    </Typography>
                    <Typography variant="h3" color="primary.main">
                      {status?.stats?.messagesProcessed || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#e8f5e9",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Successful
                    </Typography>
                    <Typography variant="h3" color="success.main">
                      {status?.stats?.successfulProcessed || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#ffebee",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Failed
                    </Typography>
                    <Typography variant="h3" color="error.main">
                      {status?.stats?.failedProcessed || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#fff8e1",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Avg. Process Time
                    </Typography>
                    <Typography variant="h3" color="warning.main">
                      {status?.stats?.avgProcessingTime
                        ? `${status.stats.avgProcessingTime.toFixed(2)}ms`
                        : "N/A"}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {status?.recentActivity && status.recentActivity.length > 0 ? (
                    status.recentActivity.map((activity, index) => (
                      <ListItem key={index} divider={index !== status.recentActivity.length - 1}>
                        <ListItemIcon>
                          {activity.success ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <ErrorIcon color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.message}
                          secondary={formatTimestamp(activity.timestamp)}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No recent activity recorded" />
                    </ListItem>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsumerStatus;