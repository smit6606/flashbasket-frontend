'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AdminCategories() {
    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.dark', mb: 2 }}>Categories</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                This is a placeholder for the global category management system.
            </Typography>
        </Box>
    );
}
