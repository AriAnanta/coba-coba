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
  IconButton,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import {
  AddShoppingCart as AddShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";

function PurchaseMaterial() {
  const [replenishableMaterials, setReplenishableMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    const initializePage = async () => {
      await fetchReplenishableMaterials();
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
  }, [searchParams, replenishableMaterials]);

  const handleOpenPurchaseDialog = (material) => {
    setSelectedMaterial(material);
    setPurchaseQuantity("");
    setUnitPrice(material.price || "");
    setReferenceNumber("");
    setNotes("");
    setOpenPurchaseDialog(true);
  };

  const handleClosePurchaseDialog = () => {
    setOpenPurchaseDialog(false);
    setSelectedMaterial(null);
  };

  const handlePurchaseSubmit = async () => {
    if (!selectedMaterial || !purchaseQuantity || purchaseQuantity <= 0) {
      alert("Please enter a valid quantity.");
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
            quantity: parseFloat(purchaseQuantity),
            price: parseFloat(unitPrice) || selectedMaterial.price,
            referenceNumber:
              referenceNumber || `PO-${Date.now().toString().slice(-6)}`,
            notes:
              notes ||
              `Pembelian material untuk isi ulang stok: ${selectedMaterial.name}`,
            supplierId: selectedMaterial.supplierId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      alert("Material purchase recorded successfully!");
      handleClosePurchaseDialog();
      fetchReplenishableMaterials(); // Refresh the list
    } catch (e) {
      setError(e);
      alert(`Failed to record purchase: ${e.message}`);
    } finally {
      setSubmitting(false);
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

  if (
    error &&
    (!replenishableMaterials || replenishableMaterials.length === 0)
  ) {
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
            background: "linear-gradient(135deg, #FFD3A5 0%, #FD6585 100%)",
            color: "white",
            borderRadius: 3,
            width: "100%",
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
                    color: "text.primary",
                  }}
                >
                  Material Purchase
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ opacity: 0.8, color: "text.secondary" }}
                >
                  Manage and procure low stock or out-of-stock materials
                </Typography>
              </Box>
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
          {replenishableMaterials.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              All materials are currently in sufficient stock. No replenishment
              needed.
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
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        Material Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        Current Stock
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        Reorder Level
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        Supplier
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        Action
                      </TableCell>
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
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {material.materialId}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "primary.main" }}
                            >
                              {material.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {material.description}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  material.status === "out_of_stock"
                                    ? "error.main"
                                    : "warning.main",
                                fontWeight: 600,
                              }}
                            >
                              {material.status
                                ?.replace(/_/g, " ")
                                .toUpperCase()}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {material.stockQuantity} {material.unit}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {material.reorderLevel} {material.unit}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {material.supplierInfo
                                ? material.supplierInfo.name
                                : "N/A"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {material.supplierInfo
                                ? material.supplierInfo.email
                                : ""}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<AddShoppingCartIcon />}
                              onClick={() => handleOpenPurchaseDialog(material)}
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
            </>
          )}
        </Paper>
      </Grow>

      {/* Purchase Dialog */}
      <Dialog
        open={openPurchaseDialog}
        onClose={handleClosePurchaseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 2,
            px: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          <AddShoppingCartIcon sx={{ mr: 1 }} /> Purchase Material:{" "}
          {selectedMaterial?.name}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Supplier: {selectedMaterial?.supplierInfo?.name || "N/A"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity to Purchase"
                type="number"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedMaterial?.unit}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Number (e.g., PO-XXXX)"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClosePurchaseDialog}
            startIcon={<CancelIcon />}
            color="error"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchaseSubmit}
            startIcon={
              submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckIcon />
              )
            }
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? "Purchasing..." : "Record Purchase"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PurchaseMaterial;
