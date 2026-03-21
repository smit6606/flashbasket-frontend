'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL;
        let socketUrlEnv = process.env.NEXT_PUBLIC_SOCKET_URL;
        let socketUrl = '';

        if (socketUrlEnv) {
            socketUrl = socketUrlEnv;
        } else if (apiUrl) {
            // Remove /api or /api/ from the end of the URL
            socketUrl = apiUrl.replace(/\/api\/?$/, '');
        } else if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname.includes('devtunnels.ms')) {
                // Auto-detect backend socket URL for dev tunnels if env is missing
                // This replaces -3000 with -5000 to find the backend tunnel
                socketUrl = `https://${hostname.replace('-3000', '-5000')}`;
            } else {
                socketUrl = 'http://localhost:5000';
            }
        } else {
            socketUrl = 'http://localhost:5000';
        }

        console.log('🔌 Socket attempting connection to:', socketUrl);

        const socketInstance = io(socketUrl, {
            transports: ['websocket', 'polling'], // Support both for better compatibility
            withCredentials: true
        });

        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('✅ Socket connected successfully to:', socketUrl);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('❌ Socket connection error for URL:', socketUrl, error);
        });

        if (!apiUrl && !window.location.hostname.includes('devtunnels.ms')) {
            console.warn('⚠️ NEXT_PUBLIC_API_URL is not defined and not on dev tunnel. Falling back to localhost.');
        }

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
