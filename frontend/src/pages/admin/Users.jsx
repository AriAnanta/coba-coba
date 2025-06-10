import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
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
  Grid,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Autocomplete,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  GET_USERS,
  GET_ROLES,
  CREATE_USER,
  UPDATE_USER,
  UPDATE_USER_STATUS,
  DELETE_USER,
  ASSIGN_ROLE_TO_USER,
  REMOVE_ROLE_FROM_USER,
} from "../../graphql/userService";

// Status chip component
const StatusChip = ({ status }) => {
  let color = "default";
  let icon = null;

  switch (status) {
    case "ACTIVE":
      color = "success";
      icon = <CheckCircleIcon fontSize="small" />;
      break;
    case "INACTIVE":
      color = "error";
      icon = <BlockIcon fontSize="small" />;
      break;
    case "PENDING":
      color = "warning";
      break;
    default:
      color = "default";
  }

  return <Chip label={status} color={color} size="small" icon={icon} />;
};

// Role chip component
const RoleChip = ({ role, onDelete }) => {
  let color = "default";

  switch (role.name.toUpperCase()) {
    case "ADMIN":
      color = "error";
      break;
    case "MANAGER":
      color = "warning";
      break;
    case "SUPERVISOR":
      color = "info";
      break;
    case "OPERATOR":
      color = "success";
      break;
    default:
      color = "default";
  }

  return (
    <Chip
      label={role.name}
      color={color}
      size="small"
      onDelete={onDelete ? () => onDelete(role) : undefined}
      sx={{ m: 0.5 }}
    />
  );
};

