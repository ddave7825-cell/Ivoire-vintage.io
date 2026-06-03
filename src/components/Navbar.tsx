import React from 'react';
import { Store } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  currentTab: 'cover' | 'buy' | 'sell' | 'history' | 'register' | 'admin';
  setCurrentTab: (tab: 'cover' | 'buy' | 'sell' | 'history' | 'register' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  sellerItemCount: number;
  activeAccount: UserAccount | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  cartCount,
  onOpenCart,
  sellerItemCount,
  activeAccount,
  isDarkMode,
  onToggleDarkMode,
}: NavbarProps) {
  return (
    <nav 
      id="app-navbar" 
      className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-150 dark:border-neutral-800 shadow-sm transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center h-16 items-center">
          
          {/* Logo Brand ONLY */}
          <div
            id="navbar-brand-logo"
            onClick={() => setCurrentTab('cover')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-vibrant-emerald flex items-center justify-center text-white shadow-md shadow-vibrant-emerald/20 transition-transform group-hover:scale-105">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight block text-left">
                <span className="text-vibrant-emerald font-extrabold font-display">IVOIRE</span>
                <span className="text-vibrant-orange font-black font-display">VINTAGE</span>
              </span>
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block -mt-1 transition-colors text-left">
                Friperie Chic à Abidjan
              </span>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
