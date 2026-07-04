import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 px-6 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-white text-lg">QuickCafe</span>
          <p className="text-sm mt-1">Smart QR Code Table Ordering Solution</p>
        </div>
        <div className="text-sm md:text-right">
          <p>© {new Date().getFullYear()} QuickCafe Inc. All rights reserved.</p>
          <p className="text-xs text-slate-500 mt-0.5">Powered by Supabase & React 19</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
