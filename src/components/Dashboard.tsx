import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Wallet, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  DollarSign,
  Briefcase,
  Users
} from 'lucide-react';
import { HutangKredit, Supplier, UMKM, LaporanKeuangan } from '../types';
import { getReportsData } from '../dbManager';

interface DashboardProps {
  umkm: UMKM;
  hutangs: HutangKredit[];
  suppliers: Supplier[];
  logs: LaporanKeuangan[];
  onAddCash: (amount: number, category: string, remarks: string) => void;
  onNavigate: (tab: string) => void;
  onSelectDebtToPay: (debtId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  umkm,
  hutangs,
  suppliers,
  logs,
  onAddCash,
  onNavigate,
  onSelectDebtToPay
}) => {
  const [cashAmount, setCashAmount] = useState('');
  const [cashCategory, setCashCategory] = useState('modal_awal');
  const [cashRemarks, setCashRemarks] = useState('');
  const [showCashModal, setShowCashModal] = useState(false);

  // Load report data
  const reportData = getReportsData();
  const summary = reportData.summary;

  const handleCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(cashAmount);
    if (!isNaN(parsed) && parsed > 0) {
      onAddCash(parsed, cashCategory, cashRemarks || 'Penambahan kas manual');
      setCashAmount('');
      setCashRemarks('');
      setShowCashModal(false);
    }
  };

  // Get Top 3 Priority Debts
  const db = JSON.parse(localStorage.getItem('paytrack_umkm_relational_db') || '{}');
  const activePriorities = (db.prioritas_pembayaran || [])
    .slice(0, 3)
    .map((p: any) => {
      const h = hutangs.find(hut => hut.id === p.hutang_id);
      const s = h ? suppliers.find(sup => sup.id === h.supplier_id) : null;
      return {
        hutang: h,
        supplier: s,
        score: p.skor_prioritas,
        urutan: p.urutan_rekomendasi
      };
    })
    .filter((p: any) => p.hutang && p.hutang.status_hutang !== 'lunas');

  // Calculate debt repayment progress
  const totalOriginalDebt = hutangs.reduce((sum, h) => sum + h.jumlah_hutang, 0);
  const totalPaidDebt = summary.totalTerbayar;
  const progressPercent = totalOriginalDebt > 0 
    ? Math.round((totalPaidDebt / (totalOriginalDebt + summary.totalHutangAktif)) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 p-6 shadow-xl text-white md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"></div>
        
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" /> PayTrack Smart Dashboard
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Halo, {umkm.pemilik_name}!
            </h2>
            <p className="max-w-xl text-xs text-slate-300 leading-relaxed">
              Pantau dan kelola hutang kredit untuk toko **{umkm.nama_umkm}** Anda secara real-time. Hitung prioritas pembayaran otomatis untuk menghindari denda jatuh tempo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCashModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <PlusCircle className="h-4 w-4" /> Tambah Saldo Kas
            </button>
            <button
              onClick={() => onNavigate('simulasi')}
              className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-brand-400" /> Simulasi Pelunasan
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Cash Balance Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Kas Operasional</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold text-slate-900 tracking-tight">
              Rp {summary.saldoKas.toLocaleString('id-ID')}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <ArrowUpRight className="h-3 w-3" /> Kas Tersedia untuk Pembayaran
            </p>
          </div>
        </div>

        {/* Total Active Debt Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Hutang Aktif</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold text-slate-900 tracking-tight">
              Rp {summary.totalHutangAktif.toLocaleString('id-ID')}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-600">
              <AlertTriangle className="h-3 w-3" /> {hutangs.filter(h => h.status_hutang !== 'lunas').length} Faktur Belum Lunas
            </p>
          </div>
        </div>

        {/* Imminent Due Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jatuh Tempo (H-7)</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold text-slate-900 tracking-tight">
              Rp {summary.hutangAkanJatuhTempo.toLocaleString('id-ID')}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
              Segera Jatuh Tempo Pekan Ini
            </p>
          </div>
        </div>

        {/* Overdue Debt Card */}
        <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Hutang Terlambat</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold text-rose-700 tracking-tight">
              Rp {summary.hutangTerlambat.toLocaleString('id-ID')}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
              Melewati Batas Jatuh Tempo!
            </p>
          </div>
        </div>

      </div>

      {/* Repayment Progress & Priority Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left: Repayment Milestone & Cash Logs */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6 lg:col-span-2">
          <div>
            <h4 className="font-display text-base font-bold text-slate-950">Milestone Pembayaran Kredit</h4>
            <p className="text-xs text-slate-500">Persentase total pelunasan hutang terdaftar.</p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Total Kredit Terbayar: Rp {totalPaidDebt.toLocaleString('id-ID')}</span>
              <span className="font-mono font-bold text-brand-600">{progressPercent}% Terbayar</span>
            </div>
            
            {/* Custom Visual Meter */}
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Transaction Logs */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Aktivitas Kas Terbaru</h5>
              <button 
                onClick={() => onNavigate('laporan')}
                className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
              >
                Lihat Semua Laporan
              </button>
            </div>

            <div className="space-y-3">
              {logs.slice(-3).reverse().map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 p-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      log.tipe === 'pemasukan' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      {log.tipe === 'pemasukan' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{log.keterangan}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.tanggal} • <span className="capitalize">{log.kategori.replace('_', ' ')}</span></p>
                    </div>
                  </div>
                  <span className={`font-mono font-bold ${
                    log.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-slate-700'
                  }`}>
                    {log.tipe === 'pemasukan' ? '+' : '-'} Rp {log.jumlah.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-center py-4 text-xs text-slate-400">Belum ada aktivitas kas.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right: Urgent Priorities Widget */}
        <div className="rounded-3xl border border-brand-100 bg-brand-50/10 p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-0.5">
              Rekomendasi Pintar
            </span>
            <h4 className="font-display text-base font-bold text-slate-950">Prioritas Utama Pembayaran</h4>
            <p className="text-xs text-slate-500">Skor dihitung otomatis berdasarkan sisa hari jatuh tempo, denda, dan prioritas supplier.</p>
          </div>

          <div className="space-y-4">
            {activePriorities.map((item: any, i: number) => (
              <div 
                key={item.hutang.id} 
                className="group relative rounded-2xl border border-slate-100 bg-white p-4 shadow-xs hover:shadow-md transition-all duration-200"
              >
                {/* Ranking tag */}
                <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-xs">
                  #{i + 1}
                </div>

                <div className="space-y-2">
                  <div className="text-left pr-8">
                    <p className="font-semibold text-slate-800 text-xs truncate">
                      {item.supplier?.nama_supplier || 'Supplier'}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">
                      No Faktur: {item.hutang.nomor_faktur}
                    </p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400">Jumlah Hutang</p>
                      <p className="font-mono text-xs font-bold text-slate-900">
                        Rp {item.hutang.jumlah_hutang.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400">Skor Prioritas</p>
                      <span className="inline-block rounded-lg bg-brand-50 px-2 py-1 font-mono text-xs font-bold text-brand-600">
                        {item.score} / 100
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Jatuh Tempo: {item.hutang.tanggal_jatuh_tempo}</span>
                    <button
                      onClick={() => onSelectDebtToPay(item.hutang.id)}
                      className="font-bold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer flex items-center gap-0.5"
                    >
                      Bayar Sekarang <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {activePriorities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-2.5">
                <span className="text-3xl">🎉</span>
                <p className="text-xs font-bold text-slate-700">Semua Hutang Lunas!</p>
                <p className="text-[11px] text-slate-400">Tidak ada hutang aktif yang memerlukan prioritas pembayaran.</p>
              </div>
            )}
          </div>

          {activePriorities.length > 0 && (
            <button
              onClick={() => onNavigate('prioritas')}
              className="w-full text-center rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white transition-all hover:bg-brand-700 active:scale-95 cursor-pointer shadow-md shadow-brand-600/10"
            >
              Kelola Urutan Prioritas Lengkap
            </button>
          )}

        </div>

      </div>

      {/* Cash Inflow Modal */}
      {showCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-bold text-slate-900">Tambah Saldo Kas</h4>
              <button 
                onClick={() => setShowCashModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCashSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Jumlah Kas Masuk (Rupiah)</label>
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center">
                  <span className="font-mono text-sm font-bold text-slate-400 mr-2">Rp</span>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Contoh: 5000000"
                    required
                    min="1000"
                    className="w-full bg-transparent text-sm font-mono font-bold text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kategori Kas</label>
                <select
                  value={cashCategory}
                  onChange={(e) => setCashCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-hidden"
                >
                  <option value="modal_awal">Tambahan Modal</option>
                  <option value="pendapatan">Omset Penjualan Harian</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Keterangan / Memo</label>
                <textarea
                  value={cashRemarks}
                  onChange={(e) => setCashRemarks(e.target.value)}
                  placeholder="Keterangan tambahan (misal: Setoran omset minggu ke-3)"
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-hidden resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCashModal(false)}
                  className="w-full rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-500 py-3 text-xs font-bold text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Simpan Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
