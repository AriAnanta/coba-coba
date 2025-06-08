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
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapHorizIcon,
} from "@mui/icons-material";

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterType, setFilterType] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:5004/api/transactions");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'in':
      case 'purchase':
      case 'receive':
        return <TrendingUpIcon sx={{ fontSize: 20 }} />;
      case 'out':
      case 'use':
      case 'consume':
        return <TrendingDownIcon sx={{ fontSize: 20 }} />;
      case 'transfer':
      case 'adjustment':
        return <SwapHorizIcon sx={{ fontSize: 20 }} />;
      default:
        return <HistoryIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getTransactionChip = (type) => {
    const typeConfig = {
      'in': { color: "success", label: "Stock In", bgcolor: "#e8f5e8" },
      'out': { color: "error", label: "Stock Out", bgcolor: "#ffebee" },
      'purchase': { color: "primary", label: "Purchase", bgcolor: "#e8f4fd" },
      'use': { color: "warning", label: "Usage", bgcolor: "#fff3e0" },
      'adjustment': { color: "info", label: "Adjustment", bgcolor: "#e3f2fd" },
      'transfer': { color: "secondary", label: "Transfer", bgcolor: "#f3e5f5" },
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) =>
    (transaction.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType ? transaction.type?.toLowerCase() === filterType.toLowerCase() : true)
  );

  const paginatedTransactions = filteredTransactions.slice(
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
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            borderRadius: 3,
            width: '100%',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
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
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  color: 'text.primary'
                }}>
                  Transaction History
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.8, color: 'text.secondary' }}>
                  Track all material inventory transactions
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search Transactions"
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
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Type"
                  value={filterType}
                  onChange={handleFilterChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                    }
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="in">Stock In</MenuItem>
                  <MenuItem value="out">Stock Out</MenuItem>
                  <MenuItem value="purchase">Purchase</MenuItem>
                  <MenuItem value="use">Usage</MenuItem>
                  <MenuItem value="adjustment">Adjustment</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Table Section */}
          {transactions.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No transaction history available.
            </Alert>
          ) : (
            <>
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Material</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Reference</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTransactions.map((transaction, index) => (
                      <Fade in timeout={300 + index * 100} key={transaction.id}>
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
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {new Date(transaction.date || transaction.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(transaction.date || transaction.createdAt).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {transaction.materialName || 'N/A'}
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
                                color: transaction.type?.toLowerCase() === 'in' || transaction.type?.toLowerCase() === 'purchase' 
                                  ? 'success.main' 
                                  : transaction.type?.toLowerCase() === 'out' || transaction.type?.toLowerCase() === 'use'
                                  ? 'error.main'
                                  : 'text.primary'
                              }}
                            >
                              {transaction.type?.toLowerCase() === 'out' || transaction.type?.toLowerCase() === 'use' ? '-' : '+'}
                              {Math.abs(transaction.quantity || 0).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {transaction.unit || 'pcs'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {transaction.reference || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {transaction.description || 'No description'}
                            </Typography>
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
                count={filteredTransactions.length}
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
