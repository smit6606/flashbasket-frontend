'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AdminSettings() {
    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.dark', mb: 2 }}>System Settings</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                This is a placeholder for the environmental and configuration settings dashboard.
            </Typography>
        </Box>
    );
}
