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
        };
        Seller: {
            shop_name: string;
        };
    };
    onUpdateQuantity: (cartItemId: number, newQuantity: number) => void;
    onRemove: (cartItemId: number) => void;
}

export default function MuiCartItem({ item, onUpdateQuantity, onRemove }: MuiCartItemProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 4,
                border: '1px solid #f1f5f9',
                display: 'flex',
                gap: 3,
                alignItems: 'center',
                '&:hover': { bgcolor: '#f8fafc' },
                transition: 'background-color 0.2s',
            }}
        >
            <Box
                sx={{
                    width: 90,
                    height: 90,
                    bgcolor: 'white',
                    borderRadius: 4,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #f1f5f9',
                    flexShrink: 0,
                }}
            >
                <img
                    src={item.Product.images?.[0] || 'https://placehold.co/200x200?text=Item'}
                    alt={item.Product.productName}
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
                        fontSize: '0.65rem'
                    }}
                >
                    {item.Seller.shop_name}
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 800,
                        mb: 1.5,
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {item.Product.productName}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>₹{item.price}</Typography>
                        <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontWeight: 700, opacity: 0.6 }}>
                            ₹{Number(item.price) + 20}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton
                            size="small"
                            onClick={() => onRemove(item.id)}
                            sx={{ color: 'error.main', '&:hover': { bgcolor: alpha('#ef5350', 0.1) } }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>

                        <ButtonGroup
                            size="small"
                            sx={{
                                bgcolor: 'primary.main',
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(12, 131, 31, 0.15)'
                            }}
                        >
                            <Button
                                onClick={() => {
                                    if (item.quantity === 1) onRemove(item.id);
                                    else onUpdateQuantity(item.id, item.quantity - 1);
                                }}
                                sx={{ color: 'white', border: 'none !important', minWidth: 32, '&:hover': { bgcolor: 'primary.dark' } }}
                            >
                                <RemoveIcon fontSize="small" />
                            </Button>
                            <Box sx={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.85rem' }}>
                                {item.quantity}
                            </Box>
                            <Button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                sx={{ color: 'white', border: 'none !important', minWidth: 32, '&:hover': { bgcolor: 'primary.dark' } }}
                            >
                                <AddIcon fontSize="small" />
                            </Button>
                        </ButtonGroup>
                    </Stack>
                </Box>
            </Box>
        </Paper>
    );
}
