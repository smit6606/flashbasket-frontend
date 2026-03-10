'use client';

import React from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    IconButton,
    Divider,
    Stack,
    Link as MuiLink,
} from '@mui/material';
import {
    Facebook,
    Twitter,
    Instagram,
    LinkedIn,
    GitHub,
} from '@mui/icons-material';
import Link from 'next/link';

export default function MuiFooter() {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'white',
                pt: 10,
                pb: 6,
                borderTop: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Container maxWidth="xl">
                <Grid container spacing={8}>
                    {/* Logo & Info */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 2,
                                        fontSize: '1.2rem',
                                        fontWeight: 900,
                                    }}
                                >
                                    F
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
                                    FlashBasket
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, maxWidth: 320, fontWeight: 500 }}>
                                Lightning-fast multi-seller marketplace. Get anything from your favorite local shops delivered in minutes.
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                {[Facebook, Twitter, Instagram, LinkedIn, GitHub].map((Icon, i) => (
                                    <IconButton key={i} size="small" sx={{ bgcolor: 'f8fafc', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                                        <Icon fontSize="small" />
                                    </IconButton>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid>

                    {/* Useful Links */}
                    <Grid item xs={6} md={2}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                            Company
                        </Typography>
                        <Stack spacing={1.5}>
                            {['About Us', 'Services', 'Our Team', 'Careers', 'Contact'].map((item) => (
                                <MuiLink key={item} component={Link} href="#" underline="none" sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
                                    {item}
                                </MuiLink>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Marketplace */}
                    <Grid item xs={6} md={2}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                            Marketplace
                        </Typography>
                        <Stack spacing={1.5}>
                            {['All Products', 'Sellers', 'Categories', 'Flash Deals', 'Sell on FlashBasket'].map((item) => (
                                <MuiLink key={item} component={Link} href="#" underline="none" sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
                                    {item}
                                </MuiLink>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Newsletter */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                            Stay Updated
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontWeight: 500 }}>
                            Subscribe to our newsletter for the latest deals and marketplace updates.
                        </Typography>
                        {/* Newsletter input could go here */}
                        <Box sx={{ p: 4, bgcolor: 'primary.light', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                            <Typography variant="h6" sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Flash Weekly</Typography>
                            <Typography variant="caption" sx={{ color: 'primary.dark', opacity: 0.8, fontWeight: 700 }}>Curated deals sent every Monday.</Typography>
                            <Box sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: '6rem', opacity: 0.1 }}>📩</Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 6 }} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        © {new Date().getFullYear()} FlashBasket Technologies Pvt Ltd. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                            <MuiLink key={item} href="#" underline="none" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 700 }}>
                                {item}
                            </MuiLink>
                        ))}
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}
