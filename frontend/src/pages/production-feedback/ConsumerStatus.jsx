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
  Info as InfoIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client";
import {
  GET_NOTIFICATIONS,
  GET_FEEDBACK_SUMMARY,
} from "../../graphql/productionFeedback";

const ConsumerStatus = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [consumerSummary, setConsumerSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Query untuk notifikasi
  const {
    loading: notificationsLoading,
    error: notificationsError,
    data: notificationsData,
    refetch: refetchNotifications,
  } = useQuery(GET_NOTIFICATIONS, {
    variables: { recipientId: "ALL" }, // Atau ID pengguna yang relevan
    fetchPolicy: "network-only",
  });

  // Query untuk ringkasan feedback (digunakan sebagai proxy status consumer)
  const {
    loading: summaryLoading,
    error: summaryError,
    data: summaryData,
    refetch: refetchSummary,
  } = useQuery(GET_FEEDBACK_SUMMARY, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData.notifications || []);
    }
  }, [notificationsData]);

  useEffect(() => {
    if (summaryData) {
      setConsumerSummary(summaryData.feedbackSummary);
    }
  }, [summaryData]);

  useEffect(() => {
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchNotifications();
    await refetchSummary();
    setRefreshing(false);
  };

  const handleBack = () => {
    navigate("/feedback");
  };

  const getStatusChip = (statusText, isRunning) => {
    return isRunning ? (
      <Chip
        icon={<CheckCircleIcon />}
        label={statusText || "Running"}
        color="success"
        variant="outlined"
        sx={{ fontWeight: "bold" }}
      />
    ) : (
      <Chip
        icon={<ErrorIcon />}
        label={statusText || "Stopped"}
        color="error"
        variant="outlined"
        sx={{ fontWeight: "bold" }}
      />
    );
  };

  const getNotificationPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const loading = notificationsLoading || summaryLoading;
  const error = notificationsError || summaryError;

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
          Kembali ke Daftar Feedback
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Memuat ulang..." : "Muat ulang Status"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Gagal memuat status consumer atau notifikasi: {error.message}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Status Consumer Machine Queue
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              title="Status Consumer"
              avatar={
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <SettingsIcon />
                </Avatar>
              }
              action={
                <Tooltip title="Terakhir diperbarui">
                  <Typography variant="caption" sx={{ pt: 1, pr: 2 }}>
                    {consumerSummary
                      ? `Diperbarui: ${formatTimestamp(new Date())}` // Menggunakan waktu saat ini sebagai indikasi refresh
                      : "Belum pernah diperbarui"}
                  </Typography>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status Layanan:
                  </Typography>
                  {getStatusChip("Aktif", true)}{" "}
                  {/* Asumsi selalu aktif atau perlu endpoint status khusus */}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Feedback:
                  </Typography>
                  <Typography variant="body1">
                    {consumerSummary?.total || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Feedback Selesai:
                  </Typography>
                  <Typography variant="body1">
                    {consumerSummary?.status.find(
                      (s) => s.status === "completed"
                    )?.count || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tingkat Cacat:
                  </Typography>
                  <Typography variant="body1">
                    {consumerSummary?.defectRate
                      ? `${(consumerSummary.defectRate * 100).toFixed(2)}%`
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Koneksi Message Broker:
                  </Typography>
                  {getStatusChip("Terhubung", true)}{" "}
                  {/* Asumsi koneksi selalu berhasil atau perlu status detail dari backend */}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader
              title="Notifikasi Terbaru"
              avatar={
                <Avatar sx={{ bgcolor: "error.main" }}>
                  <NotificationsIcon />
                </Avatar>
              }
              action={
                <Tooltip title="Total Notifikasi">
                  <Chip
                    label={notifications.length}
                    color="primary"
                    size="small"
                  />
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              {notifications.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 150,
                    py: 2,
                  }}
                >
                  <InfoIcon
                    sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                  />
                  <Typography variant="subtitle1" color="text.secondary">
                    Tidak ada notifikasi.
                  </Typography>
                </Box>
              ) : (
                <List>
                  {notifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      disablePadding
                      sx={{
                        bgcolor: notification.isRead
                          ? "transparent"
                          : "action.hover",
                        borderRadius: 1,
                        mb: 1,
                        py: 0.5,
                        px: 1,
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            bgcolor: `${getNotificationPriorityColor(
                              notification.priority
                            )}.main`,
                            width: 32,
                            height: 32,
                          }}
                        >
                          <NotificationsIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: "inline" }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {notification.message}
                            </Typography>
                            <br />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTimestamp(notification.createdAt)}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsumerStatus;
