'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    alpha,
    Chip,
    Button,
    Paper,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    LocalShippingOutlined as DeliveryIcon,
    AccountBalanceWalletOutlined as EarningsIcon,
    TwoWheelerOutlined as MotoIcon,
    ListAltOutlined as TaskIcon,
    MyLocationOutlined as LocationIcon,
    NotificationsActiveOutlined as AlertIcon,
} from '@mui/icons-material';

export default function DeliveryDashboard() {
    const [isOnDuty, setIsOnDuty] = useState(true);

    const stats = [
        { label: 'Total Deliveries', value: '42', icon: <DeliveryIcon />, color: '#2196f3', bgcolor: alpha('#2196f3', 0.1) },
        { label: "Today's Earnings", value: '₹840', icon: <EarningsIcon />, color: '#0C831F', bgcolor: alpha('#0C831F', 0.1) },
        { label: "Active Zone", value: 'Downtown', icon: <LocationIcon />, color: '#ff9800', bgcolor: alpha('#ff9800', 0.1) },
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Driver Hub</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                        Fleet Management & Real-time Tracking
                    </Typography>
                </Box>
                <Paper elevation={0} sx={{ p: 1, px: 3, borderRadius: 10, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: isOnDuty ? '#0C831F' : 'text.disabled' }}>
                        {isOnDuty ? 'On-Duty' : 'Off-Duty'}
                    </Typography>
                    <Switch
                        checked={isOnDuty}
                        onChange={() => setIsOnDuty(!isOnDuty)}
                        color="success"
                    />
                </Paper>
            </Stack>

            <Grid container spacing={4} sx={{ mb: 6 }}>
                {stats.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                        <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' } }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ p: 2, borderRadius: 5, bgcolor: card.bgcolor, color: card.color, display: 'inline-flex', mb: 3 }}>
                                    {card.icon}
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>{card.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card elevation={0} sx={{ borderRadius: 8, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                        <Box sx={{ p: 4, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <TaskIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="h5" sx={{ fontWeight: 900 }}>Active Tasks</Typography>
                            </Stack>
                            <Chip label="Real-time" size="small" sx={{ fontWeight: 900, bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', borderRadius: 2 }} />
                        </Box>
                        <CardContent sx={{ p: 8, textAlign: 'center' }}>
                            <Box sx={{ mb: 4 }}>
                                <AlertIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.3 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1 }}>No active delivery requests right now</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                STAY CLOSE TO BUSY MARKET AREAS FOR REQUESTS
                            </Typography>
                            <Button variant="contained" sx={{ mt: 6, px: 6, py: 2, borderRadius: 5, fontWeight: 900, textTransform: 'none' }}>
                                View Heatmap
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card elevation={0} sx={{ p: 1, borderRadius: 8, bgcolor: '#0f172a', color: 'white', height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                                <MotoIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>Ride Statistics</Typography>
                            </Stack>

                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Current Rating</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>4.92 / 5.0</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Time On-Duty</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>5h 12m</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Fuel Efficiency</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>94% Opt.</Typography>
                                </Box>
                            </Stack>

                            <Button fullWidth variant="contained" sx={{ mt: 6, py: 2, borderRadius: 4, fontWeight: 900, bgcolor: 'primary.main' }}>
                                View Full Report
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