const Users = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openRolesDialog, setOpenRolesDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    status: "ACTIVE",
    roles: [],
  });

  // Query for users
  const {
    loading: usersLoading,
    error: usersError,
    data: usersData,
    refetch: refetchUsers,
  } = useQuery(GET_USERS, {
    fetchPolicy: "cache-and-network",
  });

  // Query for roles
  const {
    loading: rolesLoading,
    error: rolesError,
    data: rolesData,
  } = useQuery(GET_ROLES, {
    fetchPolicy: "cache-and-network",
  });

  // Mutation for creating a user
  const [createUser, { loading: createLoading }] = useMutation(CREATE_USER, {
    onCompleted: () => {
      toast.success("User created successfully");
      setOpenCreateDialog(false);
      resetForm();
      refetchUsers();
    },
    onError: (error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  // Mutation for updating a user
  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      toast.success("User updated successfully");
      setOpenEditDialog(false);
      resetForm();
      refetchUsers();
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  // Mutation for updating user status
  const [updateUserStatus, { loading: statusUpdateLoading }] = useMutation(
    UPDATE_USER_STATUS,
    {
      onCompleted: () => {
        toast.success("User status updated successfully");
        refetchUsers();
      },
      onError: (error) => {
        toast.error(`Failed to update user status: ${error.message}`);
      },
    }
  );

  // Mutation for deleting a user
  const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER, {
    onCompleted: () => {
      toast.success("User deleted successfully");
      setOpenDeleteDialog(false);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  // Mutation for assigning a role to a user
  const [assignRoleToUser, { loading: assignRoleLoading }] = useMutation(
    ASSIGN_ROLE_TO_USER,
    {
      onCompleted: () => {
        toast.success("Role assigned successfully");
        refetchUsers();
      },
      onError: (error) => {
        toast.error(`Failed to assign role: ${error.message}`);
      },
    }
  );

  // Mutation for removing a role from a user
  const [removeRoleFromUser, { loading: removeRoleLoading }] = useMutation(
    REMOVE_ROLE_FROM_USER,
    {
      onCompleted: () => {
        toast.success("Role removed successfully");
        refetchUsers();
      },
      onError: (error) => {
        toast.error(`Failed to remove role: ${error.message}`);
      },
    }
  );

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtered users based on search term and status/role filters
  const filteredUsers =
    usersData?.users?.items.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        (user.username &&
          user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email &&
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.fullName &&
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        filterStatus === "ALL" || user.status === filterStatus;

      const matchesRole =
        filterRole === "ALL" ||
        user.roles.some((role) => role.name === filterRole);

      return matchesSearch && matchesStatus && matchesRole;
    }) || [];

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset page when search term changes
  };

  // Handle status filter change
  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0); // Reset page when filter changes
  };

  // Handle role filter change
  const handleFilterRoleChange = (event) => {
    setFilterRole(event.target.value);
    setPage(0); // Reset page when filter changes
  };

  // Reset all filters and search term
  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("ALL");
    setFilterRole("ALL");
    setPage(0);
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      status: "ACTIVE",
      roles: [],
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle roles autocomplete change
  const handleRolesChange = (event, newValue) => {
    setFormData((prev) => ({ ...prev, roles: newValue }));
  };

  // Handle opening create dialog
  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  // Handle closing create dialog
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    resetForm();
  };

  // Handle opening edit dialog
  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      // password and confirmPassword are not pre-filled for security
      fullName: user.fullName || "",
      status: user.status || "ACTIVE",
      roles: user.roles || [],
    });
    setOpenEditDialog(true);
  };

  // Handle closing edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
    resetForm();
  };

  // Handle opening delete dialog
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  // Handle closing delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  // Handle opening view dialog
  const handleOpenViewDialog = (user) => {
    setSelectedUser(user);
    setOpenViewDialog(true);
  };

  // Handle closing view dialog
  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedUser(null);
  };

  // Handle opening roles dialog
  const handleOpenRolesDialog = (user) => {
    setSelectedUser(user);
    setOpenRolesDialog(true);
  };

  // Handle closing roles dialog
  const handleCloseRolesDialog = () => {
    setOpenRolesDialog(false);
    setSelectedUser(null);
  };

  // Handle creating a new user
  const handleCreateUser = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    createUser({
      variables: {
        input: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName || null,
          role: formData.roles.length > 0 ? formData.roles[0].name : "operator",
          status: formData.status,
        },
      },
    });
  };

  // Handle updating an existing user
  const handleUpdateUser = () => {
    if (!selectedUser) return;

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    updateUser({
      variables: {
        id: selectedUser.id,
        input: {
          username: formData.username,
          email: formData.email,
          password: formData.password || null,
          fullName: formData.fullName || null,
          role:
            formData.roles.length > 0
              ? formData.roles[0].name
              : selectedUser.role,
          status: formData.status,
        },
      },
    });
  };

  // Handle deleting a user
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUser({
      variables: { id: selectedUser.id },
    });
  };

  // Handle toggling user status (active/inactive)
  const handleToggleUserStatus = (user) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateUserStatus({
      variables: {
        id: user.id,
        status: newStatus,
      },
    });
  };

  // Check if user has a specific role
  const hasRole = (user, roleName) => {
    return user.roles.some((role) => role.name === roleName);
  };

  // Get roles available for assignment
  const getAvailableRoles = (user) => {
    const assignedRoleNames = user.roles.map((role) => role.name);
    return (
      rolesData?.roles?.filter(
        (role) => !assignedRoleNames.includes(role.name)
      ) || []
    );
  };

  // Handle assigning a role to a user
  const handleAssignRole = (roleId) => {
    if (!selectedUser) return;
    assignRoleToUser({
      variables: {
        userId: selectedUser.id,
        roleId: roleId,
      },
    });
  };

  // Handle removing a role from a user
  const handleRemoveRole = (role) => {
    if (!selectedUser) return;
    removeRoleFromUser({
      variables: {
        userId: selectedUser.id,
        roleId: role.id,
      },
    });
  };

  // Loading/Error states for the main table
  if (usersLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (usersError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading users: {usersError.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        User Management
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search Users"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={resetFilters} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={handleFilterStatusChange}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filterRole}
                label="Role"
                onChange={handleFilterRoleChange}
              >
                <MenuItem value="ALL">All</MenuItem>
                {rolesData?.roles?.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              fullWidth
            >
              Create User
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="user table">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredUsers.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : filteredUsers
            ).map((user) => (
              <TableRow
                key={user.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {user.username}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fullName || "-"}</TableCell>
                <TableCell>
                  <Chip label={user.role} size="small" color="primary" />
                </TableCell>
                <TableCell>
                  <StatusChip status={user.status} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View User Details">
                    <IconButton onClick={() => handleOpenViewDialog(user)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit User">
                    <IconButton onClick={() => handleOpenEditDialog(user)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle Status">
                    <IconButton onClick={() => handleToggleUserStatus(user)}>
                      {user.status === "ACTIVE" ? (
                        <BlockIcon color="error" />
                      ) : (
                        <CheckCircleIcon color="success" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton onClick={() => handleOpenDeleteDialog(user)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && !usersLoading && (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 3 }}>
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Create User Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                error={
                  formData.password !== formData.confirmPassword &&
                  formData.confirmPassword !== ""
                }
                helperText={
                  formData.password !== formData.confirmPassword &&
                  formData.confirmPassword !== ""
                    ? "Passwords do not match"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                id="roles-autocomplete"
                options={rolesData?.roles || []}
                getOptionLabel={(option) => option.name}
                value={formData.roles}
                onChange={handleRolesChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Roles"
                    placeholder="Select Roles"
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disableCloseOnSelect
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={createLoading}
          >
            {createLoading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password (leave blank to keep current)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={
                    formData.password !== formData.confirmPassword &&
                    formData.confirmPassword !== ""
                  }
                  helperText={
                    formData.password !== formData.confirmPassword &&
                    formData.confirmPassword !== ""
                      ? "Passwords do not match"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="roles-autocomplete-edit"
                  options={rolesData?.roles || []}
                  getOptionLabel={(option) => option.name}
                  value={formData.roles}
                  onChange={handleRolesChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Roles"
                      placeholder="Select Roles"
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  disableCloseOnSelect
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            disabled={updateLoading}
          >
            {updateLoading ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{selectedUser?.username}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Username:</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="body1">{selectedUser.username}</Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Email:</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Full Name:</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="body1">
                  {selectedUser.fullName || "-"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Role:</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="body1">
                  {selectedUser.role.toUpperCase()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Status:</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <StatusChip status={selectedUser.status} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Last Login:</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="body1">
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString()
                    : "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Created At:</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="body1">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog
        open={openRolesDialog}
        onClose={handleCloseRolesDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Roles for {selectedUser?.username}</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Assigned Roles
              </Typography>
              {selectedUser.roles && selectedUser.roles.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedUser.roles.map((role) => (
                    <RoleChip
                      key={role.id}
                      role={role}
                      onDelete={handleRemoveRole}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No roles assigned.
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Available Roles
              </Typography>
              {rolesData?.roles && rolesData.roles.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {getAvailableRoles(selectedUser).map((role) => (
                    <Chip
                      key={role.id}
                      label={role.name}
                      size="small"
                      color="secondary"
                      onClick={() => handleAssignRole(role.id)}
                      sx={{ cursor: "pointer", m: 0.5 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No available roles.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRolesDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
