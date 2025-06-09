import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Divider,
  Chip,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Tooltip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  ErrorOutline as IssueIcon,
  Schedule as ScheduleIcon,
  ShoppingCart as MarketplaceIcon,
  Notifications as NotificationIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Factory as FactoryIcon,
  Category as ProductIcon,
  Note as NoteIcon,
} from "@mui/icons-material";
import feedbackService from "../../api/feedbackService";

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [newProgress, setNewProgress] = useState(0);
  const [progressNote, setProgressNote] = useState("");
  const [marketplaceDialogOpen, setMarketplaceDialogOpen] = useState(false);
  const [newMarketplaceStatus, setNewMarketplaceStatus] = useState("");
  const [marketplaceNote, setMarketplaceNote] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchFeedbackDetails();
  }, [id]);

  const fetchFeedbackDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedbackService.getFeedbackById(id);
      setFeedback(response.data || response);
      // Set initial values for dialogs
      if (response.data || response) {
        const data = response.data || response;
        setNewStatus(data.status || "");
        setNewProgress(data.completionPercentage || 0);
        setNewMarketplaceStatus(data.marketplaceUpdateStatus || "");
      }
    } catch (err) {
      setError("Failed to fetch feedback details.");
      console.error("Error fetching feedback details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!id) return;
    try {
      setNotificationsLoading(true);
      const response = await feedbackService.getAllNotifications();
      // Filter notifications related to this feedback
      const feedbackNotifications = (response.data || response || []).filter(
        (notification) => notification.feedbackId === id
      );
      setNotifications(feedbackNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 1) {
      fetchNotifications();
    }
  }, [tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate("/feedback");
  };

  const handleEdit = () => {
    navigate(`/feedback/${id}/edit`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await feedbackService.deleteFeedback(id);
      setDeleteDialogOpen(false);
      navigate("/feedback", { state: { message: "Feedback deleted successfully" } });
    } catch (err) {
      setError("Failed to delete feedback.");
      console.error("Error deleting feedback:", err);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleStatusDialogOpen = () => {
    setNewStatus(feedback?.status || "");
    setStatusNote("");
    setStatusDialogOpen(true);
  };

  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
  };

  const handleStatusUpdate = async () => {
    try {
      await feedbackService.updateFeedbackStatus(id, {
        status: newStatus,
        notes: statusNote,
      });
      setStatusDialogOpen(false);
      fetchFeedbackDetails();
    } catch (err) {
      setError("Failed to update status.");
      console.error("Error updating status:", err);
    }
  };

  const handleProgressDialogOpen = () => {
    setNewProgress(feedback?.completionPercentage || 0);
    setProgressNote("");
    setProgressDialogOpen(true);
  };

  const handleProgressDialogClose = () => {
    setProgressDialogOpen(false);
  };

  const handleProgressUpdate = async () => {
    try {
      await feedbackService.updateFeedbackProgress(id, {
        completionPercentage: newProgress,
        notes: progressNote,
      });
      setProgressDialogOpen(false);
      fetchFeedbackDetails();
    } catch (err) {
      setError("Failed to update progress.");
      console.error("Error updating progress:", err);
    }
  };

  const handleMarketplaceDialogOpen = () => {
    setNewMarketplaceStatus(feedback?.marketplaceUpdateStatus || "");
    setMarketplaceNote("");
    setMarketplaceDialogOpen(true);
  };

  const handleMarketplaceDialogClose = () => {
    setMarketplaceDialogOpen(false);
  };

  const handleMarketplaceUpdate = async () => {
    try {
      await feedbackService.updateMarketplaceStatus(id, {
        marketplaceUpdateStatus: newMarketplaceStatus,
        notes: marketplaceNote,
      });
      setMarketplaceDialogOpen(false);
      fetchFeedbackDetails();
    } catch (err) {
      setError("Failed to update marketplace status.");
      console.error("Error updating marketplace status:", err);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: {
        color: "warning",
        label: "Pending",
        bgcolor: "#fff3e0",
        icon: <PendingIcon />,
      },
      in_progress: {
        color: "info",
        label: "In Progress",
        bgcolor: "#e3f2fd",
        icon: <ScheduleIcon />,
      },
      completed: {
        color: "success",
        label: "Completed",
        bgcolor: "#e8f5e9",
        icon: <CompletedIcon />,
      },
      issue: {
        color: "error",
        label: "Issue",
        bgcolor: "#ffebee",
        icon: <IssueIcon />,
      },
    };

    const config = statusConfig[status] || {
      color: "default",
      label: status,
      bgcolor: "#f5f5f5",
      icon: null,
    };

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        sx={{
          fontWeight: 500,
          bgcolor: config.bgcolor,
          color:
            config.color === "default"
              ? "text.primary"
              : `${config.color}.main`,
          border: `1px solid`,
          borderColor:
            config.color === "default" ? "grey.300" : `${config.color}.light`,
          px: 1,
          "& .MuiChip-icon": {
            color:
              config.color === "default"
                ? "text.primary"
                : `${config.color}.main`,
          },
        }}
      />
    );
  };

  const getMarketplaceChip = (marketplaceStatus) => {
    const statusConfig = {
      pending: {
        color: "warning",
        label: "Pending",
        bgcolor: "#fff3e0",
      },
      updated: {
        color: "success",
        label: "Updated",
        bgcolor: "#e8f5e9",
      },
      not_required: {
        color: "default",
        label: "N/A",
        bgcolor: "#f5f5f5",
      },
    };

    const config = statusConfig[marketplaceStatus] || {
      color: "default",
      label: marketplaceStatus || "N/A",
      bgcolor: "#f5f5f5",
    };

    return (
      <Chip
        icon={<MarketplaceIcon />}
        label={config.label}
        sx={{
          fontWeight: 500,
          bgcolor: config.bgcolor,
          color:
            config.color === "default"
              ? "text.primary"
              : `${config.color}.main`,
          border: `1px solid`,
          borderColor:
            config.color === "default" ? "grey.300" : `${config.color}.light`,
          px: 1,
          "& .MuiChip-icon": {
            color:
              config.color === "default"
                ? "text.primary"
                : `${config.color}.main`,
          },
        }}
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Back to Feedback List
        </Button>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!feedback) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Back to Feedback List
        </Button>
        <Alert severity="warning">
          Feedback not found. It may have been deleted or you don't have
          permission to view it.
        </Alert>
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
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Feedback Details
          </Typography>
          {getStatusChip(feedback.status)}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader
                title="Basic Information"
                avatar={
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <AssignmentIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Feedback ID
                    </Typography>
                    <Typography variant="body1">{feedback.feedbackId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {getStatusChip(feedback.status)}
                      <Tooltip title="Update Status">
                        <IconButton
                          size="small"
                          onClick={handleStatusDialogOpen}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Production ID
                    </Typography>
                    <Typography variant="body1">
                      {feedback.productionId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Batch ID
                    </Typography>
                    <Typography variant="body1">{feedback.batchId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Product ID
                    </Typography>
                    <Typography variant="body1">{feedback.productId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Marketplace Update
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {getMarketplaceChip(feedback.marketplaceUpdateStatus)}
                      <Tooltip title="Update Marketplace Status">
                        <IconButton
                          size="small"
                          onClick={handleMarketplaceDialogOpen}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader
                title="Production Details"
                avatar={
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    <FactoryIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {feedback.startDate
                        ? new Date(feedback.startDate).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {feedback.endDate
                        ? new Date(feedback.endDate).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Completion Progress
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: 1,
                        mb: 1,
                      }}
                    >
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={feedback.completionPercentage || 0}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: "#e0e0e0",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 5,
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {`${Math.round(feedback.completionPercentage || 0)}%`}
                        </Typography>
                      </Box>
                      <Tooltip title="Update Progress">
                        <IconButton
                          size="small"
                          onClick={handleProgressDialogOpen}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader
                title="Quality Information"
                avatar={
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <AssignmentIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Quality Score
                    </Typography>
                    <Typography variant="body1">
                      {feedback.qualityScore ? (
                        <Chip
                          label={`${feedback.qualityScore}/10`}
                          size="small"
                          color={
                            feedback.qualityScore >= 8
                              ? "success"
                              : feedback.qualityScore >= 6
                              ? "warning"
                              : "error"
                          }
                          variant="outlined"
                          sx={{ fontWeight: "bold" }}
                        />
                      ) : (
                        "Not yet assessed"
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expected Quantity
                    </Typography>
                    <Typography variant="body1">
                      {feedback.expectedQuantity || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Actual Quantity
                    </Typography>
                    <Typography variant="body1">
                      {feedback.actualQuantity || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Defective Quantity
                    </Typography>
                    <Typography variant="body1">
                      {feedback.defectiveQuantity || "N/A"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Notes"
                avatar={
                  <Avatar sx={{ bgcolor: "info.main" }}>
                    <NoteIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="body1">
                  {feedback.notes || "No notes available"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Details" />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <Chip
                    label={notifications.length}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 ? (
            <Typography variant="body1">
              Additional details about this feedback will be displayed here.
            </Typography>
          ) : (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Notification History</Typography>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={fetchNotifications}
                  disabled={notificationsLoading}
                >
                  Refresh
                </Button>
              </Box>

              {notificationsLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight="200px"
                >
                  <CircularProgress />
                </Box>
              ) : notifications.length > 0 ? (
                <List>
                  {notifications.map((notification) => (
                    <ListItem
                      key={notification.id || notification.notificationId}
                      alignItems="flex-start"
                      sx={{
                        mb: 1,
                        bgcolor: notification.isRead
                          ? "transparent"
                          : "action.hover",
                        borderRadius: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: `${getNotificationPriorityColor(
                              notification.priority
                            )}.main`,
                          }}
                        >
                          <NotificationIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: notification.isRead ? 400 : 600 }}
                          >
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              {notification.message}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {notification.createdAt
                                  ? new Date(
                                      notification.createdAt
                                    ).toLocaleString()
                                  : "Unknown date"}
                              </Typography>
                              <Chip
                                label={notification.type || "System"}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 4,
                  }}
                >
                  <NotificationIcon
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No notifications found
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    There are no notifications related to this feedback yet.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose}>
        <DialogTitle>Update Feedback Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the status of this production feedback.
          </DialogContentText>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="issue">Issue</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            id="status-note"
            label="Note (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog open={progressDialogOpen} onClose={handleProgressDialogClose}>
        <DialogTitle>Update Completion Progress</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the completion percentage of this production feedback.
          </DialogContentText>
          <Box sx={{ width: "100%", mb: 2 }}>
            <Typography
              id="progress-slider-label"
              gutterBottom
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>Completion Percentage</span>
              <span>{newProgress}%</span>
            </Typography>
            <TextField
              type="number"
              value={newProgress}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  setNewProgress(value);
                }
              }}
              inputProps={{
                min: 0,
                max: 100,
                step: 1,
              }}
              fullWidth
            />
            <LinearProgress
              variant="determinate"
              value={newProgress}
              sx={{ height: 10, borderRadius: 5, mt: 1 }}
            />
          </Box>
          <TextField
            margin="dense"
            id="progress-note"
            label="Note (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={progressNote}
            onChange={(e) => setProgressNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProgressDialogClose}>Cancel</Button>
          <Button
            onClick={handleProgressUpdate}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Marketplace Update Dialog */}
      <Dialog
        open={marketplaceDialogOpen}
        onClose={handleMarketplaceDialogClose}
      >
        <DialogTitle>Update Marketplace Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the marketplace status of this production feedback.
          </DialogContentText>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="marketplace-status-select-label">
              Marketplace Status
            </InputLabel>
            <Select
              labelId="marketplace-status-select-label"
              id="marketplace-status-select"
              value={newMarketplaceStatus}
              label="Marketplace Status"
              onChange={(e) => setNewMarketplaceStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="updated">Updated</MenuItem>
              <MenuItem value="not_required">Not Required</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            id="marketplace-note"
            label="Note (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={marketplaceNote}
            onChange={(e) => setMarketplaceNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMarketplaceDialogClose}>Cancel</Button>
          <Button
            onClick={handleMarketplaceUpdate}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Feedback Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this feedback? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackDetail;