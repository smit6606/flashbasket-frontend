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
    Instagram,
} from '@mui/icons-material';
import Link from 'next/link';

export default function MuiFooter() {
    return (
        <Box component="footer" sx={{ bgcolor: '#f8fafc', py: 8, borderTop: '1px solid #e2e8f0', mt: 'auto' }}>
            <Container maxWidth="xl">
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 3 }}>
                            <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 1, py: 0.5, borderRadius: 1.5, fontWeight: 900 }}>F</Box>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>FlashBasket</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 3 }}>
                            Lightning-fast multi-seller marketplace. Get anything from your favorite local shops delivered in minutes.
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                            <IconButton size="small" sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#0C831F', color: 'white', borderColor: '#0C831F' } }}>
                                <Facebook fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#0C831F', color: 'white', borderColor: '#0C831F' } }}>
                                <Instagram fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: { md: 'center' }, textAlign: { md: 'center' } }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 3 }}>Company</Typography>
                        <Stack spacing={1.5} sx={{ alignItems: { md: 'center' } }}>
                            {['About Us', 'Careers', 'Press', 'Contact'].map(link => (
                                <Link key={link} href="#" passHref style={{ textDecoration: 'none' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{link}</Typography>
                                </Link>
                            ))}
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: { md: 'center' }, textAlign: { md: 'center' } }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 3 }}>Products</Typography>
                        <Stack spacing={1.5} sx={{ alignItems: { md: 'center' } }}>
                            {['Fresh Vegetables', 'Dairy & Eggs', 'Snacks', 'Beverages'].map(link => (
                                <Link key={link} href="#" passHref style={{ textDecoration: 'none' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{link}</Typography>
                                </Link>
                            ))}
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, textAlign: { xs: 'left', md: 'right' } }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 3 }}>Support & Legal</Typography>
                        <Stack spacing={1.5} sx={{ alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                            {['Help Center', 'Privacy Policy', 'Terms of Service', 'Refund Policy'].map(link => (
                                <Link key={link} href="#" passHref style={{ textDecoration: 'none' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{link}</Typography>
                                </Link>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 4 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 700 }}>
                    © 2026 FlashBasket Technologies. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
}
