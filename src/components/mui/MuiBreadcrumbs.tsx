'use client';

import React from 'react';
import { Box, Container, Breadcrumbs, Typography, Link as MuiLink, alpha } from '@mui/material';
import { NavigateNext as NextIcon, Home as HomeIcon } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { startCase } from 'lodash';

export default function MuiBreadcrumbs() {
    const pathname = usePathname();
    
    // Don't show on Home page
    if (pathname === '/') return null;

    const pathnames = pathname.split('/').filter((x) => x && x.toLowerCase() !== 'user');

    return (
        <Box 
            sx={{ 
                bgcolor: '#f8fafc', 
                py: { xs: 1.5, md: 2 }, 
                borderBottom: '1px solid #f1f5f9' 
            }}
        >
            <Container maxWidth="xl">
                <Breadcrumbs 
                    separator={<NextIcon sx={{ fontSize: 14, color: '#94a3b8' }} />} 
                    aria-label="breadcrumb"
                >
                    <MuiLink
                        component={Link}
                        href="/"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            '&:hover': { color: 'primary.main' }
                        }}
                    >
                        <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                        Home
                    </MuiLink>
                    
                    {pathnames.map((name, index) => {
                        const isLast = index === pathnames.length - 1;
                        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                        
                        // Handle localized titles or UUIDs/IDs 
                        const isNumeric = !isNaN(Number(name));
                        const displayName = isNumeric ? (index > 0 && pathnames[index-1].includes('products') ? 'Product Details' : 'View') : startCase(name);

                        return isLast ? (
                            <Typography 
                                key={name} 
                                sx={{ 
                                    color: 'text.primary', 
                                    fontSize: '0.85rem', 
                                    fontWeight: 800 
                                }}
                            >
                                {displayName}
                            </Typography>
                        ) : (
                            <MuiLink
                                key={name}
                                component={Link}
                                href={routeTo}
                                sx={{
                                    color: 'text.secondary',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    '&:hover': { color: 'primary.main' }
                                }}
                            >
                                {displayName}
                            </MuiLink>
                        );
                    })}
                </Breadcrumbs>
            </Container>
        </Box>
    );
}
