'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AdminAnalytics() {
    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.dark', mb: 2 }}>Global Analytics</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                This is a placeholder for the advanced ecosystem reporting and commission charts.
            </Typography>
        </Box>
    );
}
