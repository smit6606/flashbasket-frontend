import PublicLayout from "@/layouts/PublicLayout";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PublicLayout>{children}</PublicLayout>;
}
