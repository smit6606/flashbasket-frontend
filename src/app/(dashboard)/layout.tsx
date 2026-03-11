import DashboardLayout from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedRoute>
    );
}
