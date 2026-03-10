'use client';

import React, { useState } from 'react';
import { Box, Toolbar, Container } from '@mui/material';
import MuiSidebar from '@/components/mui/MuiSidebar';
import MuiTopBar from '@/components/mui/MuiTopBar';

const DRAWER_WIDTH = 280;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <MuiTopBar onMenuClick={handleDrawerToggle} />

            <MuiSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 3, md: 6 },
                    width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                }}
            >
                <Toolbar sx={{ height: 80 }} /> {/* Spacer for TopBar */}
                <Container maxWidth="xl" disableGutters sx={{ py: 2 }}>
                    {children}
                </Container>
            </Box>
        </Box>
    );
}
