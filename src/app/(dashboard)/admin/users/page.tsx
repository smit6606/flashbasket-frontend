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
    CircularProgress, 
    alpha, 
    TextField, 
    InputAdornment, 
    Stack, 
    Avatar,
    TablePagination,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Button,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import { 
    Search as SearchIcon, 
    PersonOutline as UserIcon,
    FilterList as FilterIcon,
    Sort as SortIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { formatPhoneForDisplay } from '@/lib/phoneUtils';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
                search: searchQuery,
                sortBy: sortBy,
                sortOrder: sortOrder,
                role: roleFilter !== 'all' ? roleFilter : '',
                status: statusFilter !== 'all' ? statusFilter : ''
            });

            const response = await api.get(`/admin/unified-users?${params.toString()}`);
            setUsers(response.data.items || []);
            setTotalItems(response.data.totalItems || 0);
        } catch (error) {
            toast.error('Failed to load combined users list');
        } finally {
            setLoading(false);
        }
    };

    // Unified Fetch Logic with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(timer);
    }, [page, rowsPerPage, sortBy, sortOrder, roleFilter, statusFilter, searchQuery]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleUpdateStatus = async (role: string, id: number, newStatus: string) => {
        try {
            await api.patch(`/admin/unified-users/${role}/${id}/status`, { status: newStatus });
            toast.success(`${role.toUpperCase()} status updated to ${newStatus.toUpperCase()}`);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return '#8b5cf6';
            case 'seller': return '#eab308';
            case 'delivery': return '#3b82f6';
            default: return '#0f172a';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#0C831F';
            case 'pending': return '#f59e0b';
            case 'suspended': 
            case 'restricted':
            case 'blocked':
            case 'rejected': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#1e293b' }}>Users</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>
                    Manage all Customers, Sellers, Drivers, and Admins across the platform.
                </Typography>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <TextField
                    placeholder="Search name, email or phone..."
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
                    sx={{ bgcolor: (roleFilter !== 'all' || statusFilter !== 'all') ? alpha('#0C831F', 0.1) : 'white', borderRadius: 3, border: '1px solid #e2e8f0' }}
                >
                    <FilterIcon sx={{ color: (roleFilter !== 'all' || statusFilter !== 'all') ? '#0C831F' : 'text.secondary', fontSize: 20 }} />
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
                <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Filter by Role</Typography>
                <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
                    <Select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                        sx={{ borderRadius: 3, fontWeight: 700 }}
                    >
                        <MenuItem value="all">Every Role</MenuItem>
                        <MenuItem value="customer">Customer Only</MenuItem>
                        <MenuItem value="seller">Seller Only</MenuItem>
                        <MenuItem value="delivery">Delivery Only</MenuItem>
                        <MenuItem value="admin">Admin Only</MenuItem>
                    </Select>
                </FormControl>
                
                <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Filter by Status</Typography>
                <FormControl fullWidth size="small" sx={{ mt: 1, mb: 1 }}>
                    <Select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        sx={{ borderRadius: 3, fontWeight: 700 }}
                    >
                        <MenuItem value="all">Any Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="suspended">Suspended / Restricted</MenuItem>
                    </Select>
                </FormControl>

                <Divider sx={{ my: 1.5 }} />
                
                <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Sort Results By</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                    {[
                        { label: 'Name', field: 'name' },
                        { label: 'Registration Date', field: 'createdAt' },
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
                    <TableHead sx={{ bgcolor: alpha('#0f172a', 0.03) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>System User</TableCell>
                            <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Contact & Joining</TableCell>
                            <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Access Role</TableCell>
                            <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Admin Control</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => {
                            const roleColor = getRoleColor(user.role);
                            const statusColor = getStatusColor(user.status);
                            
                            return (
                                <TableRow key={`${user.role}-${user.id}`} sx={{ '&:hover': { bgcolor: alpha('#f8fafc', 0.5) } }}>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar 
                                                src={user.profileImage}
                                                sx={{ bgcolor: alpha(roleColor, 0.1), color: roleColor, fontWeight: 800, border: `1px solid ${alpha(roleColor, 0.2)}` }}
                                            >
                                                {(user.name || 'U').charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1e293b' }}>{user.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>ID: #{user.id}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{user.email || 'N/A'}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>{formatPhoneForDisplay(user.phone)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ 
                                            fontWeight: 900, 
                                            color: roleColor, 
                                            textTransform: 'uppercase', 
                                            fontSize: '0.75rem',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {user.role}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                                            Since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={(user.status || 'unknown').toUpperCase()} 
                                            size="small" 
                                            sx={{ 
                                                fontWeight: 900, 
                                                bgcolor: alpha(statusColor, 0.1), 
                                                color: statusColor, 
                                                borderRadius: 2,
                                                fontSize: '0.65rem'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            {/* Admin logic skips modifying other admins directly to prevent lockouts */}
                                            {user.role !== 'admin' && (
                                                <>
                                                    {user.status !== 'active' && (
                                                        <Button 
                                                            variant="contained" 
                                                            color="success" 
                                                            size="small"
                                                            onClick={() => handleUpdateStatus(user.role, user.id, 'active')}
                                                            sx={{ px: 2, borderRadius: 2, fontWeight: 900, fontSize: '0.7rem' }}
                                                        >
                                                            {user.status === 'pending' ? 'Approve' : 'Activate'}
                                                        </Button>
                                                    )}
                                                    
                                                    {user.status === 'active' && user.role === 'customer' && (
                                                        <Button 
                                                            variant="outlined" 
                                                            color="error" 
                                                            size="small"
                                                            onClick={() => handleUpdateStatus(user.role, user.id, 'restricted')}
                                                            sx={{ px: 1.5, borderRadius: 2, fontWeight: 900, fontSize: '0.7rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                                        >
                                                            Restrict
                                                        </Button>
                                                    )}

                                                    {user.status === 'active' && user.role !== 'customer' && (
                                                        <Button 
                                                            variant="outlined" 
                                                            color="warning" 
                                                            size="small"
                                                            onClick={() => handleUpdateStatus(user.role, user.id, 'suspended')}
                                                            sx={{ px: 1.5, borderRadius: 2, fontWeight: 900, fontSize: '0.7rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                                        >
                                                            Suspend
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                
                {!loading && users.length === 0 && (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#f1f5f9', color: 'text.disabled' }}>
                            <SearchIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>No users found</Typography>
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
        </Box>
    );
}
