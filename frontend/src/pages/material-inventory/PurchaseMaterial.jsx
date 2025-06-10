import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  FormHelperText,
} from "@mui/material";
import {
  AddShoppingCart as AddShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";

function PurchaseMaterial() {
  const [replenishableMaterials, setReplenishableMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    quantity: '',
    unitPrice: '',
    totalPrice: '',
    supplierId: '',
    referenceNumber: '',
    batchNumber: '',
    deliveryDate: '',
    notes: '',
    location: '',
    qualityStatus: 'Approved'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const searchParams = useSearchParams()[0];

  const fetchReplenishableMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "http://localhost:5004/api/materials/replenishable"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReplenishableMaterials(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("http://localhost:5004/api/materials/suppliers");
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (e) {
      console.error("Error fetching suppliers:", e);
    }
  };

  const fetchTransactionTypes = async () => {
    try {
      const response = await fetch("http://localhost:5004/api/materials/transaction-types");
      if (response.ok) {
        const data = await response.json();
        setTransactionTypes(data);
      }
    } catch (e) {
      console.error("Error fetching transaction types:", e);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      await Promise.all([
        fetchReplenishableMaterials(),
        fetchSuppliers(),
        fetchTransactionTypes()
      ]);
      
      const materialIdFromUrl = searchParams.get("materialId");
      if (materialIdFromUrl && replenishableMaterials.length > 0) {
        const materialToSelect = replenishableMaterials.find(
          (m) => m.id.toString() === materialIdFromUrl
        );
        if (materialToSelect) {
          handleOpenPurchaseDialog(materialToSelect);
        }
      }
    };
    initializePage();
  }, [searchParams]);

  const handleOpenPurchaseDialog = (material) => {
    setSelectedMaterial(material);
    setFormData({
      quantity: '',
      unitPrice: material.price || '',
      totalPrice: '',
      supplierId: material.supplierId || '',
      referenceNumber: `PO-${Date.now().toString().slice(-6)}`,
      batchNumber: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      notes: `Pembelian untuk isi ulang stok: ${material.name}`,
      location: material.location || '',
      qualityStatus: 'Approved'
    });
    setFormErrors({});
    setOpenPurchaseDialog(true);
  };

  const handleClosePurchaseDialog = () => {
    setOpenPurchaseDialog(false);
    setSelectedMaterial(null);
    setFormData({
      quantity: '',
      unitPrice: '',
      totalPrice: '',
      supplierId: '',
      referenceNumber: '',
      batchNumber: '',
      deliveryDate: '',
      notes: '',
      location: '',
      qualityStatus: 'Approved'
    });
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    // Auto-calculate total price when quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(field === 'quantity' ? value : newFormData.quantity) || 0;
      const unitPrice = parseFloat(field === 'unitPrice' ? value : newFormData.unitPrice) || 0;
      newFormData.totalPrice = (quantity * unitPrice).toFixed(2);
    }
    
    setFormData(newFormData);
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      errors.unitPrice = 'Unit price must be greater than 0';
    }
    
    if (!formData.referenceNumber.trim()) {
      errors.referenceNumber = 'Reference number is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePurchaseSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        "http://localhost:5004/api/materials/purchase",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            materialId: selectedMaterial.id,
            quantity: parseFloat(formData.quantity),
            unitPrice: parseFloat(formData.unitPrice),
            totalPrice: parseFloat(formData.totalPrice),
            supplierId: formData.supplierId || null,
            referenceNumber: formData.referenceNumber,
            batchNumber: formData.batchNumber || null,
            deliveryDate: formData.deliveryDate || null,
            notes: formData.notes,
            location: formData.location,
            qualityStatus: formData.qualityStatus
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      alert(`Material purchase recorded successfully!\nTransaction ID: ${result.data.transaction.transactionId}`);
      handleClosePurchaseDialog();
      fetchReplenishableMaterials(); // Refresh the list
    } catch (e) {
      setError(e);
      alert(`Failed to record purchase: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'out_of_stock':
        return 'error';
      case 'low_stock':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error && (!replenishableMaterials || replenishableMaterials.length === 0)) {
    return (
      <Fade in>
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
          Error: {error.message}
        </Alert>
      </Fade>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Fade in timeout={600}>
        <Card
          elevation={0}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                  mr: { xs: 2, sm: 3 },
                }}
              >
                <AddShoppingCartIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                  Material Purchase Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Procure and manage low stock or out-of-stock materials
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Grow in timeout={800}>
        <Paper sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid", borderColor: "grey.200" }}>
          {replenishableMaterials.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon sx={{ mr: 1 }} />
                All materials are currently in sufficient stock. No replenishment needed.
              </Box>
            </Alert>
          ) : (
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Table sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700, py: 2 }}>Material ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2 }}>Material Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2 }}>Current Stock</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2 }}>Reorder Level</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2 }}>Unit Price</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2 }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {replenishableMaterials.map((material, index) => (
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
                          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                            {material.materialId}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
                            {material.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {material.description}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={material.status?.replace(/_/g, " ").toUpperCase()}
                            color={getStatusColor(material.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {material.stockQuantity} {material.unit}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {material.reorderLevel} {material.unit}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Rp {material.price?.toLocaleString() || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {material.supplierInfo ? material.supplierInfo.name : "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {material.supplierInfo ? material.supplierInfo.contactPerson : ""}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<AddShoppingCartIcon />}
                            onClick={() => handleOpenPurchaseDialog(material)}
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            Purchase
                          </Button>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      </Grow>

      {/* Enhanced Purchase Dialog */}
      <Dialog open={openPurchaseDialog} onClose={handleClosePurchaseDialog} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 2.5,
            px: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          <ReceiptIcon sx={{ mr: 1.5 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Purchase Material: {selectedMaterial?.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              ID: {selectedMaterial?.materialId} | Current Stock: {selectedMaterial?.stockQuantity} {selectedMaterial?.unit}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Purchase Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Purchase Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity to Purchase *"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                error={!!formErrors.quantity}
                helperText={formErrors.quantity}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{selectedMaterial?.unit}</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit Price *"
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                error={!!formErrors.unitPrice}
                helperText={formErrors.unitPrice}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Price"
                type="number"
                value={formData.totalPrice}
                onChange={(e) => handleInputChange('totalPrice', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  readOnly: true,
                }}
                sx={{ '& .MuiInputBase-input': { bgcolor: 'grey.50' } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={formData.supplierId}
                  onChange={(e) => handleInputChange('supplierId', e.target.value)}
                  label="Supplier"
                >
                  <MenuItem value="">
                    <em>Select Supplier</em>
                  </MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.supplierId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Transaction Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reference Number *"
                value={formData.referenceNumber}
                onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                error={!!formErrors.referenceNumber}
                helperText={formErrors.referenceNumber || "e.g., PO-2024-001"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Batch Number"
                value={formData.batchNumber}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                helperText="Optional batch/lot number"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Delivery Date"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Quality Status</InputLabel>
                <Select
                  value={formData.qualityStatus}
                  onChange={(e) => handleInputChange('qualityStatus', e.target.value)}
                  label="Quality Status"
                >
                  <MenuItem value="Pending">Pending Inspection</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Storage Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                helperText="Where will this material be stored?"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                helperText="Additional notes about this purchase"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Button
            onClick={handleClosePurchaseDialog}
            startIcon={<CancelIcon />}
            color="error"
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchaseSubmit}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
            variant="contained"
            color="primary"
            disabled={submitting}
            sx={{ minWidth: 140 }}
          >
            {submitting ? "Processing..." : "Record Purchase"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PurchaseMaterial;
