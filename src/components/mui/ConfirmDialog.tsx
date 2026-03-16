'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    alpha,
    Zoom
} from '@mui/material';
import {
    Close as CloseIcon,
    WarningRounded as WarningIcon,
    DeleteOutline as DeleteIcon,
    HelpOutline as HelpIcon,
    ErrorOutline as ErrorIcon,
    CheckCircleOutline as SuccessIcon
} from '@mui/icons-material';
import LoadingButton from './LoadingButton';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false,
    type = 'info'
}: ConfirmDialogProps) {

    const getColor = () => {
        switch (type) {
            case 'danger': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'success': return '#0C831F';
            case 'info': return '#3b82f6';
            default: return '#3b82f6';
        }
    };

    const getIcon = () => {
        const sx = { fontSize: 40, color: getColor() };
        switch (type) {
            case 'danger': return <DeleteIcon sx={sx} />;
            case 'warning': return <WarningIcon sx={sx} />;
            case 'success': return <SuccessIcon sx={sx} />;
            case 'info': return <HelpIcon sx={sx} />;
            default: return <HelpIcon sx={sx} />;
        }
    };

    const color = getColor();

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            TransitionComponent={Zoom}
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    padding: 1,
                    maxWidth: 400,
                    width: '100%',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'visible'
                }
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(8px)'
                }
            }}
        >
            <IconButton
                onClick={onClose}
                disabled={loading}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'text.secondary',
                    '&:hover': { bgcolor: alpha(color, 0.05) }
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent sx={{ pt: 4, pb: 2, textAlign: 'center' }}>
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: alpha(color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}
                >
                    {getIcon()}
                </Box>
                
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#1e293b' }}>
                    {title}
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.6 }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="text"
                    sx={{
                        fontWeight: 900,
                        px: 3,
                        py: 1.2,
                        borderRadius: 3,
                        color: 'text.secondary',
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        '&:hover': { bgcolor: '#f1f5f9' }
                    }}
                >
                    {cancelText}
                </Button>
                
                <LoadingButton
                    onClick={onConfirm}
                    loading={loading}
                    variant="contained"
                    sx={{
                        bgcolor: color,
                        color: 'white',
                        fontWeight: 900,
                        px: 4,
                        py: 1.2,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        boxShadow: `0 10px 20px -5px ${alpha(color, 0.4)}`,
                        '&:hover': {
                            bgcolor: color,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 15px 30px -5px ${alpha(color, 0.5)}`,
                        },
                        '&:active': { transform: 'translateY(0)' }
                    }}
                >
                    {confirmText}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
