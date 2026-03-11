'use client';

import React from 'react';
import { Box } from '@mui/material';
import MuiNavbar from '@/components/mui/MuiNavbar';
import MuiFooter from '@/components/mui/MuiFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MuiNavbar />
            <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
                {children}
            </Box>
            <MuiFooter />
        </Box>
    );
}
