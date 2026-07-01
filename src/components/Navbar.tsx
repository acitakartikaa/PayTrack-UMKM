import React from 'react';
import { Bell, LogOut, Wallet, User as UserIcon, Shield } from 'lucide-react';
import { User, UMKM } from '../types';

interface NavbarProps {
  currentUser: User;
  umkm: UMKM | null;
  unreadCount: number;
  onLogout: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  umkm,
  unreadCount,
  onLogout,
  onOpenNotifications
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* App Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/10">
            <span className="font-display text-xl font-bold tracking-tight">P</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-slate-900">
              PayTrack <span className="text-brand-600">UMKM</span>
            </h1>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              Sistem Kelola Kredit
            </p>
          </div>
        </div>

        {/* Action Indicators */}
        <div className="flex items-center gap-4">
          
          {/* Active Cash Balance Indicator (Only shown to UMKM Owner) */}
          {currentUser.role === 'owner' && umkm && (
            <div className="hidden items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-1.5 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Kas Sembako Budi
                </p>
                <p className="font-mono text-xs font-bold text-emerald-800">
                  Rp {umkm.saldo_kas.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}

          {/* Role Status Tag */}
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            currentUser.role === 'admin' 
              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
              : 'bg-blue-50 text-brand-700 border border-blue-200'
          }`}>
            {currentUser.role === 'admin' ? (
              <Shield className="h-3.5 w-3.5" />
            ) : (
              <UserIcon className="h-3.5 w-3.5" />
            )}
            <span className="capitalize">{currentUser.role === 'admin' ? 'Admin Sistem' : 'Pemilik UMKM'}</span>
          </div>

          {/* Interactive Notifications Button */}
          {currentUser.role === 'owner' && (
            <button
              onClick={onOpenNotifications}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 cursor-pointer"
              title="Notifikasi"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-4 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Details & Sign Out */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold text-slate-800">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">@{currentUser.username}</p>
            </div>
            
            <button
              onClick={onLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50/50 text-red-600 transition-all hover:bg-red-100 hover:text-red-700 active:scale-95 cursor-pointer"
              title="Keluar dari Aplikasi"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
