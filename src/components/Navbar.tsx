'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-5">
        <div className="flex items-center justify-between h-[84px] gap-8">

          {/* Logo & Location - Left */}
          <div className="flex items-center gap-8 shrink-0">
            <Link href="/" className="flex items-center gap-2 border-r border-gray-100 pr-8 py-2">
              <div className="size-10 bg-[#0C831F] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#0C831F]/20">
                F
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tight">
                FlashBasket
              </span>
            </Link>

            {/* Location Selector (Zepto/Blinkit Style) */}
            <div className="hidden md:flex flex-col cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Delivery in 11 minutes</span>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                <span className="truncate max-w-[150px]">Surat, Gujarat, India</span>
                <span className="text-xs">▼</span>
              </div>
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="text-lg text-slate-400">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search for 'milk', 'bread' or 'eggs'"
                className="w-full bg-gray-50 border border-gray-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-[#0C831F]/20 focus:border-[#0C831F] block p-3 pl-12 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Actions - Right */}
          <div className="flex items-center gap-5 shrink-0">
            {user ? (
              <div className="flex items-center gap-5">
                {/* Profile / Orders Dropdown toggle (simplified) */}
                <div className="hidden lg:flex flex-col text-right cursor-pointer group">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-[#0C831F] transition-colors">{user.user_name}</p>
                  <div className="flex items-center gap-3 justify-end text-xs font-semibold text-slate-500 mt-0.5">
                    {user.role === 'user' ? (
                      <Link href="/orders" className="hover:text-[#0C831F]">Orders</Link>
                    ) : (
                      <Link 
                        href={`/${user.role}`} 
                        className="text-[#0C831F] font-bold hover:underline underline-offset-4"
                      >
                        Go to {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Panel
                      </Link>
                    )}
                    <span>•</span>
                    <button onClick={logout} className="hover:text-red-500 transition-colors">Logout</button>
                  </div>
                </div>

                {/* Mobile Logout */}
                <button onClick={logout} className="lg:hidden text-xs font-bold text-slate-500 hover:text-red-500">
                  Logout
                </button>

                {/* Cart Button */}
                <Link href="/cart" className="flex items-center gap-2 bg-[#0C831F] hover:bg-[#0a6b19] transition-colors text-white px-4 py-2.5 rounded-[12px] font-bold shadow-md shadow-[#0C831F]/20">
                  <span className="text-lg">🛒</span>
                  <span className="text-sm">My Cart</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Login
                </Link>
                <Link href="/register" className="px-5 py-2.5 bg-[#0C831F] text-white rounded-[12px] text-sm font-bold shadow-md shadow-[#0C831F]/20 hover:bg-[#0a6b19] transition-all">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Search - Visible only on small screens */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="text-lg text-slate-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-50 border border-gray-200 text-slate-800 text-sm rounded-xl block p-3 pl-12 focus:ring-2 focus:ring-[#0C831F]/20 focus:border-[#0C831F] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
