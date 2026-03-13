'use client';

import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    ButtonGroup,
    Button,
    Paper,
    Stack,
    alpha,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    DeleteOutline as DeleteIcon,
} from '@mui/icons-material';

interface MuiCartItemProps {
    item: {
        id: number;
        quantity: number;
        price: string;
        itemTotal: string;
        Product: {
            productName: string;
            images: string[];
        } | null;
        Seller: {
            shop_name: string;
        } | null;
    };
    onUpdateQuantity: (cartItemId: number, newQuantity: number) => void;
    onRemove: (cartItemId: number) => void;
}

export default function MuiCartItem({ item, onUpdateQuantity, onRemove }: MuiCartItemProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 1.5,
                border: '1px solid #f1f5f9',
                display: 'flex',
                gap: { xs: 2, sm: 3 },
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'row', sm: 'row' },
                '&:hover': { bgcolor: '#f8fafc' },
                transition: 'background-color 0.2s',
            }}
        >
            <Box
                sx={{
                    width: { xs: 70, sm: 90 },
                    height: { xs: 70, sm: 90 },
                    bgcolor: 'white',
                    borderRadius: 1,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #f1f5f9',
                    flexShrink: 0,
                }}
            >
                <img
                    src={item.Product?.images?.[0] || 'https://placehold.co/200x200?text=Item'}
                    alt={item.Product?.productName || 'Product'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </Box>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 800,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: { xs: '0.6rem', sm: '0.65rem' }
                    }}
                >
                    {item.Seller?.shop_name || 'Generic Seller'}
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 800,
                        mb: { xs: 1, sm: 1.5 },
                        lineHeight: 1.2,
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {item.Product?.productName || 'Unknown Product'}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>₹{item.price}</Typography>
                        <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontWeight: 700, opacity: 0.6 }}>
                            ₹{Number(item.price) + 40}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center" sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}>
                        <IconButton
                            size="small"
                            onClick={() => onRemove(item.id)}
                            sx={{ color: 'error.main', '&:hover': { bgcolor: alpha('#ef5350', 0.1) } }}
                        >
                            <DeleteIcon fontSize="medium" />
                        </IconButton>

                        <Box 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                bgcolor: 'primary.main', 
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(12, 131, 31, 0.15)'
                            }}
                        >
                            {item.quantity > 1 ? (
                                <Button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    sx={{ 
                                        color: 'white', 
                                        minWidth: { xs: 28, sm: 32 }, 
                                        height: { xs: 28, sm: 32 },
                                        p: 0,
                                        '&:hover': { bgcolor: 'primary.dark' } 
                                    }}
                                >
                                    <RemoveIcon fontSize="small" />
                                </Button>
                            ) : (
                                <Box sx={{ minWidth: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }} />
                            )}
                            <Box sx={{ minWidth: { xs: 28, sm: 32 }, px: 1, height: { xs: 28, sm: 32 }, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.85rem' }}>
                                {item.quantity}
                            </Box>
                            <Button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                sx={{ 
                                    color: 'white', 
                                    minWidth: { xs: 28, sm: 32 }, 
                                    height: { xs: 28, sm: 32 },
                                    p: 0,
                                    '&:hover': { bgcolor: 'primary.dark' } 
                                }}
                            >
                                <AddIcon fontSize="small" />
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </Paper>
    );
}
