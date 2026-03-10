'use client';

import React from 'react';

interface CartSummaryProps {
    subtotal: string;
    onCheckout: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, onCheckout }) => {
    return (
        <div className="bg-white p-6 rounded-[16px] border border-gray-100 shadow-sm sticky top-[110px]">
            <h2 className="text-lg font-black text-slate-800 mb-5 border-b border-gray-100 pb-3">Bill Details</h2>

            <div className="space-y-3 mb-5 text-sm">
                <div className="flex justify-between text-slate-600 font-medium">
                    <span>Items Total</span>
                    <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                    <span>Delivery Charge</span>
                    <span className="text-blue-500 line-through mr-1 text-xs px-1">₹30</span>
                    <span className="text-[#0C831F] font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                    <span>Handling Fee</span>
                    <span>₹4</span>
                </div>

                <div className="border-t border-gray-100 border-dashed pt-4 mt-2">
                    <div className="flex justify-between text-base font-black text-slate-800">
                        <span>To Pay</span>
                        <span>₹{Number(subtotal) + 4}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={onCheckout}
                className="w-full py-4 bg-[#0C831F] text-white rounded-[14px] font-bold text-sm shadow-md shadow-[#0C831F]/20 hover:bg-[#0a6b19] transition-all flex items-center justify-between px-6"
            >
                <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold opacity-90">Total Payable</span>
                    <span className="text-base">₹{Number(subtotal) + 4}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>Proceed to Pay</span>
                    <span>→</span>
                </div>
            </button>

            <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-[10px] border border-gray-100">
                    <span className="text-xl">🛡️</span>
                    <div>
                        <div className="text-xs font-bold text-slate-700">100% Safe Payments</div>
                        <div className="text-[10px] text-slate-500">Genuine products from verified sellers</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartSummary;
