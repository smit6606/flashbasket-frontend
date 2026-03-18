'use client';

import React from 'react';
import { 
    Box, 
    Skeleton, 
    Grid, 
    Stack, 
    Paper,
    Divider
} from '@mui/material';

export const ProductSkeleton = () => (
    <Box sx={{ p: 1 }}>
        <Skeleton variant="rounded" width="100%" height={250} sx={{ borderRadius: 4, mb: 2 }} />
        <Skeleton variant="text" width="80%" height={30} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={25} sx={{ mb: 2 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width="30%" height={40} />
            <Skeleton variant="rectangular" width="40%" height={45} sx={{ borderRadius: 2 }} />
        </Stack>
    </Box>
);

export const OrderSkeleton = () => (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
                <Skeleton variant="text" width={120} height={35} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={80} height={20} />
            </Box>
            <Skeleton variant="rounded" width={100} height={30} sx={{ borderRadius: 5 }} />
        </Stack>
        <Divider sx={{ my: 2, opacity: 0.1 }} />
        <Stack spacing={2} sx={{ mt: 3 }}>
            {[1, 2].map(i => (
                <Stack key={i} direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="rounded" width={50} height={50} sx={{ borderRadius: 1.5 }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={25} />
                        <Skeleton variant="text" width="30%" height={20} />
                    </Box>
                    <Skeleton variant="text" width={60} height={25} />
                </Stack>
            ))}
        </Stack>
    </Paper>
);

export const CategorySkeleton = () => (
    <Box sx={{ textAlign: 'center', p: 1 }}>
        <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
        <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
    </Box>
);

export const GridSkeleton = ({ count = 8, type = 'product' }: { count?: number, type?: 'product' | 'category' | 'order' }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'category': return <CategorySkeleton />;
            case 'order': return <OrderSkeleton />;
            default: return <ProductSkeleton />;
        }
    };

    return (
        <Grid container spacing={3}>
            {Array.from(new Array(count)).map((_, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={index} sx={{ width: type === 'order' ? '100%' : 'auto' }}>
                    {renderSkeleton()}
                </Grid>
            ))}
        </Grid>
    );
};

