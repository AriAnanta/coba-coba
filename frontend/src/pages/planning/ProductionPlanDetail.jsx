import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  Stack,
  Grow,
  Fade,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import {
  GET_PLAN,
  DELETE_PLAN,
  APPROVE_PLAN,
} from "../../graphql/productionPlanning";

// Status chip component
const StatusChip = ({ status }) => {
  let color = "default";
  switch (status) {
    case "DRAFT":
      color = "default";
      break;
    case "PENDING_APPROVAL":
      color = "warning";
      break;
    case "APPROVED":
      color = "success";
      break;
    case "REJECTED":
      color = "error";
      break;
    case "IN_PROGRESS":
      color = "primary";
      break;
    case "COMPLETED":
      color = "info";
      break;
    default:
      color = "default";
  }

  return <Chip label={status.replace("_", " ")} color={color} size="small" />;
};

const ProductionPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);

  // Query for production plan details
  const { loading, error, data, refetch } = useQuery(GET_PLAN, {
    variables: { id },
    fetchPolicy: "cache-and-network",
  });

  // Mutation for deleting a plan
  const [deletePlan, { loading: deleteLoading }] = useMutation(DELETE_PLAN, {
    onCompleted: () => {
      toast.success("Production plan deleted successfully");
      navigate("/production-plans");
    },
    onError: (error) => {
      toast.error(`Failed to delete production plan: ${error.message}`);
    },
  });

  // Mutation for approving a plan
  const [approvePlan, { loading: approveLoading }] = useMutation(APPROVE_PLAN, {
    onCompleted: () => {
      toast.success("Production plan approved successfully");
      setOpenApproveDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to approve production plan: ${error.message}`);
    },
  });

  // Open delete dialog
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Open approve dialog
  const handleOpenApproveDialog = () => {
    setOpenApproveDialog(true);
  };

  // Close approve dialog
  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
  };

  // Handle delete plan
  const handleDeletePlan = () => {
    deletePlan({
      variables: {
        id,
      },
    });
  };

  // Handle approve plan
  const handleApprovePlan = () => {
    approvePlan({
      variables: {
        id,
      },
    });
  };

  // Navigate to edit plan page
  const handleEditPlan = () => {
    navigate(`/production-plans/${id}/edit`);
  };

  // Navigate back to plans list
  const handleBack = () => {
    navigate("/production-plans");
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading production plan: {error.message}
      </Alert>
    );
  }

  if (!data || !data.plan) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Production plan not found
      </Alert>
    );
  }

  const { plan } = data;
  const isDraft = plan.status && plan.status.toUpperCase() === "DRAFT";
  const isPendingApproval =
    plan.status && plan.status.toUpperCase() === "PENDING_APPROVAL";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
        p: { xs: 2, sm: 3 },
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <Fade in timeout={600}>
        <Card
          elevation={0}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 3,
            width: "100%",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 3, sm: 0 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    mr: { xs: 2, sm: 3 },
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: "1.75rem", sm: "2.125rem" },
                    }}
                  >
                    Production Plan Details
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Plan ID: {plan.planId}
                  </Typography>
                </Box>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)",
                    },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Back
                </Button>
                {isDraft && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEditPlan}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.1)",
                        color: "white",
                        borderColor: "rgba(255,255,255,0.5)",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.2)",
                        },
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleOpenDeleteDialog}
                      sx={{
                        bgcolor: "rgba(244, 67, 54, 0.8)",
                        "&:hover": {
                          bgcolor: "rgba(244, 67, 54, 1)",
                        },
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Delete
                    </Button>
                  </>
                )}
                {isPendingApproval && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleOpenApproveDialog}
                    sx={{
                      bgcolor: "rgba(76, 175, 80, 0.8)",
                      "&:hover": {
                        bgcolor: "rgba(76, 175, 80, 1)",
                      },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    Approve
                  </Button>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Plan Details */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Grow in timeout={800}>
            <Card
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <InfoIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Plan Information
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Product Name
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {plan.productName}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Notes
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {plan.planningNotes}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <StatusChip status={plan.status} />
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Planned Start Date
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {plan.plannedStartDate
                          ? format(
                              parseISO(plan.plannedStartDate),
                              "dd MMM yyyy"
                            )
                          : "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Planned End Date
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {plan.plannedEndDate
                          ? format(parseISO(plan.plannedEndDate), "dd MMM yyyy")
                          : "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Plan ID
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{plan.planId}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Request ID
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{plan.requestId}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Production Request ID
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {plan.productionRequestId || "-"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Priority
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{plan.priority}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Planned Batches
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {plan.plannedBatches || "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Created At
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {plan.createdAt
                          ? format(
                              parseISO(plan.createdAt),
                              "dd MMM yyyy HH:mm"
                            )
                          : "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Updated At
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {plan.updatedAt
                          ? format(
                              parseISO(plan.updatedAt),
                              "dd MMM yyyy HH:mm"
                            )
                          : "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Delete Plan Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Production Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this production plan? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeletePlan}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Plan Dialog */}
      <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog}>
        <DialogTitle>Approve Production Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this production plan? This will
            make the plan available for execution.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog}>Cancel</Button>
          <Button
            onClick={handleApprovePlan}
            color="success"
            disabled={approveLoading}
            startIcon={approveLoading && <CircularProgress size={20} />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionPlanDetail;
