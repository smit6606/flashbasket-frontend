'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their own dashboard if they are in the wrong place
        if (user.role === 'admin') router.replace('/admin');
        else if (user.role === 'seller') router.replace('/seller');
        else if (user.role === 'delivery') router.replace('/delivery');
        else router.replace('/');
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress thickness={5} size={60} sx={{ color: '#0C831F' }} />
      </Box>
    );
  }

  return <>{children}</>;
};
