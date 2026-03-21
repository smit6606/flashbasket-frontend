'use client';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { Box } from '@mui/material';

export default function ProfilePage() {
    return (
        <Box sx={{ py: 4 }}>
            <ProfileEditor />
        </Box>
    );
}
