'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    Button,
    Select,
    MenuItem,
    FormControl,
    Stack,
    CircularProgress,
    alpha,
    Divider,
    TextField,
    InputAdornment,
    TablePagination,
    IconButton,
    Menu,
    Avatar
} from '@mui/material';
import { 
    AssignmentInd as AssignIcon, 
    LocalShipping as DispatchIcon,
    CheckCircle as DoneIcon,
    Cancel as CancelIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Sort as SortIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { formatPhoneForDisplay } from '@/lib/phoneUtils';
import debounce from 'lodash/debounce';
import OrderTimeline from '@/components/OrderTimeline';
import { Dialog, DialogContent, DialogTitle, Slide } from '@mui/material';
import ConfirmDialog from '@/components/mui/ConfirmDialog';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    // Search/Pagination/Sort States
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [statusFilter, setStatusFilter] = useState('all');

    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

    // Timeline Modal States
    const [timelineOrderId, setTimelineOrderId] = useState<number | null>(null);
    const [timelineOpen, setTimelineOpen] = useState(false);
    
    // Confirm Dialog States
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
                search: searchQuery,
                sortBy: sortBy,
                sortOrder: sortOrder,
                status: statusFilter === 'all' ? '' : statusFilter,
            });

            const response = await api.get(`/admin/orders?${params.toString()}`);
            setOrders(response.data.items || []);
            setTotalItems(response.data.totalItems || 0);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPartners = async () => {
        try {
            const partnersRes = await api.get('/admin/partners?limit=100');
            setPartners(partnersRes.data.items || []);
        } catch (error) {
            console.error('PARTNERS FETCH ERROR:', error);
        }
    };

    // Unified Fetch Logic with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(timer);
    }, [page, rowsPerPage, sortBy, sortOrder, statusFilter, searchQuery]);

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleAssignDelivery = async (orderId: number, partnerId: number | '') => {
        if (!partnerId) return;
        try {
            await api.put('/admin/assign-delivery', { orderId, partnerId });
            toast.success('Delivery partner assigned successfully!');
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to assign delivery partner');
        }
    };

    const handleDispatch = async (orderId: number) => {
        try {
            await api.put(`/admin/dispatch-order/${orderId}`, {});
            toast.success('Order dispatched back to seller!');
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to dispatch order');
        }
    };

    const handleCancelClick = (orderId: number) => {
        setSelectedOrderId(orderId);
        setConfirmOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!selectedOrderId) return;
        try {
            setCancelling(true);
            await api.patch(`/orders/${selectedOrderId}/status`, { status: 'cancelled' });
            toast.warn('Order Cancelled');
            setConfirmOpen(false);
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
            setSelectedOrderId(null);
        }
    };

    const openTimeline = (id: number) => {
        setTimelineOrderId(id);
        setTimelineOpen(true);
    };

    const getStatusChip = (status: string) => {
        const configs: any = {
            'pending': { color: 'warning', label: 'Pending' },
            'preparing': { color: 'info', label: 'Processing' },
            'awaiting-assignment': { color: 'secondary', label: 'Processing' },
            'assigned': { color: 'primary', label: 'Processing' },
            'accepted-by-partner': { color: 'success', label: 'Processing' },
            'ready-to-ship': { color: 'info', label: 'Processing' },
            'shipped': { color: 'primary', label: 'Shipped' },
            'out-for-delivery': { color: 'warning', label: 'Out for Delivery' },
            'arrived': { color: 'secondary', label: 'Out for Delivery' },
            'delivered': { color: 'success', label: 'Completed' },
            'completed': { color: 'success', label: 'Completed' },
            'cancelled': { color: 'error', label: 'Cancelled' }
        };
        const config = configs[status] || { color: 'default', label: status };
        return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 900, borderRadius: 2 }} />;
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Logistics Control</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>Monitor global order lifecycle and handle driver dispatching.</Typography>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <TextField
                    placeholder="Search Order ID, Customer, Seller, or Driver..."
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
                <IconButton 
                    onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                    sx={{ bgcolor: statusFilter !== 'all' ? alpha('#0C831F', 0.1) : 'white', borderRadius: 3, border: '1px solid #e2e8f0' }}
                >
                    <FilterIcon sx={{ color: statusFilter !== 'all' ? '#0C831F' : 'text.secondary', fontSize: 20 }} />
                </IconButton>
            </Stack>

            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={() => setFilterAnchorEl(null)}
                PaperProps={{
                    sx: { p: 2, width: 250, borderRadius: 4, mt: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }
                }}
            >
                <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Filter by Stage</Typography>
                <FormControl fullWidth size="small" sx={{ mt: 1, mb: 1 }}>
                    <Select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        sx={{ borderRadius: 3, fontWeight: 700 }}
                    >
                        <MenuItem value="all">Any Stage</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="preparing">Processing</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Sort by</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                    {[
                        { label: 'Order Date', field: 'createdAt' },
                        { label: 'Amount', field: 'totalAmount' }
                    ].map((s) => (
                        <Button
                            key={s.field}
                            onClick={() => handleSort(s.field)}
                            size="small"
                            startIcon={<SortIcon sx={{ transform: sortBy === s.field && sortOrder === 'desc' ? 'scaleY(-1)' : 'none' }} />}
                            sx={{ 
                                justifyContent: 'flex-start', 
                                fontWeight: 700, 
                                color: sortBy === s.field ? 'primary.main' : 'text.secondary',
                                bgcolor: sortBy === s.field ? alpha('#0C831F', 0.05) : 'transparent',
                                '&:hover': { bgcolor: alpha('#0C831F', 0.1) }
                            }}
                        >
                            {s.label}
                        </Button>
                    ))}
                </Stack>
            </Menu>

            <TableContainer component={Card} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                {loading && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress size={40} thickness={4} />
                    </Box>
                )}
                <Table>
                    <TableHead sx={{ bgcolor: alpha('#0C831F', 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Order Info</TableCell>
                            <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Store</TableCell>
                            <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Logistics</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => {
                            const isFinal = ['delivered', 'completed', 'cancelled'].includes(order.status);

                            return (
                                <TableRow key={order.id} sx={{ '&:hover': { bgcolor: alpha('#f8fafc', 0.5) } }}>
                                    <TableCell>
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ fontWeight: 900, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                            onClick={() => openTimeline(order.id)}
                                        >
                                            {order.orderNumber}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                            {order.User?.user_name} • {new Date(order.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar 
                                                src={order.Seller?.profileImage} 
                                                variant="rounded"
                                                sx={{ width: 40, height: 40, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 900 }}
                                            >
                                                {order.Seller?.shop_name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.Seller?.shop_name || 'N/A'}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>₹{order.totalAmount}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusChip(order.status)}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                            {!order.DeliveryPartner ? (
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Chip 
                                                        label="Searching for Drivers" 
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ 
                                                            fontWeight: 900, 
                                                            color: 'text.disabled',
                                                            border: '1px dashed',
                                                            animation: order.status === 'awaiting-assignment' ? 'pulse 2s infinite' : 'none'
                                                        }} 
                                                    />
                                                    <style>{`
                                                        @keyframes pulse {
                                                            0% { opacity: 0.5; }
                                                            50% { opacity: 1; }
                                                            100% { opacity: 0.5; }
                                                        }
                                                    `}</style>
                                                </Box>
                                            ) : (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Avatar 
                                                        src={order.DeliveryPartner.profileImage} 
                                                        sx={{ width: 28, height: 28, bgcolor: 'secondary.light', fontSize: '0.75rem', fontWeight: 900 }}
                                                    >
                                                        {order.DeliveryPartner.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.DeliveryPartner.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>{formatPhoneForDisplay(order.DeliveryPartner.phone)}</Typography>
                                                    </Box>
                                                </Stack>
                                            )}

                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="secondary"
                                                onClick={() => handleDispatch(order.id)}
                                                disabled={order.status !== 'accepted-by-partner'}
                                                startIcon={<DispatchIcon />}
                                                sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', ml: 2 }}
                                            >
                                                Dispatch
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right">
                                        {!isFinal && (
                                            <Button 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleCancelClick(order.id)}
                                                sx={{ fontWeight: 800 }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        {isFinal && (
                                            <Typography variant="caption" sx={{ color: ['cancelled', 'failed'].includes(order.status) ? 'error.main' : 'success.main', fontWeight: 900 }}>
                                                {order.status === 'delivered' ? 'COMPLETED' : order.status.toUpperCase()}
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                
                {!loading && orders.length === 0 && (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#f1f5f9', color: 'text.disabled' }}>
                            <SearchIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>No orders found</Typography>
                        <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>Try adjusting your search or filters.</Typography>
                    </Box>
                )}

                <TablePagination
                    component="div"
                    count={totalItems}
                    page={page}
                    onPageChange={(e, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    sx={{ borderTop: '1px solid #e2e8f0' }}
                />
            </TableContainer>

            {/* Order Timeline Dialog */}
            <Dialog
                open={timelineOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => setTimelineOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 6, p: 2, maxWidth: 500, width: '100%' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Order Status Timeline
                    <IconButton size="small" onClick={() => setTimelineOpen(false)} sx={{ bgcolor: '#f1f5f9' }}>
                        <CancelIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {timelineOrderId && <OrderTimeline orderId={timelineOrderId} />}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Order"
                message="Are you sure you want to cancel this order? This action will notify the customer and seller."
                confirmText="Yes, Cancel Order"
                cancelText="No, Keep Order"
                type="danger"
                loading={cancelling}
            />
        </Box>
    );
}
