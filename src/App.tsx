/**
 * PayTrack UMKM - Main Application Entry
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { 
  getDb, 
  forceRecalculatePriorities, 
  addCash,
  getReportsData
} from './dbManager';
import { RelationalDatabase, User, UMKM } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Suppliers } from './components/Suppliers';
import { Debts } from './components/Debts';
import { Schedules } from './components/Schedules';
import { Priorities } from './components/Priorities';
import { Payments } from './components/Payments';
import { Notifications } from './components/Notifications';
import { Reports } from './components/Reports';
import { AdminUsers } from './components/AdminUsers';

import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  CreditCard, 
  Bell, 
  FileText, 
  Shield, 
  LogIn, 
  AlertTriangle,
  Briefcase,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [db, setDb] = useState<RelationalDatabase | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Extract activeTab from location path, e.g. "/supplier" -> "supplier"
  const activeTab = location.pathname.substring(1) || 'dashboard';
  
  // Interactive navigation / sidebar toggle for mobile
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // States to handle direct routing (e.g., clicking "Bayar" on dashboard routes to Payments and preselects debt)
  const [preselectedDebtId, setPreselectedDebtId] = useState<string | null>(null);
  const [preselectedAmount, setPreselectedAmount] = useState<number | undefined>(undefined);

  // Auth inputs
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Load Database and check session on startup
  useEffect(() => {
    const loadedDb = getDb();
    setDb(loadedDb);

    // Auto-login Budi Santoso (Owner) by default to give a highly populated instant preview experience,
    // but allow logging out and switching roles easily!
    const session = localStorage.getItem('paytrack_user_session');
    let userToSet = null;
    if (session) {
      try {
        userToSet = JSON.parse(session);
      } catch {
        userToSet = loadedDb.users[0];
      }
    } else {
      userToSet = loadedDb.users[0]; // Default to first user (Budi Santoso)
    }
    setCurrentUser(userToSet);

    if (userToSet) {
      if (location.pathname === '/' || location.pathname === '/login') {
        navigate('/dashboard', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  // Sync route safety
  useEffect(() => {
    if (db) {
      if (!currentUser) {
        if (location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      } else {
        if (location.pathname === '/login' || location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [currentUser, location.pathname, db, navigate]);

  const refreshState = () => {
    const loadedDb = getDb();
    setDb(loadedDb);
    
    // Sync current session user's state in case changes were made in admin console
    if (currentUser) {
      const updatedUser = loadedDb.users.find(u => u.id === currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        localStorage.setItem('paytrack_user_session', JSON.stringify(updatedUser));
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const matchedUser = db.users.find(
      u => u.username.toLowerCase() === loginUsername.toLowerCase().trim()
    );

    if (matchedUser) {
      setCurrentUser(matchedUser);
      localStorage.setItem('paytrack_user_session', JSON.stringify(matchedUser));
      setAuthError(null);
      navigate('/dashboard');
    } else {
      setAuthError('Username tidak terdaftar! Gunakan "budi" atau "admin".');
    }
  };

  const handlePresetLogin = (username: string) => {
    if (!db) return;
    const matchedUser = db.users.find(u => u.username === username);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      localStorage.setItem('paytrack_user_session', JSON.stringify(matchedUser));
      setAuthError(null);
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('paytrack_user_session');
    setLoginUsername('');
    setLoginPassword('');
    navigate('/login');
  };

  const handleAddCashFlow = (amount: number, category: string, remarks: string) => {
    addCash(amount, category, remarks);
    refreshState();
  };

  // Direct trigger to route to Payments screen with preselected invoice
  const handleSelectDebtToPay = (debtId: string, amount?: number) => {
    setPreselectedDebtId(debtId);
    setPreselectedAmount(amount);
    navigate('/realisasi');
  };

  // Clear routing selection once Payments modal closes
  const handleClearPreselected = () => {
    setPreselectedDebtId(null);
    setPreselectedAmount(undefined);
  };

  if (!db) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white font-mono text-xs">
        Memuat Database Relasional PayTrack...
      </div>
    );
  }

  // Auth gate
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background blobs for premium depth */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-500/20 font-display text-2xl font-bold">
              P
            </div>
            <h2 className="mt-4 text-center text-2xl font-bold font-display tracking-tight text-white">
              PayTrack <span className="text-brand-500">UMKM</span>
            </h2>
            <p className="mt-1.5 text-center text-xs text-slate-400">
              Sistem Manajemen Hutang Kredit & Prioritas Pembayaran Supplier
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md py-8 px-4 shadow-2xl rounded-3xl border border-slate-700 sm:px-10">
            {authError && (
              <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {authError}
              </div>
            )}

            <form className="space-y-4 text-left" onSubmit={handleLoginSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Username Akun</label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Ketik 'budi' atau 'admin'"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white font-mono placeholder-slate-500 outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Kata Sandi (Opsional untuk Demo)</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-brand-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500 active:scale-95 transition-all cursor-pointer"
              >
                Masuk ke Aplikasi
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-700 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Pilih Akun Instan (Demo):</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handlePresetLogin('budi')}
                  className="flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/40 p-3 hover:bg-slate-900/80 transition-colors text-center cursor-pointer"
                >
                  <span className="text-sm">🧔</span>
                  <span className="text-xs font-bold text-white mt-1">Sembako Budi</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">Pemilik UMKM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetLogin('admin')}
                  className="flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/40 p-3 hover:bg-slate-900/80 transition-colors text-center cursor-pointer"
                >
                  <span className="text-sm">👩‍💼</span>
                  <span className="text-xs font-bold text-white mt-1">Dewi Lestari</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">System Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active UMKM associated with owner
  const currentUmkm = db.umkm.find(m => m.id === currentUser.umkm_id) || db.umkm[0];

  // Unread notifications count
  const unreadNotificationsCount = db.notifikasi.filter(n => !n.dibaca).length;

  interface SidebarTab {
    id: string;
    label: string;
    icon: any;
    badge?: number;
  }

  // Sidebar Tabs Config
  const ownerTabs: SidebarTab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'supplier', label: 'Data Supplier', icon: Users },
    { id: 'hutang', label: 'Hutang Kredit', icon: TrendingUp },
    { id: 'jadwal', label: 'Jadwal Cicilan', icon: Calendar },
    { id: 'prioritas', label: 'Prioritas & Simulasi', icon: Sparkles },
    { id: 'realisasi', label: 'Catat Realisasi', icon: CreditCard },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell, badge: unreadNotificationsCount },
    { id: 'laporan', label: 'Laporan Keuangan', icon: FileText },
  ];

  const adminTabs: SidebarTab[] = [
    { id: 'dashboard', label: 'Dashboard Monitor', icon: LayoutDashboard },
    { id: 'supplier', label: 'Kelola Supplier', icon: Users },
    { id: 'users', label: 'Otorisasi Pengguna', icon: Shield },
    { id: 'laporan', label: 'Laporan Sistem', icon: FileText },
  ];

  const activeTabsList = currentUser.role === 'admin' ? adminTabs : ownerTabs;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Upper Navigation Header */}
      <Navbar
        currentUser={currentUser}
        umkm={currentUser.role === 'owner' ? currentUmkm : null}
        unreadCount={unreadNotificationsCount}
        onLogout={handleLogout}
        onOpenNotifications={() => {
          if (currentUser.role === 'owner') {
            navigate('/notifikasi');
          }
        }}
      />

      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Floating Mobile Hamburger Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-xs font-bold text-slate-800 capitalize">
            Menu: {activeTabsList.find(t => t.id === activeTab)?.label || 'Dashboard'}
          </span>
          <div className="w-5"></div>
        </div>

        {/* Responsive Drawer Sidebar Navigation */}
        <aside className={`w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col justify-between py-6 ${
          mobileSidebarOpen ? 'block' : 'hidden md:flex'
        } absolute md:static top-0 z-30 shadow-xl md:shadow-none h-[calc(100vh-4rem)] md:h-auto`}>
          
          {/* Tabs Checklist */}
          <nav className="space-y-1.5 px-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 text-left">Navigasi Utama</p>
            {activeTabsList.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    navigate(`/${tab.id}`);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-3 text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-brand-50 text-brand-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-4.5 w-4.5 ${
                      activeTab === tab.id ? 'text-brand-600' : 'text-slate-400'
                    }`} />
                    <span>{tab.label}</span>
                  </div>
                  
                  {/* Optional red/blue bubble indicators */}
                  {tab.badge && tab.badge > 0 ? (
                    <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Business identity footer info */}
          <div className="px-7 pt-4 border-t border-slate-100 text-left text-[10px] text-slate-400 font-mono space-y-1">
            <p>© 2026 PayTrack UMKM</p>
            <p>Database: Relational Sync</p>
            <p>Navigation: React Router SPA</p>
          </div>
        </aside>

        {/* Screen Content Wrapper */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-hidden">
          <Routes>
            <Route path="/dashboard" element={
              <Dashboard
                umkm={currentUmkm}
                hutangs={db.hutang_kredit}
                suppliers={db.supplier}
                logs={db.laporan_keuangan}
                onAddCash={handleAddCashFlow}
                onNavigate={(tab) => {
                  if (tab === 'simulasi') navigate('/prioritas');
                  else navigate(`/${tab}`);
                }}
                onSelectDebtToPay={handleSelectDebtToPay}
              />
            } />

            <Route path="/supplier" element={
              <Suppliers
                suppliers={db.supplier}
                userRole={currentUser.role}
                onRefresh={refreshState}
              />
            } />

            <Route path="/hutang" element={
              currentUser.role === 'owner' ? (
                <Debts
                  hutangs={db.hutang_kredit}
                  suppliers={db.supplier}
                  onRefresh={refreshState}
                  onOpenRecordPayment={handleSelectDebtToPay}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } />

            <Route path="/jadwal" element={
              currentUser.role === 'owner' ? (
                <Schedules
                  schedules={db.jadwal_pembayaran}
                  hutangs={db.hutang_kredit}
                  suppliers={db.supplier}
                  onOpenRecordPayment={handleSelectDebtToPay}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } />

            <Route path="/prioritas" element={
              currentUser.role === 'owner' ? (
                <Priorities
                  umkm={currentUmkm}
                  hutangs={db.hutang_kredit}
                  suppliers={db.supplier}
                  onRefresh={refreshState}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } />

            <Route path="/realisasi" element={
              currentUser.role === 'owner' ? (
                <Payments
                  payments={db.transaksi_pembayaran}
                  hutangs={db.hutang_kredit}
                  suppliers={db.supplier}
                  preselectedDebtId={preselectedDebtId}
                  preselectedAmount={preselectedAmount}
                  onRefresh={refreshState}
                  onClosePreselected={handleClearPreselected}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } />

            <Route path="/notifikasi" element={
              currentUser.role === 'owner' ? (
                <Notifications
                  notifications={db.notifikasi}
                  hutangs={db.hutang_kredit}
                  onRefresh={refreshState}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } />

            <Route path="/laporan" element={
              <Reports
                suppliers={db.supplier}
                hutangs={db.hutang_kredit}
                onRefresh={refreshState}
              />
            } />

            <Route path="/users" element={
              currentUser.role === 'admin' ? (
                <AdminUsers
                  users={db.users}
                  umkmList={db.umkm}
                  onRefresh={refreshState}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

      </div>
    </div>
  );
}
