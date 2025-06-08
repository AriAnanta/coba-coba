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
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

function MaterialList() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterCategory, setFilterCategory] = useState("");
  const navigate = useNavigate();

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:5004/api/materials");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMaterials(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const getStatusChip = (material) => {
    if (material.stockQuantity <= material.reorderLevel) {
      return (
        <Chip
          label="Low Stock"
          color="error"
          size="small"
          icon={<WarningIcon />}
          sx={{ fontWeight: 500 }}
        />
      );
    }

    const statusConfig = {
      active: { color: "success", label: "Active" },
      discontinued: { color: "error", label: "Discontinued" },
      out_of_stock: { color: "warning", label: "Out of Stock" },
    };

    const config = statusConfig[material.status] || {
      color: "default",
      label: material.status,
    };
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

  const handleFilterChange = (event) => {
    setFilterCategory(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    navigate(`/materials/${id}/edit`);
  };

  const handleViewDetail = (id) => {
    navigate(`/materials/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        const response = await fetch(
          `http://localhost:5004/api/materials/${id}`,
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

        alert("Material deleted successfully!");
        fetchMaterials();
      } catch (e) {
        setError(e);
        alert(`Failed to delete material: ${e.message}`);
      }
    }
  };

  const handleCreateNew = () => {
    navigate("/materials/new");
  };

  // Filter materials
  const filteredMaterials = materials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory ? material.category === filterCategory : true)
  );

  const paginatedMaterials = filteredMaterials.slice(
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
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
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
                  <InventoryIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                    Material Inventory
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Manage materials and inventory levels
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
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Add Material
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search Materials"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment:
                      searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm("")}>
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
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Category"
                  value={filterCategory}
                  onChange={handleFilterChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                    },
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Raw Material">Raw Material</MenuItem>
                  <MenuItem value="Component">Component</MenuItem>
                  <MenuItem value="Work-in-Progress (WIP)">
                    Work-in-Progress (WIP)
                  </MenuItem>
                  <MenuItem value="Finished Goods">Finished Goods</MenuItem>
                  <MenuItem value="Packaging Material">Packaging Material</MenuItem>
                  <MenuItem value="Consumable">Consumable</MenuItem>
                  <MenuItem value="Spare Part">Spare Part</MenuItem>
                  <MenuItem value="Tool">Tool</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Table Section */}
          {materials.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No materials available.
            </Alert>
          ) : (
            <>
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        Material ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        Category
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        Stock Quantity
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, py: 2 }}
                        align="right"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedMaterials.map((material, index) => (
                      <Fade in timeout={300 + index * 100} key={material.id}>
                        <TableRow
                          sx={{
                            "&:hover": {
                              bgcolor: "grey.50",
                              transform: "scale(1.001)",
                              transition: "all 0.2s ease-in-out",
                            },
                            "&:last-child td": { border: 0 },
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "primary.main",
                              }}
                            >
                              {material.materialId || material.id}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {material.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={material.category}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color:
                                  material.stockQuantity <= material.reorderLevel
                                    ? "error.main"
                                    : "text.primary",
                              }}
                            >
                              {material.stockQuantity.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">{material.unit}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {getStatusChip(material)}
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="flex-end"
                            >
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleViewDetail(material.id)}
                                  sx={{
                                    "&:hover": {
                                      bgcolor: "primary.light",
                                      color: "white",
                                    },
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleEdit(material.id)}
                                  sx={{
                                    "&:hover": {
                                      bgcolor: "info.light",
                                      color: "white",
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(material.id)}
                                  sx={{
                                    "&:hover": {
                                      bgcolor: "error.light",
                                      color: "white",
                                    },
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
                count={filteredMaterials.length}
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
    </Box>
  );
}

export default MaterialList;
