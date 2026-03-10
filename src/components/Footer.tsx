import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-16 px-5">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">
            FlashBasket
          </h2>
          <p className="text-slate-500 max-w-sm text-sm leading-relaxed mb-6 font-medium">
            Experience the fastest multi-seller marketplace. Order from your favorite nearby shops and get lightning-fast delivery within 10 minutes.
          </p>
          <div className="flex gap-4">
            <span className="text-2xl text-slate-300 hover:text-[#0C831F] cursor-pointer transition-colors">📱</span>
            <span className="text-2xl text-slate-300 hover:text-[#0C831F] cursor-pointer transition-colors">🌐</span>
            <span className="text-2xl text-slate-300 hover:text-[#0C831F] cursor-pointer transition-colors">✉️</span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-800 mb-6 text-sm uppercase tracking-wider">Useful Links</h4>
          <ul className="text-slate-500 space-y-3 text-sm font-medium">
            <li className="hover:text-[#0C831F] cursor-pointer transition-colors">About Us</li>
            <li className="hover:text-[#0C831F] cursor-pointer transition-colors">Terms of Service</li>
            <li className="hover:text-[#0C831F] cursor-pointer transition-colors">Privacy Policy</li>
            <li className="hover:text-[#0C831F] cursor-pointer transition-colors">Become a Seller</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-800 mb-6 text-sm uppercase tracking-wider">Contact Us</h4>
          <ul className="text-slate-500 space-y-3 text-sm font-medium">
            <li className="hover:text-[#0C831F] cursor-pointer transition-colors">help@flashbasket.com</li>
            <li className="hover:text-[#0C831F] cursor-pointer transition-colors">+91 98765 43210</li>
            <li className="leading-snug">FlashBasket HQ<br />Surat, Gujarat, India</li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto border-t border-gray-100 mt-12 pt-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-medium">
        <div>&copy; {new Date().getFullYear()} FlashBasket. All rights reserved.</div>
        <div>Made with ❤️ for fast commerce.</div>
      </div>
    </footer>
  );
};

export default Footer;
