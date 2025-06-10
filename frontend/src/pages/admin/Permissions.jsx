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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Label as LabelIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  GET_PERMISSIONS,
  CREATE_PERMISSION,
  UPDATE_PERMISSION,
  DELETE_PERMISSION,
} from '../../graphql/userService';

// Permission categories
const PERMISSION_CATEGORIES = [
  'User Management',
  'Role Management',
  'Production',
  'Planning',
  'Inventory',
  'Machine',
  'Reporting',
  'System',
  'Other',
];

const Permissions = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    action: '',
    resource: '',
  });

  // Query for permissions
  const {
    loading: permissionsLoading,
    error: permissionsError,
    data: permissionsData,
    refetch: refetchPermissions,
  } = useQuery(GET_PERMISSIONS, {
    fetchPolicy: 'cache-and-network',
  });

  // Mutation for creating a permission
  const [createPermission, { loading: createLoading }] = useMutation(CREATE_PERMISSION, {
    onCompleted: () => {
      toast.success('Permission created successfully');
      setOpenCreateDialog(false);
      resetForm();
      refetchPermissions();
    },
    onError: (error) => {
      toast.error(`Failed to create permission: ${error.message}`);
    },
  });

  // Mutation for updating a permission
  const [updatePermission, { loading: updateLoading }] = useMutation(UPDATE_PERMISSION, {
    onCompleted: () => {
      toast.success('Permission updated successfully');
      setOpenEditDialog(false);
      resetForm();
      refetchPermissions();
    },
    onError: (error) => {
      toast.error(`Failed to update permission: ${error.message}`);
    },
  });

  // Mutation for deleting a permission
  const [deletePermission, { loading: deleteLoading }] = useMutation(DELETE_PERMISSION, {
    onCompleted: () => {
      toast.success('Permission deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedPermission(null);
      refetchPermissions();
    },
    onError: (error) => {
      toast.error(`Failed to delete permission: ${error.message}`);
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

  // Handle filter category change
  const handleFilterCategoryChange = (event) => {
    setFilterCategory(event.target.value);
    setPage(0);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('ALL');
    setPage(0);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      action: '',
      resource: '',
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
  const handleOpenEditDialog = (permission) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description || '',
      category: permission.category || '',
      action: permission.action || '',
      resource: permission.resource || '',
    });
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedPermission(null);
    resetForm();
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (permission) => {
    setSelectedPermission(permission);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPermission(null);
  };

  // Open view dialog
  const handleOpenViewDialog = (permission) => {
    setSelectedPermission(permission);
    setOpenViewDialog(true);
  };

  // Close view dialog
  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedPermission(null);
  };

  // Handle create permission
  const handleCreatePermission = () => {
    createPermission({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          action: formData.action || null,
          resource: formData.resource || null,
        },
      },
    });
  };

  // Handle update permission
  const handleUpdatePermission = () => {
    updatePermission({
      variables: {
        id: selectedPermission.id,
        input: {
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          action: formData.action || null,
          resource: formData.resource || null,
        },
      },
    });
  };

  // Handle delete permission
  const handleDeletePermission = () => {
    deletePermission({
      variables: {
        id: selectedPermission.id,
      },
    });
  };

  // Filter and paginate permissions
  const filteredPermissions = permissionsData
    ? permissionsData.permissions.filter((permission) => {
        // Filter by search term
        const searchMatch =
          permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (permission.action && permission.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (permission.resource && permission.resource.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filter by category
        const categoryMatch = filterCategory === 'ALL' || 
          (permission.category && permission.category === filterCategory);

        return searchMatch && categoryMatch;
      })
    : [];

  const paginatedPermissions = filteredPermissions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get unique categories from permissions data
  const getUniqueCategories = () => {
    if (!permissionsData || !permissionsData.permissions) return [];
    
    const categories = new Set();
    permissionsData.permissions.forEach(permission => {
      if (permission.category) {
        categories.add(permission.category);
      }
    });
    
    return Array.from(categories).sort();
  };

  // Count roles using this permission
  const countRolesUsingPermission = (permissionId) => {
    // This would typically be a query to the backend
    // For now, we'll return a placeholder value
    return 0; // Placeholder
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Permissions</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Permission
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Permissions"
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
              placeholder="Search by name, description, action, or resource"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={handleFilterCategoryChange}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {getUniqueCategories().map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={resetFilters}
              sx={{ height: '100%' }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>

        {/* Error message */}
        {permissionsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading permissions: {permissionsError.message}
          </Alert>
        )}

        {/* Loading indicator */}
        {permissionsLoading && !permissionsData && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!permissionsLoading && filteredPermissions.length === 0 ? (
          <Alert severity="info">
            No permissions found. {searchTerm || filterCategory !== 'ALL' ? 'Try different filter settings.' : 'Add a permission to get started.'}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VpnKeyIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {permission.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {permission.category ? (
                          <Chip 
                            label={permission.category} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            icon={<CategoryIcon fontSize="small" />}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {permission.action || <Typography variant="body2" color="text.secondary">-</Typography>}
                      </TableCell>
                      <TableCell>
                        {permission.resource || <Typography variant="body2" color="text.secondary">-</Typography>}
                      </TableCell>
                      <TableCell>
                        {permission.description ? (
                          <Typography variant="body2" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {permission.description}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No description</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenViewDialog(permission)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Permission">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(permission)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(permission)}
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
              count={filteredPermissions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Create Permission Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Permission</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Permission Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Use a descriptive name like 'create:user' or 'view:reports'"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {PERMISSION_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Action"
                name="action"
                value={formData.action}
                onChange={handleInputChange}
                helperText="e.g., create, read, update, delete"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Resource"
                name="resource"
                value={formData.resource}
                onChange={handleInputChange}
                helperText="e.g., user, role, product, report"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreatePermission}
            color="primary"
            disabled={createLoading || !formData.name}
            startIcon={createLoading && <CircularProgress size={20} />}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Permission</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Permission Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Use a descriptive name like 'create:user' or 'view:reports'"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {PERMISSION_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Action"
                name="action"
                value={formData.action}
                onChange={handleInputChange}
                helperText="e.g., create, read, update, delete"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Resource"
                name="resource"
                value={formData.resource}
                onChange={handleInputChange}
                helperText="e.g., user, role, product, report"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdatePermission}
            color="primary"
            disabled={updateLoading || !formData.name}
            startIcon={updateLoading && <CircularProgress size={20} />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Permission Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Permission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the permission "{selectedPermission?.name}"? 
            This action cannot be undone.
          </DialogContentText>
          {selectedPermission && countRolesUsingPermission(selectedPermission.id) > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This permission is currently used by {countRolesUsingPermission(selectedPermission.id)} roles. 
              Deleting it will remove the permission from these roles.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeletePermission}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Permission Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VpnKeyIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">{selectedPermission?.name}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPermission && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Permission Details
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1">
                      {selectedPermission.category || 'Not specified'}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Action
                    </Typography>
                    <Typography variant="body1">
                      {selectedPermission.action || 'Not specified'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Resource
                    </Typography>
                    <Typography variant="body1">
                      {selectedPermission.resource || 'Not specified'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedPermission.description || 'No description provided'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Usage
                  </Typography>
                  <Typography variant="body2">
                    {countRolesUsingPermission(selectedPermission.id) > 0 ? (
                      `This permission is used by ${countRolesUsingPermission(selectedPermission.id)} roles.`
                    ) : (
                      'This permission is not currently used by any roles.'
                    )}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button
            onClick={() => {
              handleCloseViewDialog();
              handleOpenEditDialog(selectedPermission);
            }}
            color="primary"
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Permissions;