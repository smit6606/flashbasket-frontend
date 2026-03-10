'use client';

import React from 'react';

interface CartItemProps {
    item: {
        id: number;
        quantity: number;
        price: string;
        itemTotal: string;
        Product: {
            productName: string;
            images: string[];
        };
        Seller: {
            shop_name: string;
        };
    };
    onUpdateQuantity: (cartItemId: number, newQuantity: number) => void;
    onRemove: (cartItemId: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
    return (
        <div className="bg-white p-4 rounded-[16px] border border-gray-100 flex gap-4 items-center shadow-sm relative group">
            <div className="size-20 bg-gray-50 rounded-[12px] overflow-hidden p-2 flex-shrink-0 flex items-center justify-center border border-gray-100 border-dashed">
                <img
                    src={item.Product.images?.[0] || 'https://placehold.co/200x200/f8fafc/0C831F?text=Item'}
                    className="w-full h-full object-contain"
                    alt={item.Product.productName}
                />
            </div>

            <div className="flex-grow flex flex-col justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.Seller.shop_name}</p>
                <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight pr-6">{item.Product.productName}</h3>
                </div>

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-sm text-slate-800">₹{item.price}</span>
                        <span className="text-[10px] text-slate-400 font-medium line-through">₹{Number(item.price) + 10}</span>
                    </div>

                    <div className="flex items-center bg-[#0C831F] text-white rounded-lg shadow-sm">
                        <button
                            onClick={() => {
                                if (item.quantity === 1) onRemove(item.id);
                                else onUpdateQuantity(item.id, item.quantity - 1);
                            }}
                            className="w-8 h-8 flex items-center justify-center font-bold text-lg leading-none active:bg-black/10 transition-colors rounded-l-lg"
                        >
                            −
                        </button>
                        <span className="font-bold text-xs w-6 text-center">{item.quantity}</span>
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center font-bold text-lg leading-none active:bg-black/10 transition-colors rounded-r-lg"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
