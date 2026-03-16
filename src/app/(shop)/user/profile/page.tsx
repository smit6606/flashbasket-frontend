import ProfileEditor from '@/components/profile/ProfileEditor';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function UserProfilePage() {
    return (
        <ProtectedRoute allowedRoles={['user']}>
            <ProfileEditor />
        </ProtectedRoute>
    );
}
