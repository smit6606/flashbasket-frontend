'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardTopBar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="h-[80px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm relative z-20">
            <div className="flex items-center gap-4 text-slate-500">
                <button className="md:hidden text-2xl hover:text-emerald-500 transition-colors">
                    ☰
                </button>
                <div className="hidden sm:block">
                    <p className="text-xl font-black text-slate-800 tracking-tight">Dashboard Overview</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time system monitoring</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer hidden sm:flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black shadow-inner">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'Administrator'}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Premium Account</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                    Logout Session
                </button>
            </div>
        </header>
    );
}
