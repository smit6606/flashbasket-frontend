import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import NavigationLoader from "@/components/animations/NavigationLoader";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavouriteProvider } from "@/context/FavouriteContext";
import { SocketProvider } from "@/context/SocketContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ThemeRegistry from "@/theme/ThemeRegistry";
import NotificationManager from "@/components/NotificationManager";

export const metadata: Metadata = {
  title: "FlashBasket | Lightning Fast Marketplace",
  description: "Order from multiple nearby sellers with a single checkout. Fast delivery, fresh products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeRegistry>
          <AuthProvider>
            <CartProvider>
              <FavouriteProvider>
                <SocketProvider>
                  <Suspense fallback={null}>
                    <NavigationLoader />
                  </Suspense>
                  {children}
                  <NotificationManager />
                </SocketProvider>
              </FavouriteProvider>
            </CartProvider>
          </AuthProvider>
          <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop closeOnClick pauseOnHover draggable />
        </ThemeRegistry>
      </body>
    </html>
  );
}
