import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  Grid,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  MenuItem,
  IconButton,
  Stack,
  Button,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapHorizIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [summary, setSummary] = useState({});

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
      });
      
      if (filterType) params.append('type', filterType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchTerm) params.append('referenceNumber', searchTerm);
      
      const response = await fetch(`http://localhost:5004/api/transactions/material-transactions?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setTransactions(result.data);
        setTotalTransactions(result.pagination.totalTransactions);
        setSummary(result.summary);
      } else {
        throw new Error(result.message || 'Failed to fetch transactions');
      }
    } catch (e) {
      setError(e);
      console.error('Error fetching transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage, filterType, startDate, endDate]);

  useEffect(() => {
    // Debounced search
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        setPage(0);
        fetchTransactions();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'receipt':
        return <ReceiptIcon sx={{ fontSize: 18 }} />;
      case 'purchase':
        return <ShoppingCartIcon sx={{ fontSize: 18 }} />;
      case 'issue':
        return <TrendingDownIcon sx={{ fontSize: 18 }} />;
      case 'adjustment':
        return <SwapHorizIcon sx={{ fontSize: 18 }} />;
      case 'return':
        return <TrendingUpIcon sx={{ fontSize: 18 }} />;
      case 'transfer':
        return <LocalShippingIcon sx={{ fontSize: 18 }} />;
      case 'scrap':
        return <DeleteIcon sx={{ fontSize: 18 }} />;
      default:
        return <AssignmentIcon sx={{ fontSize: 18 }} />;
    }
  };

  const getTransactionChip = (type) => {
    const typeConfig = {
      'receipt': { color: "success", label: "Receipt", bgcolor: "#e8f5e8" },
      'purchase': { color: "primary", label: "Purchase", bgcolor: "#e8f4fd" },
      'issue': { color: "error", label: "Issue", bgcolor: "#ffebee" },
      'adjustment': { color: "info", label: "Adjustment", bgcolor: "#e3f2fd" },
      'return': { color: "warning", label: "Return", bgcolor: "#fff3e0" },
      'transfer': { color: "secondary", label: "Transfer", bgcolor: "#f3e5f5" },
      'scrap': { color: "default", label: "Scrap", bgcolor: "#f5f5f5" },
    };

    const config = typeConfig[type?.toLowerCase()] || { color: "default", label: type, bgcolor: "#f5f5f5" };
    return (
      <Chip 
        icon={getTransactionIcon(type)}
        label={config.label} 
        size="small" 
        sx={{ 
          fontWeight: 500,
          bgcolor: config.bgcolor,
          color: config.color === 'default' ? 'text.primary' : `${config.color}.main`,
          border: `1px solid`,
          borderColor: config.color === 'default' ? 'grey.300' : `${config.color}.light`,
        }} 
      />
    );
  };

  const getQuantityColor = (type, quantity) => {
    if (type?.toLowerCase() === 'issue' || type?.toLowerCase() === 'scrap') {
      return 'error.main';
    } else if (type?.toLowerCase() === 'receipt' || type?.toLowerCase() === 'purchase' || type?.toLowerCase() === 'return') {
      return 'success.main';
    }
    return 'text.primary';
  };

  const formatQuantity = (type, quantity) => {
    if (type?.toLowerCase() === 'issue' || type?.toLowerCase() === 'scrap') {
      return `-${Math.abs(quantity || 0).toLocaleString()}`;
    } else if (type?.toLowerCase() === 'receipt' || type?.toLowerCase() === 'purchase' || type?.toLowerCase() === 'return') {
      return `+${Math.abs(quantity || 0).toLocaleString()}`;
    } else if (type?.toLowerCase() === 'adjustment') {
      return quantity >= 0 ? `+${quantity.toLocaleString()}` : quantity.toLocaleString();
    }
    return (quantity || 0).toLocaleString();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setStartDate("");
    setEndDate("");
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Fade in>
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
          Error: {error.message}
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchTransactions}
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            width: '100%',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    mr: { xs: 2, sm: 3 },
                  }}
                >
                  <HistoryIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' }
                  }}>
                    Material Transaction History
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Track all material inventory movements and changes
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {totalTransactions.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Transactions
                </Typography>
              </Box>
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
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Reference"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Transaction Type"
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="Purchase">Purchase</MenuItem>
                    <MenuItem value="Receipt">Receipt</MenuItem>
                    <MenuItem value="Issue">Issue</MenuItem>
                    <MenuItem value="Adjustment">Adjustment</MenuItem>
                    <MenuItem value="Return">Return</MenuItem>
                    <MenuItem value="Transfer">Transfer</MenuItem>
                    <MenuItem value="Scrap">Scrap</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    size="small"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={fetchTransactions}
                    size="small"
                  >
                    Refresh
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Table Section */}
          {transactions.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No transaction history available with current filters.
            </Alert>
          ) : (
            <>
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1200 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Transaction ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Material</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Unit Price</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Reference</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Supplier</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <Fade in timeout={300 + index * 50} key={transaction.id}>
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
                            <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                              {transaction.transactionId}
                            </Typography>
                            {transaction.batchNumber && (
                              <Typography variant="caption" color="text.secondary">
                                Batch: {transaction.batchNumber}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {new Date(transaction.date).toLocaleDateString('id-ID')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(transaction.date).toLocaleTimeString('id-ID')}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {transaction.materialName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {transaction.materialId}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {getTransactionChip(transaction.type)}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 600,
                                color: getQuantityColor(transaction.type, transaction.quantity)
                              }}
                            >
                              {formatQuantity(transaction.type, transaction.quantity)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.unit}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {transaction.unitPrice ? `Rp ${Number(transaction.unitPrice).toLocaleString()}` : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {transaction.totalPrice ? `Rp ${Number(transaction.totalPrice).toLocaleString()}` : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {transaction.reference || '-'}
                            </Typography>
                            {transaction.description && (
                              <Tooltip title={transaction.description}>
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                  display: 'block',
                                  maxWidth: 150,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {transaction.description}
                                </Typography>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {transaction.supplier || '-'}
                            </Typography>
                            {transaction.receivedBy && (
                              <Typography variant="caption" color="text.secondary">
                                by: {transaction.receivedBy}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={totalTransactions}
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

export default TransactionHistory;
