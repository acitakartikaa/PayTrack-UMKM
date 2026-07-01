import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  ChevronRight, 
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import { JadwalPembayaran, HutangKredit, Supplier } from '../types';

interface SchedulesProps {
  schedules: JadwalPembayaran[];
  hutangs: HutangKredit[];
  suppliers: Supplier[];
  onOpenRecordPayment: (debtId: string, installmentAmount?: number) => void;
}

export const Schedules: React.FC<SchedulesProps> = ({
  schedules,
  hutangs,
  suppliers,
  onOpenRecordPayment
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'belum_dibayar' | 'dibayar'>('belum_dibayar');

  // Populate schedules with metadata
  const enrichedSchedules = schedules.map(sched => {
    const h = hutangs.find(hut => hut.id === sched.hutang_id);
    const s = h ? suppliers.find(sup => sup.id === h.supplier_id) : null;
    return {
      ...sched,
      faktur: h ? h.nomor_faktur : 'Unknown',
      supplierName: s ? s.nama_supplier : 'Supplier Unknown',
      supplierPriority: s ? s.tingkat_prioritas : 'sedang'
    };
  }).sort((a, b) => a.tanggal_rencana.localeCompare(b.tanggal_rencana));

  const filtered = enrichedSchedules.filter(s => {
    if (filterStatus === 'all') return true;
    return s.status_rencana === filterStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 md:text-2xl">Jadwal Cicilan Pembayaran</h2>
          <p className="text-xs text-slate-500">Timeline rencana pembayaran dan angsuran berjangka untuk melunasi tagihan supplier.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setFilterStatus('belum_dibayar')}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'belum_dibayar' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Mendatang (Belum Dibayar)
          </button>
          <button
            onClick={() => setFilterStatus('dibayar')}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'dibayar' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Riwayat Pembayaran
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua Rencana
          </button>
        </div>
      </div>

      {/* Main Timeline View */}
      <div className="space-y-4">
        {filtered.map((sched) => {
          const isOverdue = new Date(sched.tanggal_rencana) < new Date('2026-06-29') && sched.status_rencana === 'belum_dibayar';

          return (
            <div 
              key={sched.id} 
              className={`relative rounded-3xl border p-5 flex flex-col justify-between gap-4 md:flex-row md:items-center transition-all bg-white hover:shadow-xs ${
                sched.status_rencana === 'dibayar'
                  ? 'border-emerald-100 bg-emerald-50/5'
                  : isOverdue
                  ? 'border-rose-100 bg-rose-50/10'
                  : 'border-slate-100'
              }`}
            >
              {/* Left Column: Date and Time constraints */}
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 flex-col items-center justify-center rounded-2xl ${
                  sched.status_rencana === 'dibayar'
                    ? 'bg-emerald-100 text-emerald-800'
                    : isOverdue
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {new Date(sched.tanggal_rencana).toLocaleString('id-ID', { month: 'short' })}
                  </span>
                  <span className="font-display text-lg font-bold leading-none">
                    {new Date(sched.tanggal_rencana).getDate()}
                  </span>
                </div>

                <div className="text-left space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Faktur: {sched.faktur}</span>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      sched.supplierPriority === 'tinggi'
                        ? 'bg-rose-50 text-rose-700'
                        : sched.supplierPriority === 'sedang'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-50 text-slate-500'
                    }`}>
                      Prioritas: {sched.supplierPriority}
                    </span>
                  </div>
                  <h4 className="font-display text-sm font-bold text-slate-900">{sched.supplierName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">ID Cicilan: {sched.id}</p>
                </div>
              </div>

              {/* Right Column: Pricing and quick billing action */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:gap-8">
                
                {/* Repayment quantity */}
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-semibold text-slate-400">Angsuran Tagihan</p>
                  <p className="font-mono text-sm font-bold text-slate-900">
                    Rp {sched.jumlah_rencana.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-slate-400">Rencana: {sched.tanggal_rencana}</span>
                </div>

                {/* Status Indicator or Bayar trigger */}
                <div className="flex items-center gap-2">
                  {sched.status_rencana === 'dibayar' ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Lunas Terbayar
                    </span>
                  ) : isOverdue ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                        <AlertCircle className="h-3.5 w-3.5" /> Melewati Jatuh Tempo
                      </span>
                      <button
                        onClick={() => onOpenRecordPayment(sched.hutang_id, sched.jumlah_rencana)}
                        className="flex items-center gap-1 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2 cursor-pointer shadow-sm transition-colors"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Bayar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenRecordPayment(sched.hutang_id, sched.jumlah_rencana)}
                      className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 font-bold text-xs px-4 py-2 hover:bg-brand-100 transition-colors cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Bayar Cicilan <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white">
            <TrendingDown className="h-10 w-10 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">Tidak ada jadwal cicilan ditemukan</p>
            <p className="text-[11px] text-slate-400">Seluruh jadwal cicilan dengan status pencarian ini kosong.</p>
          </div>
        )}
      </div>

    </div>
  );
};
