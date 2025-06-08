import React, { useState, useEffect } from "react";
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
  TextField,
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
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:5004/api/suppliers");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuppliers(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      Active: { color: "success", label: "Active" },
      Inactive: { color: "default", label: "Inactive" },
      "On Hold": { color: "warning", label: "On Hold" },
      Terminated: { color: "error", label: "Terminated" },
    };

    const config = statusConfig[status] || { color: "default", label: status };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetail = (id) => {
    navigate(`/suppliers/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/suppliers/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        const response = await fetch(
          `http://localhost:5004/api/suppliers/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        alert("Supplier deleted successfully!");
        fetchSuppliers();
      } catch (e) {
        setError(e);
        alert(`Failed to delete supplier: ${e.message}`);
      }
    }
  };

  const handleCreateNew = () => {
    navigate("/suppliers/new");
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSuppliers = filteredSuppliers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
      <Fade in>
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
          Error: {error.message}
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
      {/* Header Section */}
      <Fade in timeout={600}>
        <Card 
          elevation={0}
          sx={{ 
            mb: 4, 
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: 'white',
            borderRadius: 3,
            width: '100%',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 3, sm: 0 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    mr: { xs: 2, sm: 3 },
                  }}
                >
                  <BusinessIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' },
                    color: 'text.primary'
                  }}>
                    Supplier Management
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.8, color: 'text.secondary' }}>
                    Manage supplier relationships and contacts
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
                fullWidth={{ xs: true, sm: false }}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,1)',
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Add Supplier
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Grow in timeout={800}>
        <Paper sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          border: '1px solid', 
          borderColor: 'grey.200',
          width: '100%'
        }}>
          {/* Filters Section */}
          <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Search Suppliers"
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
                        <IconButton size="small" onClick={() => setSearchTerm("")}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Table Section */}
          {suppliers.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No suppliers available.
            </Alert>
          ) : (
            <>
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Supplier Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Contact Person</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSuppliers.map((supplier, index) => (
                      <Fade in timeout={300 + index * 100} key={supplier.id}>
                        <TableRow
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'grey.50',
                              transform: 'scale(1.001)',
                              transition: 'all 0.2s ease-in-out',
                            },
                            '&:last-child td': { border: 0 },
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {supplier.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {supplier.contactPerson || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {supplier.email || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {supplier.phone || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {getStatusChip(supplier.status || 'Active')}
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleViewDetail(supplier.id)}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: 'primary.light',
                                      color: 'white',
                                    }
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleEdit(supplier.id)}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: 'info.light',
                                      color: 'white',
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(supplier.id)}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: 'error.light',
                                      color: 'white',
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredSuppliers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'grey.50',
                }}
              />
            </>
          )}
        </Paper>
      </Grow>
    </Box>
  );
}

export default SupplierList;
