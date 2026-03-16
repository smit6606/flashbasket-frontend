'use client';

import React from 'react';
import { Box } from '@mui/material';
import MuiNavbar from '@/components/mui/MuiNavbar';
import MuiFooter from '@/components/mui/MuiFooter';
import MuiBreadcrumbs from '@/components/mui/MuiBreadcrumbs';
import PageTransition from '@/components/animations/PageTransition';
import PromoFloatingIndicator from '@/components/mui/PromoFloatingIndicator';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MuiNavbar />
            <MuiBreadcrumbs />
            <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
                <PageTransition>{children}</PageTransition>
            </Box>
            <PromoFloatingIndicator />
            <MuiFooter />
        </Box>
    );
}
