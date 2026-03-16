'use client';

import React from 'react';
import { 
    Button, 
    ButtonProps, 
    CircularProgress, 
    Stack, 
    Typography 
} from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
    loading?: boolean;
    loadingText?: string;
    icon?: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ 
    loading, 
    loadingText = 'Processing...', 
    children, 
    disabled, 
    startIcon,
    ...props 
}) => {
    return (
        <Button
            {...props}
            disabled={disabled || loading}
            startIcon={loading ? null : startIcon}
            sx={{
                position: 'relative',
                transition: 'all 0.2s',
                ...(loading && {
                    bgcolor: 'action.disabledBackground',
                    pointerEvents: 'none',
                }),
                ...props.sx
            }}
        >
            {loading ? (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <CircularProgress size={20} color="inherit" thickness={5} />
                    {loadingText && (
                        <Typography variant="inherit" sx={{ fontWeight: 900 }}>
                            {loadingText}
                        </Typography>
                    )}
                </Stack>
            ) : (
                children
            )}
        </Button>
    );
};

export default LoadingButton;
