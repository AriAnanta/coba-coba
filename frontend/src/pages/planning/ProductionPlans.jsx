import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import {
  GET_PLANS,
  DELETE_PLAN,
  APPROVE_PLAN,
} from "../../graphql/productionPlanning";

// Status chip component
const StatusChip = ({ status }) => {
  const statusConfig = {
    DRAFT: { color: "default", label: "Draft", bgcolor: "#f5f5f5" },
    PENDING_APPROVAL: {
      color: "warning",
      label: "Pending Approval",
      bgcolor: "#fff3e0",
    },
    APPROVED: { color: "success", label: "Approved", bgcolor: "#e8f5e8" },
    REJECTED: { color: "error", label: "Rejected", bgcolor: "#ffebee" },
    IN_PROGRESS: { color: "primary", label: "In Progress", bgcolor: "#e8f4fd" },
    COMPLETED: { color: "info", label: "Completed", bgcolor: "#e3f2fd" },
  };

  const config = statusConfig[status] || {
    color: "default",
    label: status,
    bgcolor: "#f5f5f5",
  };
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        fontWeight: 500,
        bgcolor: config.bgcolor,
        color:
          config.color === "default" ? "text.primary" : `${config.color}.main`,
        border: `1px solid`,
        borderColor:
          config.color === "default" ? "grey.300" : `${config.color}.light`,
      }}
    />
  );
};

const ProductionPlans = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Query for production plans
  const { loading, error, data, refetch } = useQuery(GET_PLANS, {
    fetchPolicy: "cache-and-network",
  });

  // Mutation for deleting a plan
  const [deletePlan, { loading: deleteLoading }] = useMutation(DELETE_PLAN, {
    onCompleted: () => {
      toast.success("Production plan deleted successfully");
      setOpenDeleteDialog(false);
      setDeleteReason("");
      refetch();
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

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilterStatus("");
    setSearchTerm("");
    setPage(0);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (id) => {
    setSelectedPlanId(id);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPlanId(null);
    setDeleteReason("");
  };

  // Open approve dialog
  const handleOpenApproveDialog = (id) => {
    setSelectedPlanId(id);
    setOpenApproveDialog(true);
  };

  // Close approve dialog
  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setSelectedPlanId(null);
  };

  // Handle delete plan
  const handleDeletePlan = () => {
    deletePlan({
      variables: {
        id: selectedPlanId,
      },
    });
  };

  // Handle approve plan
  const handleApprovePlan = () => {
    approvePlan({
      variables: {
        id: selectedPlanId,
      },
    });
  };

  // Navigate to create plan page
  const handleCreatePlan = () => {
    navigate("/production-plans/create");
  };

  // Navigate to view plan page
  const handleViewPlan = (id) => {
    navigate(`/production-plans/${id}`);
  };

  // Navigate to edit plan page
  const handleEditPlan = (id) => {
    navigate(`/production-plans/${id}/edit`);
  };

  // Filter and paginate production plans
  const filteredPlans =
    data && data.plans
      ? data.plans.filter(
          (plan) =>
            (plan.productName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
              plan.planningNotes
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) &&
            (filterStatus ? plan.status === filterStatus : true)
        )
      : [];

  const paginatedPlans = filteredPlans.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
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
                    Production Plans
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Plan and schedule production activities
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleCreatePlan}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Create Plan
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Grow in timeout={800}>
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.200",
            width: "100%",
          }}
        >
          {/* Filters Section */}
          <Box
            sx={{
              p: 3,
              bgcolor: "grey.50",
              borderBottom: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search by Name or Description"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Status"
                  value={filterStatus}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterListIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                    },
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={!filterStatus && !searchTerm}
                  fullWidth
                  sx={{ height: "56px" }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ m: 3 }}>
              Error loading production plans: {error.message}
            </Alert>
          )}

          {/* Loading indicator */}
          {loading && !data && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          )}

          {/* Table */}
          {!loading && filteredPlans.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No production plans found.{" "}
              {searchTerm || filterStatus ? "Try clearing filters." : ""}
            </Alert>
          ) : (
            <>
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan ID</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Planned Start Date</TableCell>
                      <TableCell>Planned End Date</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPlans.map((plan) => {
                      const isDraft = plan.status.toUpperCase() === "DRAFT";
                      const isPendingApproval =
                        plan.status.toUpperCase() === "PENDING_APPROVAL";

                      return (
                        <TableRow key={plan.id}>
                          <TableCell>{plan.planId}</TableCell>
                          <TableCell>{plan.productName}</TableCell>
                          <TableCell>
                            {plan.plannedStartDate
                              ? format(
                                  parseISO(plan.plannedStartDate),
                                  "dd MMM yyyy"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {plan.plannedEndDate
                              ? format(
                                  parseISO(plan.plannedEndDate),
                                  "dd MMM yyyy"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>{plan.priority}</TableCell>
                          <TableCell>
                            <StatusChip status={plan.status} />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewPlan(plan.id)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {(isDraft || isPendingApproval) && (
                              <Tooltip title="Edit Plan">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditPlan(plan.id)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(isDraft || isPendingApproval) && (
                              <Tooltip title="Delete Plan">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleOpenDeleteDialog(plan.id)
                                  }
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(isDraft || isPendingApproval) && (
                              <Tooltip title="Approve Plan">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() =>
                                    handleOpenApproveDialog(plan.id)
                                  }
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredPlans.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: "1px solid",
                  borderColor: "grey.200",
                  bgcolor: "grey.50",
                }}
              />
            </>
          )}
        </Paper>
      </Grow>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "error.main",
            color: "white",
            py: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Delete Production Plan
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <DialogContentText sx={{ mb: 3 }}>
            Are you sure you want to delete this production plan? This action
            cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            label="Reason for Deletion"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: "grey.50" }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeletePlan}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog
        open={openApproveDialog}
        onClose={handleCloseApproveDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "success.main",
            color: "white",
            py: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Approve Production Plan
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <DialogContentText>
            Are you sure you want to approve this production plan? This will
            make the plan available for execution.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: "grey.50" }}>
          <Button onClick={handleCloseApproveDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleApprovePlan}
            color="success"
            variant="contained"
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

export default ProductionPlans;
