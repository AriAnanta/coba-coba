import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  CheckCircle as AllocateIcon,
  Inventory as ConsumeIcon,
} from "@mui/icons-material";
import batchService from "../../api/batchService";
import materialService from "../../api/materialService";

const MaterialAllocationsManager = ({ batchId, onMaterialsChange }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAllocationDialog, setOpenAllocationDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [allocatingMaterial, setAllocatingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    materialId: "",
    quantityRequired: "",
    unitOfMeasure: "",
    stockQuantity: 0,
  });
  const [allocationData, setAllocationData] = useState({
    quantityAllocated: "",
  });
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  useEffect(() => {
    if (batchId) {
      fetchMaterials();
    }
  }, [batchId]);

  useEffect(() => {
    const fetchAvailableMaterials = async () => {
      try {
        setMaterialsLoading(true);
        const data = await materialService.getAllMaterials();
        setAvailableMaterials(data);
        console.log("Fetched available materials:", data);
        console.log("Materials loading status:", false);
      } catch (err) {
        console.error("Error fetching available materials:", err);
        setError("Failed to fetch available materials");
      } finally {
        setMaterialsLoading(false);
        console.log("Materials loading status in finally:", false);
      }
    };
    fetchAvailableMaterials();
  }, [batchId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await batchService.getBatchMaterials(batchId);
      setMaterials(data);
      if (onMaterialsChange) onMaterialsChange(data);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError("Failed to fetch material allocations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async () => {
    try {
      setLoading(true);
      await batchService.createMaterialAllocation(batchId, {
        ...formData,
        materialId: parseInt(formData.materialId),
        quantityRequired: parseFloat(formData.quantityRequired),
      });

      setOpenDialog(false);
      resetForm();
      fetchMaterials();
    } catch (err) {
      console.error("Error creating material allocation:", err);
      setError("Failed to create material allocation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaterial = async () => {
    try {
      setLoading(true);
      await batchService.updateMaterialAllocation(batchId, editingMaterial.id, {
        ...formData,
        materialId: parseInt(formData.materialId),
        quantityRequired: parseFloat(formData.quantityRequired),
      });

      setOpenDialog(false);
      resetForm();
      fetchMaterials();
    } catch (err) {
      console.error("Error updating material allocation:", err);
      setError("Failed to update material allocation");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this material allocation?"
      )
    ) {
      try {
        setLoading(true);
        await batchService.deleteMaterialAllocation(batchId, materialId);
        fetchMaterials();
      } catch (err) {
        console.error("Error deleting material allocation:", err);
        setError("Failed to delete material allocation");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAllocateMaterial = async () => {
    try {
      setLoading(true);
      await batchService.allocateMaterial(
        batchId,
        allocatingMaterial.id,
        parseFloat(allocationData.quantityAllocated)
      );

      setOpenAllocationDialog(false);
      setAllocationData({ quantityAllocated: "" });
      fetchMaterials();
    } catch (err) {
      console.error("Error allocating material:", err);
      setError("Failed to allocate material");
    } finally {
      setLoading(false);
    }
  };

  const handleConsumeMaterial = async (materialId) => {
    try {
      setLoading(true);
      await batchService.consumeMaterial(batchId, materialId);
      fetchMaterials();
    } catch (err) {
      console.error("Error consuming material:", err);
      setError("Failed to consume material");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    const selectedMaterial = availableMaterials.find(
      (mat) => mat.id === material.materialId
    );
    setFormData({
      materialId: String(material.materialId),
      quantityRequired: material.quantityRequired.toString(),
      unitOfMeasure: material.unitOfMeasure,
      stockQuantity: selectedMaterial ? selectedMaterial.stockQuantity : 0,
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      materialId: "",
      quantityRequired: "",
      unitOfMeasure: "",
      stockQuantity: 0,
    });
    setEditingMaterial(null);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending" },
      partial: { color: "info", label: "Partial" },
      allocated: { color: "primary", label: "Allocated" },
      consumed: { color: "success", label: "Consumed" },
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

  const handleFormChange = (e) => {
    const { name, value, id } = e.target;
    console.log(
      `Handle form change: Name = ${name}, Value = ${value}, ID = ${id}, Type of Value = ${typeof value}`
    );
    if (name === "materialId") {
      const selectedMaterial = availableMaterials.find(
        (mat) => String(mat.id) === String(value)
      );
      console.log("Selected Material:", selectedMaterial);
      setFormData((prevData) => ({
        ...prevData,
        materialId: String(value),
        unitOfMeasure: selectedMaterial ? selectedMaterial.unit : "",
        stockQuantity: selectedMaterial ? selectedMaterial.stockQuantity : 0,
      }));
      console.log(
        "Updated formData.materialId:",
        String(value),
        "Type:",
        typeof String(value)
      );
    } else if (name !== "notes") {
      setFormData((prevData) => {
        const updatedData = { ...prevData, [name]: value };
        console.log(
          "Updated formData for non-materialId field:",
          updatedData,
          "Field:",
          name,
          "Value:",
          value
        );
        return updatedData;
      });
    }
  };

  if (loading && materials.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
              <AssignmentIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Material Allocations
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            sx={{ borderRadius: 2 }}
          >
            Add Material
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          Component Loading State: {loading ? "True" : "False"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {materials.length === 0 ? (
          <Alert severity="info" variant="outlined">
            No material allocations defined. Click "Add Material" to allocate
            materials.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Material ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Required</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Allocated</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {availableMaterials.find(
                          (mat) => mat.id === material.materialId
                        )?.name || material.materialId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {material.quantityRequired}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {material.quantityAllocated}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {material.unitOfMeasure}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(material.status)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {material.status === "pending" && (
                          <Tooltip title="Allocate Material">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setAllocatingMaterial(material);
                                setAllocationData({
                                  quantityAllocated:
                                    material.quantityAllocated.toString(),
                                });
                                setOpenAllocationDialog(true);
                              }}
                            >
                              <AllocateIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {material.status === "allocated" && (
                          <Tooltip title="Consume Material">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleConsumeMaterial(material.id)}
                            >
                              <ConsumeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {material.status === "consumed" ? (
                          <Tooltip title="Cannot edit consumed material">
                            <span>
                              <IconButton size="small" color="info" disabled>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleEditMaterial(material)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {material.status === "allocated" ||
                        material.status === "consumed" ? (
                          <Tooltip title="Cannot delete allocated or consumed material">
                            <span>
                              <IconButton size="small" color="error" disabled>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteMaterial(material.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create/Edit Material Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          disableEscapeKeyDown={loading}
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
          aria-labelledby="material-dialog-title"
          aria-describedby="material-dialog-description"
        >
          <DialogTitle id="material-dialog-title">
            {editingMaterial
              ? "Edit Material Allocation"
              : "Create Material Allocation"}
          </DialogTitle>
          <DialogContent id="material-dialog-description">
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
              Materials Loading: {materialsLoading ? "True" : "False"},
              Available Materials Count: {availableMaterials.length}
              Current FormData Material ID: {formData.materialId}
            </Typography>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  required
                  disabled={materialsLoading || loading}
                >
                  <InputLabel id="material-select-label">Material</InputLabel>
                  <Select
                    labelId="material-select-label"
                    id="materialId"
                    name="materialId"
                    value={formData.materialId}
                    onChange={handleFormChange}
                    label="Material"
                  >
                    <MenuItem value="">Pilih Material</MenuItem>
                    {availableMaterials.map((material) => (
                      <MenuItem key={material.id} value={String(material.id)}>
                        {material.name} ({material.materialId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity Required"
                  type="number"
                  step="0.01"
                  name="quantityRequired"
                  value={formData.quantityRequired}
                  onChange={handleFormChange}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Stock"
                  type="number"
                  value={formData.stockQuantity}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Unit of Measure"
                  value={formData.unitOfMeasure}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled={true}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={
                editingMaterial ? handleUpdateMaterial : handleCreateMaterial
              }
              disabled={
                loading ||
                !formData.materialId ||
                !formData.quantityRequired ||
                !formData.unitOfMeasure
              }
              startIcon={loading && <CircularProgress size={16} />}
            >
              {loading
                ? "Processing..."
                : editingMaterial
                ? "Update"
                : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Material Allocation Dialog */}
        <Dialog
          open={openAllocationDialog}
          onClose={() => setOpenAllocationDialog(false)}
          maxWidth="sm"
          fullWidth
          disableEscapeKeyDown={loading}
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
          aria-labelledby="allocation-dialog-title"
          aria-describedby="allocation-dialog-description"
        >
          <DialogTitle id="allocation-dialog-title">
            Allocate Material
          </DialogTitle>
          <DialogContent id="allocation-dialog-description">
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Material ID: {allocatingMaterial?.materialId}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Required: {allocatingMaterial?.quantityRequired}{" "}
                {allocatingMaterial?.unitOfMeasure}
              </Typography>
              <TextField
                fullWidth
                label="Quantity to Allocate"
                type="number"
                step="0.01"
                value={allocationData.quantityAllocated}
                onChange={(e) =>
                  setAllocationData({
                    quantityAllocated: e.target.value,
                  })
                }
                inputProps={{
                  max: allocatingMaterial?.quantityRequired,
                  min: 0,
                }}
                helperText={`Maximum: ${allocatingMaterial?.quantityRequired} ${allocatingMaterial?.unitOfMeasure}`}
                required
                disabled={loading}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpenAllocationDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAllocateMaterial}
              disabled={loading || !allocationData.quantityAllocated}
              startIcon={loading && <CircularProgress size={16} />}
            >
              {loading ? "Processing..." : "Allocate"}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MaterialAllocationsManager;
