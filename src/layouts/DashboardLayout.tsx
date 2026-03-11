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
        <Box sx={{ display: 'flex', bgcolor: '#e2e8f0', minHeight: '100vh', overflow: 'hidden' }}>
            <MuiTopBar onMenuClick={handleDrawerToggle} />

            <MuiSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 3 },
                    width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Toolbar sx={{ height: 80, minHeight: '80px !important' }} /> {/* Spacer for TopBar */}
                <Box
                    sx={{
                        flexGrow: 1,
                        bgcolor: 'white',
                        borderRadius: { xs: 4, md: 6 },
                        boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                        overflow: 'hidden',
                        p: { xs: 2, md: 4 },
                        border: '1px solid rgba(255,255,255,0.8)',
                    }}
                >
                    <Container maxWidth="xl" disableGutters>
                        {children}
                    </Container>
                </Box>
            </Box>
        </Box>
    );
}
