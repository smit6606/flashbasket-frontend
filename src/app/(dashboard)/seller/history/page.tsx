'use client';

import { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Chip,
    Stack,
    Avatar,
    InputBase
} from '@mui/material';
import { 
    History as HistoryIcon,
    Search as SearchIcon,
    LocalShipping as DriverIcon,
    Person as UserIcon,
    Inventory as ProductIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function SellerHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/orders/seller');
                const completed = response.data.filter((o: any) => 
                    ['shipped', 'out-for-delivery', 'delivered', 'completed', 'cancelled'].includes(o.status)
                );
                setOrders(completed);
            } catch (err: any) {
                toast.error("Failed to load order history");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredOrders = orders.filter((o: any) => 
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.User?.user_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <HistoryIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b' }}>
                            Order History
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Track and review your past fulfilled orders
                        </Typography>
                    </Box>
                </Stack>

                <Paper sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', width: 300, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <SearchIcon sx={{ color: 'text.disabled', mr: 1 }} />
                    <InputBase
                        placeholder="Search History..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ flex: 1, fontSize: '0.9rem' }}
                    />
                </Paper>
            </Stack>

            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Order ID</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Products</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Customer</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Driver</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800 }} align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrders.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                        No order history found.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order: any) => (
                                <TableRow key={order.id} hover>
                                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                                        #{order.orderNumber}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {order.Products?.length || 0} Items
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {order.Products?.[0]?.productName}...
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <UserIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                            <Typography variant="body2">{order.User?.user_name}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {order.DeliveryPartner ? (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <DriverIcon sx={{ fontSize: 16, color: 'emerald.500' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.DeliveryPartner.name}</Typography>
                                            </Stack>
                                        ) : (
                                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>Not Assigned</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={order.status === 'delivered' ? 'COMPLETED' : order.status.toUpperCase()} 
                                            size="small" 
                                            sx={{ 
                                                fontWeight: 900, 
                                                fontSize: '0.6rem',
                                                bgcolor: ['delivered', 'completed'].includes(order.status) ? '#0C831F20' : '#ff980020',
                                                color: ['delivered', 'completed'].includes(order.status) ? '#0C831F' : '#ff9800'
                                            }} 
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                                            ₹{order.totalAmount}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
