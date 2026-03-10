import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent mb-4">
            FlashBasket
          </h2>
          <p className="text-slate-500 max-w-sm">
            Experience the fastest multi-seller marketplace. Order from your favorite nearby shops and get lightning-fast delivery.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="text-slate-500 space-y-2 text-sm">
            <li>About Us</li>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
            <li>Become a Seller</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">Contact</h4>
          <ul className="text-slate-500 space-y-2 text-sm">
            <li>Support: help@flashbasket.com</li>
            <li>Phone: +91 98765 43210</li>
            <li>Address: Surat, Gujarat, India</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-slate-200 mt-12 pt-8 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} FlashBasket. All rights reserved. Made with ❤️ for fast commerce.
      </div>
    </footer>
  );
};

export default Footer;
