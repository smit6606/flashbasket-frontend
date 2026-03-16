'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    LinearProgress,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    Button,
    Paper,
    Divider,
    Chip,
    alpha,
    TablePagination,
} from '@mui/material';
import {
    ReceiptLongOutlined as OrderIcon,
    TimelineOutlined as StatusIcon,
    PlaceOutlined as AddressIcon,
    ScheduleOutlined as TimeIcon,
    PlayArrow as StartIcon,
    Send as AdminIcon,
    LocalShipping as ShippingIcon,
    CheckCircle as DoneIcon,
    Cancel as CancelIcon,
    Inventory2Outlined as ProductIcon,
    Search as SearchIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import OrderTimeline from '@/components/OrderTimeline';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { formatPhoneForDisplay } from '@/lib/phoneUtils';

interface Order {
    id: number;
    orderNumber: string;
    totalAmount: string;
    status: string;
    deliveryAddress: string;
    createdAt: string;
    Products: {
        productName: string;
        OrderItem: {
            quantity: number;
            price: string;
        };
    }[];
    DeliveryPartner?: {
        name: string;
        phone: string;
    };
}

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Timeline State
    const [timelineOrderId, setTimelineOrderId] = useState<number | null>(null);
    const [timelineOpen, setTimelineOpen] = useState(false);

    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
                search: searchQuery,
                status: statusFilter === 'all' ? '' : statusFilter,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            const response = await api.get(`/orders/seller?${params.toString()}`);
            setOrders(response.data.items || []);
            setTotalItems(response.data.totalItems || 0);
        } catch (err) {
            console.error('Failed to fetch orders', err);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Unified Fetch Logic with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(timer);
    }, [page, rowsPerPage, statusFilter, searchQuery]);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            toast.success(`Order status updated to ${status.replace(/-/g, ' ')}`);
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Action failed');
        }
    };

    const openTimeline = (id: number) => {
        setTimelineOrderId(id);
        setTimelineOpen(true);
    };

    const getStatusConfig = (status: string) => {
        const configs: any = {
            'pending': { color: '#ff9800', label: 'Pending', step: 1 },
            'preparing': { color: '#9c27b0', label: 'Processing', step: 2 },
            'awaiting-assignment': { color: '#ff5722', label: 'Processing', step: 3 },
            'accepted-by-partner': { color: '#0C831F', label: 'Processing', step: 4 },
            'assigned': { color: '#2196f3', label: 'Processing', step: 5 },
            'ready-to-ship': { color: '#2196f3', label: 'Processing', step: 6 },
            'shipped': { color: '#03a9f4', label: 'Shipped', step: 7 },
            'out-for-delivery': { color: '#03a9f4', label: 'Out for Delivery', step: 8 },
            'delivered': { color: '#0C831F', label: 'Completed', step: 9 },
            'completed': { color: '#0C831F', label: 'Completed', step: 9 },
            'cancelled': { color: '#ef5350', label: 'Cancelled', step: 0 }
        };
        return configs[status] || { color: '#747d8c', label: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' '), step: 0 };
    };

    /* Server-side search and filter integrated into fetchOrders */

    if (loading) return <Box sx={{ p: 4 }}><LinearProgress /></Box>;

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Live Orders</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>Manage and track your active store requests in real-time.</Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 6 }}>
                <TextField
                    placeholder="Search Order Number or Address..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: '16px', bgcolor: 'white', fontWeight: 600 }
                    }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <Select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        sx={{ borderRadius: '16px', bgcolor: 'white', fontWeight: 700 }}
                    >
                        <MenuItem value="all" sx={{ fontWeight: 600 }}>All Orders</MenuItem>
                        <MenuItem value="pending" sx={{ fontWeight: 600 }}>Pending</MenuItem>
                        <MenuItem value="preparing" sx={{ fontWeight: 600 }}>Processing</MenuItem>
                        <MenuItem value="shipped" sx={{ fontWeight: 600 }}>Shipped</MenuItem>
                        <MenuItem value="completed" sx={{ fontWeight: 600 }}>Delivered</MenuItem>
                        <MenuItem value="cancelled" sx={{ fontWeight: 600 }}>Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            <Grid container spacing={4}>
                {orders.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: '32px', bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                            <OrderIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 3 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary' }}>No matching orders found</Typography>
                        </Paper>
                    </Grid>
                ) : (
                    orders.map((order) => {
                        const config = getStatusConfig(order.status);
                        return (
                            <Grid size={{ xs: 12 }} key={order.id}>
                                <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', transition: 'all 0.3s', '&:hover': { boxShadow: '0 20px 60px rgba(0,0,0,0.04)' } }}>
                                    <Box sx={{ p: 4, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                                        <Stack direction="row" spacing={6} divider={<Divider orientation="vertical" flexItem />}>
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Order No.</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 900 }}>{order.orderNumber}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Total Amount</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{order.totalAmount}</Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Chip
                                                label={config.label}
                                                sx={{
                                                    fontWeight: 900,
                                                    borderRadius: 3,
                                                    bgcolor: alpha(config.color, 0.1),
                                                    color: config.color,
                                                    px: 1
                                                }}
                                            />
                                            
                                            {/* SELLER ACTION BUTTONS */}
                                            {order.status === 'pending' && (
                                                <Button 
                                                    variant="contained" 
                                                    color="primary" 
                                                    startIcon={<StartIcon />}
                                                    onClick={() => updateStatus(order.id, 'preparing')}
                                                    sx={{ fontWeight: 900, borderRadius: '14px', px: 3 }}
                                                >
                                                    Start Preparing
                                                </Button>
                                            )}
                                            {order.status === 'preparing' && (
                                                <Button 
                                                    variant="contained" 
                                                    color="warning" 
                                                    startIcon={<AdminIcon />}
                                                    onClick={() => updateStatus(order.id, 'awaiting-assignment')}
                                                    sx={{ fontWeight: 900, borderRadius: '14px', px: 3 }}
                                                >
                                                    Ready for Delivery
                                                </Button>
                                            )}
                                            {order.status === 'ready-to-ship' && (
                                                <Button 
                                                    variant="contained" 
                                                    color="info" 
                                                    startIcon={<ShippingIcon />}
                                                    onClick={() => updateStatus(order.id, 'shipped')}
                                                    sx={{ fontWeight: 900, borderRadius: '14px', px: 3 }}
                                                >
                                                    Start Shipping
                                                </Button>
                                            )}

                                            {/* Completed / Other States */}
                                            {['delivered', 'completed'].includes(order.status) && (
                                                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <DoneIcon fontSize="small" /> COMPLETED
                                                </Typography>
                                            )}
                                            {order.status === 'cancelled' && (
                                                <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CancelIcon fontSize="small" /> CANCELLED
                                                </Typography>
                                            )}
                                            {order.status === 'pending' && (
                                                <Button 
                                                    variant="outlined" 
                                                    color="error" 
                                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                                    sx={{ fontWeight: 900, borderRadius: '14px', border: 2 }}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>

                                    <CardContent sx={{ p: 4 }}>
                                        <Grid container spacing={6}>
                                            <Grid size={{ xs: 12, lg: 8 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, textTransform: 'uppercase', color: 'text.secondary' }}>Order Details</Typography>
                                                <Stack spacing={2}>
                                                    {order.Products?.map((prod, i) => (
                                                        <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: '12px', bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                                                    <ProductIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                                </Box>
                                                                <Typography variant="body1" sx={{ fontWeight: 800 }}>{prod.productName}</Typography>
                                                            </Stack>
                                                            <Stack direction="row" spacing={4} alignItems="center">
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Qty: {prod.OrderItem.quantity}</Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 900 }}>₹{prod.OrderItem.price}</Typography>
                                                            </Stack>
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 12, lg: 4 }}>
                                                <Box sx={{ height: '100%', borderLeft: { lg: '1px solid #f1f5f9' }, pl: { lg: 6 } }}>
                                                    <Box sx={{ mb: 4 }}>
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                            <AddressIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary' }}>Delivery Address</Typography>
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.6 }}>{order.deliveryAddress}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                            <TimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary' }}>Order Placed</Typography>
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(order.createdAt).toLocaleString()}</Typography>
                                                    </Box>
                                                    {order.DeliveryPartner && (
                                                        <Box sx={{ mt: 4, p: 2, borderRadius: 3, bgcolor: alpha('#0C831F', 0.05), border: '1px solid', borderColor: alpha('#0C831F', 0.1) }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#0C831F', display: 'block', mb: 1 }}>Assigned Driver</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 900 }}>{order.DeliveryPartner.name}</Typography>
                                                            <Button size="small" startIcon={<PhoneIcon />} sx={{ fontWeight: 800, p: 0, minWidth: 0, color: '#0C831F' }}>{formatPhoneForDisplay(order.DeliveryPartner.phone)}</Button>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>

            {/* Pagination Controls */}
            <Paper elevation={0} sx={{ mt: 4, borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <TablePagination
                    component="div"
                    count={totalItems}
                    page={page}
                    onPageChange={(e, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </Paper>

            {/* Timeline Dialog */}
            <Dialog 
                open={timelineOpen} 
                onClose={() => setTimelineOpen(false)}
                PaperProps={{ sx: { borderRadius: 6, p: 2, maxWidth: 500, width: '100%' } }}
            >
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Tracking Timeline
                    <IconButton size="small" onClick={() => setTimelineOpen(false)} sx={{ bgcolor: '#f1f5f9' }}>
                        <CancelIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {timelineOrderId && <OrderTimeline orderId={timelineOrderId} />}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
