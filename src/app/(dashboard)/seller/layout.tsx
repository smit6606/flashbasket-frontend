import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={['seller']}>
            {children}
        </ProtectedRoute>
    );
}
