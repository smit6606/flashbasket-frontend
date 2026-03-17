'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
    CircularProgress,
    alpha,
    Divider,
    TextField,
    InputAdornment,
    TablePagination,
    Avatar,
    Paper
} from '@mui/material';
import { 
    CheckCircle as DoneIcon,
    Search as SearchIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { formatPhoneForDisplay } from '@/lib/phoneUtils';

export default function AdminCompletedOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    // Search/Pagination States
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
                search: searchQuery,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });

            const response = await api.get(`/admin/orders/completed?${params.toString()}`);
            setOrders(response.data.items || []);
            setTotalItems(response.data.totalItems || 0);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load completed orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, searchQuery ? 500 : 0);
        return () => clearTimeout(timer);
    }, [page, rowsPerPage, searchQuery]);

    const getStatusChip = (status: string) => {
        return (
            <Chip 
                label={status} 
                color="success" 
                size="small" 
                sx={{ 
                    fontWeight: 900, 
                    borderRadius: 2,
                    bgcolor: alpha('#0C831F', 0.1),
                    color: '#0C831F'
                }} 
            />
        );
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Completed Orders</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>History of all successfully fulfilled orders across the platform.</Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <TextField
                    placeholder="Search Order ID, Customer, or Seller..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 4, bgcolor: 'white', fontWeight: 600 }
                    }}
                />
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #f1f5f9' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Order ID</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Customer</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Seller</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Driver</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                    <CircularProgress size={32} thickness={5} sx={{ color: '#0C831F' }} />
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                    <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.secondary' }}>No completed orders found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell sx={{ fontWeight: 700 }}>#{order.orderNumber}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Avatar src={order.User?.profileImage} sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: alpha('#0C831F', 0.1), color: '#0C831F' }}>
                                                {order.User?.user_name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.User?.user_name || 'Deleted User'}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{order.User?.email}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.Seller?.shop_name || 'Unknown'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        {order.DeliveryPartner ? (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem' }}>{order.DeliveryPartner.name.charAt(0)}</Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.DeliveryPartner.name}</Typography>
                                            </Stack>
                                        ) : (
                                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>Not Assigned</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 900, color: 'primary.main' }}>₹{order.totalAmount}</TableCell>
                                    <TableCell>{getStatusChip(order.status)}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {new Date(order.createdAt).toLocaleDateString()}<br/>
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={totalItems}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>
        </Box>
    );
}
