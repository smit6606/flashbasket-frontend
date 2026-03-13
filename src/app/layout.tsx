import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { SocketProvider } from "@/context/SocketContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ThemeRegistry from "@/theme/ThemeRegistry";

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
              <SocketProvider>
                {children}
              </SocketProvider>
            </CartProvider>
          </AuthProvider>
          <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop closeOnClick pauseOnHover draggable />
        </ThemeRegistry>
      </body>
    </html>
  );
}
