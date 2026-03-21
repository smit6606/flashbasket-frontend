'use client';

import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import AuthSplitScreen from '@/components/auth/AuthSplitScreen';

export default function LoginPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>}>
      <AuthSplitScreen initialMode="login" />
    </Suspense>
  );
}
