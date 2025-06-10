import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  VpnKey as VpnKeyIcon,
  Group as GroupIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  GET_ROLES,
  GET_ROLE,
  GET_PERMISSIONS,
  CREATE_ROLE,
  UPDATE_ROLE,
  DELETE_ROLE,
} from '../../graphql/userService';

const Roles = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [],
  });

  // Permission categories state
  const [expandedCategories, setExpandedCategories] = useState({});

  // Query for roles
  const {
    loading: rolesLoading,
    error: rolesError,
    data: rolesData,
    refetch: refetchRoles,
  } = useQuery(GET_ROLES, {
    fetchPolicy: 'cache-and-network',
  });

  // Query for permissions
  const {
    loading: permissionsLoading,
    error: permissionsError,
    data: permissionsData,
  } = useQuery(GET_PERMISSIONS, {
    fetchPolicy: 'cache-and-network',
  });

  // Query for role details
  const {
    loading: roleDetailsLoading,
    error: roleDetailsError,
    data: roleDetailsData,
    refetch: refetchRoleDetails,
  } = useQuery(GET_ROLE, {
    variables: { id: selectedRole?.id },
    skip: !selectedRole?.id,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.role) {
        setFormData({
          name: data.role.name,
          description: data.role.description || '',
          permissionIds: data.role.permissions.map(p => p.id),
        });
      }
    },
  });

  // Mutation for creating a role
  const [createRole, { loading: createLoading }] = useMutation(CREATE_ROLE, {
    onCompleted: () => {
      toast.success('Role created successfully');
      setOpenCreateDialog(false);
      resetForm();
      refetchRoles();
    },
    onError: (error) => {
      toast.error(`Failed to create role: ${error.message}`);
    },
  });

  // Mutation for updating a role
  const [updateRole, { loading: updateLoading }] = useMutation(UPDATE_ROLE, {
    onCompleted: () => {
      toast.success('Role updated successfully');
      setOpenEditDialog(false);
      resetForm();
      refetchRoles();
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  // Mutation for deleting a role
  const [deleteRole, { loading: deleteLoading }] = useMutation(DELETE_ROLE, {
    onCompleted: () => {
      toast.success('Role deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedRole(null);
      refetchRoles();
    },
    onError: (error) => {
      toast.error(`Failed to delete role: ${error.message}`);
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

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissionIds: [],
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle permission checkbox change
  const handlePermissionChange = (permissionId) => {
    setFormData(prevState => {
      const permissionIds = [...prevState.permissionIds];
      const index = permissionIds.indexOf(permissionId);
      
      if (index === -1) {
        permissionIds.push(permissionId);
      } else {
        permissionIds.splice(index, 1);
      }
      
      return {
        ...prevState,
        permissionIds,
      };
    });
  };

  // Handle category expansion toggle
  const handleToggleCategory = (category) => {
    setExpandedCategories(prevState => ({
      ...prevState,
      [category]: !prevState[category],
    }));
  };

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (permissions) => {
    return permissions.every(permission => formData.permissionIds.includes(permission.id));
  };

  // Check if some permissions in a category are selected
  const isCategoryPartiallySelected = (permissions) => {
    return permissions.some(permission => formData.permissionIds.includes(permission.id)) && 
           !permissions.every(permission => formData.permissionIds.includes(permission.id));
  };

  // Handle selecting all permissions in a category
  const handleSelectAllInCategory = (permissions, isSelected) => {
    setFormData(prevState => {
      let permissionIds = [...prevState.permissionIds];
      
      if (isSelected) {
        // Remove all permissions in this category
        permissionIds = permissionIds.filter(id => !permissions.some(p => p.id === id));
      } else {
        // Add all permissions in this category
        permissions.forEach(permission => {
          if (!permissionIds.includes(permission.id)) {
            permissionIds.push(permission.id);
          }
        });
      }
      
      return {
        ...prevState,
        permissionIds,
      };
    });
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  // Close create dialog
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    resetForm();
  };

  // Open edit dialog
  const handleOpenEditDialog = (role) => {
    setSelectedRole(role);
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedRole(null);
    resetForm();
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (role) => {
    setSelectedRole(role);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedRole(null);
  };

  // Open view dialog
  const handleOpenViewDialog = (role) => {
    setSelectedRole(role);
    setOpenViewDialog(true);
  };

  // Close view dialog
  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedRole(null);
  };

  // Handle create role
  const handleCreateRole = () => {
    createRole({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || null,
          permissionIds: formData.permissionIds,
        },
      },
    });
  };

  // Handle update role
  const handleUpdateRole = () => {
    updateRole({
      variables: {
        id: selectedRole.id,
        input: {
          name: formData.name,
          description: formData.description || null,
          permissionIds: formData.permissionIds,
        },
      },
    });
  };

  // Handle delete role
  const handleDeleteRole = () => {
    deleteRole({
      variables: {
        id: selectedRole.id,
      },
    });
  };

  // Filter and paginate roles
  const filteredRoles = rolesData
    ? rolesData.roles.filter((role) => {
        // Filter by search term
        return role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));
      })
    : [];

  const paginatedRoles = filteredRoles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Group permissions by category
  const getPermissionsByCategory = () => {
    if (!permissionsData || !permissionsData.permissions) return {};
    
    const categories = {};
    
    permissionsData.permissions.forEach(permission => {
      const category = permission.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(permission);
    });
    
    return categories;
  };

  // Get permission name by ID
  const getPermissionName = (permissionId) => {
    if (!permissionsData || !permissionsData.permissions) return 'Unknown';
    
    const permission = permissionsData.permissions.find(p => p.id === permissionId);
    return permission ? permission.name : 'Unknown';
  };

  // Count users with this role
  const countUsersWithRole = (roleId) => {
    // This would typically be a query to the backend
    // For now, we'll return a placeholder value
    return 0; // Placeholder
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Roles</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Role
          </Button>
        </Box>

        {/* Search */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Roles"
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
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Search by name or description"
            />
          </Grid>
        </Grid>

        {/* Error message */}
        {rolesError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading roles: {rolesError.message}
          </Alert>
        )}

        {/* Loading indicator */}
        {rolesLoading && !rolesData && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!rolesLoading && filteredRoles.length === 0 ? (
          <Alert severity="info">
            No roles found. {searchTerm ? 'Try a different search term.' : 'Add a role to get started.'}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {role.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {role.description || <Typography variant="body2" color="text.secondary">No description</Typography>}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {role.permissions && role.permissions.length > 0 ? (
                            <Chip 
                              label={`${role.permissions.length} permissions`} 
                              color="primary" 
                              size="small" 
                              variant="outlined"
                              onClick={() => handleOpenViewDialog(role)}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">No permissions</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenViewDialog(role)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Role">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(role)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(role)}
                            disabled={role.name.toUpperCase() === 'ADMIN'} // Prevent deleting the admin role
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRoles.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Create Role Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Role</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SecurityIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Permissions
              </Typography>
              {permissionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : permissionsError ? (
                <Alert severity="error" sx={{ my: 2 }}>
                  Error loading permissions: {permissionsError.message}
                </Alert>
              ) : (
                <Box sx={{ mt: 1, maxHeight: '400px', overflow: 'auto' }}>
                  {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                    <div key={category}>
                      <ListItem 
                        button 
                        onClick={() => handleToggleCategory(category)}
                        sx={{ bgcolor: 'background.paper', mb: 1 }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={isCategoryFullySelected(permissions)}
                            indeterminate={isCategoryPartiallySelected(permissions)}
                            onChange={() => handleSelectAllInCategory(permissions, isCategoryFullySelected(permissions))}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={category} 
                          secondary={`${permissions.length} permissions`} 
                        />
                        {expandedCategories[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </ListItem>
                      <Collapse in={expandedCategories[category]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {permissions.map((permission) => (
                            <ListItem key={permission.id} sx={{ pl: 4 }}>
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={formData.permissionIds.includes(permission.id)}
                                  onChange={() => handlePermissionChange(permission.id)}
                                />
                              </ListItemIcon>
                              <ListItemText 
                                primary={permission.name} 
                                secondary={permission.description} 
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </div>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateRole}
            color="primary"
            disabled={createLoading || !formData.name}
            startIcon={createLoading && <CircularProgress size={20} />}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          {roleDetailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : roleDetailsError ? (
            <Alert severity="error" sx={{ my: 2 }}>
              Error loading role details: {roleDetailsError.message}
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={selectedRole?.name.toUpperCase() === 'ADMIN'} // Prevent editing the admin role name
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SecurityIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Permissions
                </Typography>
                {permissionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : permissionsError ? (
                  <Alert severity="error" sx={{ my: 2 }}>
                    Error loading permissions: {permissionsError.message}
                  </Alert>
                ) : (
                  <Box sx={{ mt: 1, maxHeight: '400px', overflow: 'auto' }}>
                    {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category}>
                        <ListItem 
                          button 
                          onClick={() => handleToggleCategory(category)}
                          sx={{ bgcolor: 'background.paper', mb: 1 }}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={isCategoryFullySelected(permissions)}
                              indeterminate={isCategoryPartiallySelected(permissions)}
                              onChange={() => handleSelectAllInCategory(permissions, isCategoryFullySelected(permissions))}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={category} 
                            secondary={`${permissions.length} permissions`} 
                          />
                          {expandedCategories[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItem>
                        <Collapse in={expandedCategories[category]} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {permissions.map((permission) => (
                              <ListItem key={permission.id} sx={{ pl: 4 }}>
                                <ListItemIcon>
                                  <Checkbox
                                    edge="start"
                                    checked={formData.permissionIds.includes(permission.id)}
                                    onChange={() => handlePermissionChange(permission.id)}
                                  />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={permission.name} 
                                  secondary={permission.description} 
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </div>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateRole}
            color="primary"
            disabled={updateLoading || !formData.name || roleDetailsLoading}
            startIcon={updateLoading && <CircularProgress size={20} />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the role "{selectedRole?.name}"? 
            This action cannot be undone.
          </DialogContentText>
          {selectedRole && selectedRole.name.toUpperCase() === 'ADMIN' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              The Admin role cannot be deleted as it is required for system administration.
            </Alert>
          )}
          {selectedRole && countUsersWithRole(selectedRole.id) > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This role is currently assigned to {countUsersWithRole(selectedRole.id)} users. 
              Deleting it will remove the role from these users.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteRole}
            color="error"
            disabled={deleteLoading || (selectedRole && selectedRole.name.toUpperCase() === 'ADMIN')}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Role Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">{selectedRole?.name}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {roleDetailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : roleDetailsError ? (
            <Alert severity="error" sx={{ my: 2 }}>
              Error loading role details: {roleDetailsError.message}
            </Alert>
          ) : roleDetailsData && roleDetailsData.role ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {roleDetailsData.role.description || 'No description provided'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Permissions ({roleDetailsData.role.permissions.length})
                    </Typography>
                    {roleDetailsData.role.permissions.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        This role has no permissions assigned.
                      </Typography>
                    ) : (
                      <Box sx={{ mt: 1, maxHeight: '300px', overflow: 'auto' }}>
                        {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => {
                          // Filter permissions that are assigned to this role
                          const categoryPermissions = permissions.filter(permission => 
                            roleDetailsData.role.permissions.some(p => p.id === permission.id)
                          );
                          
                          if (categoryPermissions.length === 0) return null;
                          
                          return (
                            <div key={category}>
                              <ListItem 
                                button 
                                onClick={() => handleToggleCategory(category)}
                                sx={{ bgcolor: 'background.paper', mb: 1 }}
                              >
                                <ListItemText 
                                  primary={category} 
                                  secondary={`${categoryPermissions.length} permissions`} 
                                />
                                {expandedCategories[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </ListItem>
                              <Collapse in={expandedCategories[category]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                  {categoryPermissions.map((permission) => (
                                    <ListItem key={permission.id} sx={{ pl: 4 }}>
                                      <ListItemIcon>
                                        <CheckIcon color="success" />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary={permission.name} 
                                        secondary={permission.description} 
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Collapse>
                            </div>
                          );
                        })}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Users with this Role
                    </Typography>
                    <Typography variant="body2">
                      {countUsersWithRole(selectedRole.id) > 0 ? (
                        `${countUsersWithRole(selectedRole.id)} users have this role assigned.`
                      ) : (
                        'No users currently have this role assigned.'
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button
            onClick={() => {
              handleCloseViewDialog();
              handleOpenEditDialog(selectedRole);
            }}
            color="primary"
            disabled={selectedRole?.name.toUpperCase() === 'ADMIN'}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Roles;