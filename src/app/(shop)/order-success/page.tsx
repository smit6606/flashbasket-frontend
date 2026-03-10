'use client';

import React from 'react';
import Link from 'next/link';

export default function OrderSuccessPage() {
    return (
        <div className="max-w-xl mx-auto py-20 px-6 text-center">
            <div className="size-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">
                ✓
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">Order Placed!</h1>
            <p className="text-slate-500 font-bold text-lg mb-10">
                Your lightning-fast delivery is being prepared. Check your email for details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/orders"
                    className="py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all"
                >
                    View My Orders
                </Link>
                <Link
                    href="/"
                    className="py-4 border-2 border-slate-100 text-slate-900 rounded-2xl font-black hover:bg-slate-50 transition-all"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
