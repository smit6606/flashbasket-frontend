'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AdminAnalytics() {
    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Reports</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>
                    Advanced ecosystem reporting and marketplace business insights.
                </Typography>
            </Box>
            
            <Box sx={{ 
                p: 10, 
                textAlign: 'center', 
                bgcolor: 'rgba(0,0,0,0.02)', 
                borderRadius: 8, 
                border: '2px dashed #e2e8f0' 
            }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Analytics Engine Loading...
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1 }}>
                    We are currently processing big data for your financial year reports.
                </Typography>
            </Box>
        </Box>
    );
}
