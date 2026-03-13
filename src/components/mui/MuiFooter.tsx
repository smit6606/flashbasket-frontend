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
    alpha,
} from '@mui/material';
import {
    Facebook,
    Instagram,
    Twitter,
    LinkedIn,
} from '@mui/icons-material';
import Link from 'next/link';

export default function MuiFooter() {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: '#0f172a',
                color: 'white',
                pt: 10,
                pb: 6,
                mt: 'auto'
            }}
        >
            <Container maxWidth="xl">
                <Grid container spacing={6}>
                    {/* Brand & Socials */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                            <img 
                                src="/logo.png" 
                                alt="FlashBasket Logo" 
                                style={{ width: 45, height: 45, objectFit: 'contain' }} 
                            />
                            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                                FlashBasket
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, mb: 4, maxWidth: 300, lineHeight: 1.7 }}>
                            Lightning-fast multi-seller marketplace. Get anything from your favorite local shops delivered in minutes.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            {[
                                { icon: <Instagram fontSize="small" />, label: 'Instagram' },
                                { icon: <Twitter fontSize="small" />, label: 'Twitter' },
                                { icon: <Facebook fontSize="small" />, label: 'Facebook' },
                                { icon: <LinkedIn fontSize="small" />, label: 'LinkedIn' },
                            ].map((social) => (
                                <IconButton 
                                    key={social.label}
                                    size="small" 
                                    sx={{ 
                                        color: 'white', 
                                        bgcolor: 'rgba(255,255,255,0.05)', 
                                        '&:hover': { bgcolor: 'primary.main', color: 'white' } 
                                    }}
                                >
                                    {social.icon}
                                </IconButton>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Quick Links Group */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Company</Typography>
                                <Stack spacing={1.5}>
                                    {['About Us', 'Careers', 'Blog', 'Contact Us'].map(l => (
                                        <Typography key={l} variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{l}</Typography>
                                    ))}
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Support</Typography>
                                <Stack spacing={1.5}>
                                    {['Help Center', 'FAQs', 'Return Policy', 'Privacy Policy'].map(l => (
                                        <Typography key={l} variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{l}</Typography>
                                    ))}
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Categories</Typography>
                                <Stack spacing={1.5}>
                                    {['Grocery', 'Snacks', 'Beverages', 'Personal Care'].map(l => (
                                        <Typography key={l} variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{l}</Typography>
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* App Download Info */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Download Our App</Typography>
                        <Stack spacing={2}>
                            {/* Google Play Button */}
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.5, 
                                    border: '1px solid rgba(255,255,255,0.15)', 
                                    borderRadius: 2, 
                                    p: '8px 16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: 'white', '& *': { color: '#0f172a' }, borderColor: 'white' }
                                }}
                            >
                                <img src="/play-store.png" alt="Play Store" style={{ width: 24, height: 24 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, lineHeight: 1.2, color: 'rgba(255,255,255,0.5)' }}>Get it on</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Google Play</Typography>
                                </Box>
                            </Box>

                            {/* App Store Button */}
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.5, 
                                    border: '1px solid rgba(255,255,255,0.15)', 
                                    borderRadius: 2, 
                                    p: '8px 16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: 'white', '& *': { color: '#0f172a' }, borderColor: 'white' }
                                }}
                            >
                                <img src="/apple-store.png" alt="App Store" style={{ width: 24, height: 24, filter: 'invert(1)' }} />
                                <Box>
                                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, lineHeight: 1.2, color: 'rgba(255,255,255,0.5)' }}>Download on the</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>App Store</Typography>
                                </Box>
                            </Box>
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', mt: 3 }}>
                            Experience the fastest delivery in your city. Download the FlashBasket app today for exclusive rewards.
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.05)' }} />

                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                        © {new Date().getFullYear()} FlashBasket Technologies Private Limited.
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                        Made with ❤️ for Local Commerce
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
}
