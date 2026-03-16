'use client';

import { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Stack, 
    CircularProgress, 
    alpha 
} from '@mui/material';
import { 
    FiberManualRecord as DotIcon,
    CheckCircle as CheckIcon 
} from '@mui/icons-material';
import { api } from '@/lib/api';

interface TimelineLog {
    id: number;
    status: string;
    message: string;
    createdAt: string;
    role: string;
}

export default function OrderTimeline({ orderId }: { orderId: number }) {
    const [logs, setLogs] = useState<TimelineLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get(`/orders/${orderId}/logs`);
                setLogs(response.data);
            } catch (err) {
                console.error("Failed to fetch logs", err);
            } finally {
                setLoading(false);
            }
        };
        if (orderId) fetchLogs();
    }, [orderId]);

    if (loading) return <CircularProgress size={20} />;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', mb: 2, display: 'block' }}>
                Order Timeline
            </Typography>
            <Stack spacing={0}>
                {logs.map((log, index) => (
                    <Box key={log.id} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                        <Stack alignItems="center">
                            <Box sx={{ 
                                zIndex: 1, 
                                color: index === logs.length - 1 ? 'primary.main' : 'text.disabled',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {index === logs.length - 1 ? <CheckIcon sx={{ fontSize: 18 }} /> : <DotIcon sx={{ fontSize: 14 }} />}
                            </Box>
                            {index !== logs.length - 1 && (
                                <Box sx={{ 
                                    width: '2px', 
                                    flexGrow: 1, 
                                    bgcolor: 'divider',
                                    my: 1
                                }} />
                            )}
                        </Stack>
                        <Box sx={{ pb: 3 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: index === logs.length - 1 ? 'text.primary' : 'text.secondary' }}>
                                {log.status === 'delivered' ? 'COMPLETED' : log.status.replace(/-/g, ' ').toUpperCase()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                {log.message}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled', fontWeight: 600 }}>
                                {new Date(log.createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}
