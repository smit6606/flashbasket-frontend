import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DeliveryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={['delivery']}>
            {children}
        </ProtectedRoute>
    );
}
