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
    Avatar,
    Stack,
    IconButton
} from '@mui/material';
import CustomTooltip from '@/components/common/CustomTooltip';
import { 
    LocalShipping as DriverIcon,
    Verified as VerifiedIcon,
    Block as BlockIcon,
    Star as RatingIcon,
    LocationCity as CityIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { formatPhoneForDisplay } from '@/lib/phoneUtils';

export default function AdminDriversPage() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await api.get('/admin/partners');
                setPartners(response.data.items || []);
            } catch (err: any) {
                toast.error("Failed to load delivery partners");
            } finally {
                setLoading(false);
            }
        };
        fetchPartners();
    }, []);

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b' }}>Drivers</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>Manage and verify your fleet of delivery partners.</Typography>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 6, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Driver</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Vehicle</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Contact</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>City</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Rating</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {partners.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>No delivery partners found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            partners.map((partner: any) => (
                                <TableRow key={partner.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={partner.profileImage} sx={{ bgcolor: 'secondary.main', fontWeight: 900 }}>
                                                {partner.name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{partner.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>ID: DP-{partner.id}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{partner.vehicleType}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>{partner.vehicleNumber}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPhoneForDisplay(partner.phone)}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{partner.email}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <CityIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{partner.city}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <RatingIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 900 }}>{partner.rating || '5.0'}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={partner.isVerified ? 'VERIFIED' : 'PENDING'} 
                                            size="small"
                                            color={partner.isVerified ? 'success' : 'warning'}
                                            sx={{ fontWeight: 900, fontSize: '0.65rem' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <CustomTooltip title="Deactivate">
                                            <IconButton color="error" size="small"><BlockIcon fontSize="small" /></IconButton>
                                        </CustomTooltip>
                                        <CustomTooltip title="Verify">
                                            <IconButton color="success" size="small"><VerifiedIcon fontSize="small" /></IconButton>
                                        </CustomTooltip>
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
