'use client';

import React from 'react';
import { Button, IconButton, Tooltip, Stack, Typography, alpha } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface MuiBackButtonProps {
    variant?: 'button' | 'icon';
    fallbackPath?: string;
}

export default function MuiBackButton({ variant = 'button', fallbackPath = '/' }: MuiBackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackPath);
        }
    };

    return (
        <>
            {/* Desktop / Tablet version (text + icon) */}
            <Button
                startIcon={<BackIcon />}
                onClick={handleBack}
                sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    bgcolor: alpha('#0f172a', 0.04),
                    borderRadius: 3,
                    px: 2,
                    py: 0.8,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    border: '1px solid',
                    borderColor: alpha('#0f172a', 0.08),
                    '&:hover': {
                        bgcolor: alpha('#0f172a', 0.08),
                        borderColor: alpha('#0f172a', 0.12),
                        transform: 'translateX(-2px)'
                    },
                    transition: 'all 0.2s',
                    mr: 2,
                    display: { xs: 'none', md: 'flex' } 
                }}
            >
                Back
            </Button>

            {/* Mobile / Small screen version (icon only) */}
            <Tooltip title="Go Back">
                <IconButton 
                    onClick={handleBack}
                    sx={{ 
                        color: 'text.primary',
                        bgcolor: alpha('#0f172a', 0.04),
                        '&:hover': { bgcolor: alpha('#0f172a', 0.08), transform: 'translateX(-2px)' },
                        borderRadius: 2.5,
                        mr: { xs: 1, md: 0 },
                        border: '1px solid',
                        borderColor: alpha('#0f172a', 0.08),
                        transition: 'all 0.2s',
                        display: { xs: 'flex', md: 'none' }
                    }}
                >
                    <BackIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </>
    );
}
