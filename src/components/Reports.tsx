import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Users, 
  ChevronRight, 
  Printer, 
  Search,
  CheckCircle2,
  Filter,
  DollarSign
} from 'lucide-react';
import { getReportsData, ReportsData } from '../dbManager';
import { Supplier, HutangKredit } from '../types';

interface ReportsProps {
  suppliers: Supplier[];
  hutangs: HutangKredit[];
  onRefresh: () => void;
}

export const Reports: React.FC<ReportsProps> = ({
  suppliers,
  hutangs,
  onRefresh
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'ringkasan' | 'riwayat' | 'supplier' | 'terlambat'>('ringkasan');
  const [supplierSearch, setSupplierSearch] = useState('');
  
  // Pull data from reports builder
  const data: ReportsData = getReportsData();
  const summary = data.summary;

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header operations */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 md:text-2xl">Laporan Hutang & Pembayaran</h2>
          <p className="text-xs text-slate-500">Analisis keuangan komprehensif, total hutang per supplier, riwayat pembayaran, serta denda keterlambatan.</p>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap rounded-xl bg-slate-100 p-1">
          {['ringkasan', 'riwayat', 'supplier', 'terlambat'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveReportTab(tab as any)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer capitalize ${
                activeReportTab === tab 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'terlambat' ? 'Hutang Terlambat' : tab === 'supplier' ? 'Rekap Supplier' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER REPORT TABS */}
      
      {/* TAB 1: RINGKASAN HUTANG */}
      {activeReportTab === 'ringkasan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* KPI Cards inside reports */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs text-left">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Kredit Terbayar</span>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="mt-4 font-mono text-2xl font-bold text-slate-900">
                Rp {summary.totalTerbayar.toLocaleString('id-ID')}
              </h3>
              <p className="mt-1.5 text-[11px] font-semibold text-emerald-600">Pelunasan Kumulatif Terdaftar</p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs text-left">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Hutang Aktif Terutang</span>
                <TrendingUp className="h-5 w-5 text-brand-500" />
              </div>
              <h3 className="mt-4 font-mono text-2xl font-bold text-slate-900">
                Rp {summary.totalHutangAktif.toLocaleString('id-ID')}
              </h3>
              <p className="mt-1.5 text-[11px] font-semibold text-slate-500">Saldo Kredit Berjalan Saat Ini</p>
            </div>

            <div className="rounded-3xl border border-rose-100 bg-rose-50/25 p-6 shadow-xs text-left">
              <div className="flex items-center justify-between text-rose-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Denda Keterlambatan</span>
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              </div>
              <h3 className="mt-4 font-mono text-2xl font-bold text-rose-700">
                Rp {hutangs.reduce((sum, h) => sum + h.denda_keterlambatan, 0).toLocaleString('id-ID')}
              </h3>
              <p className="mt-1.5 text-[11px] font-semibold text-rose-600">Beban Denda Berjalan</p>
            </div>

          </div>

          {/* Quick analysis summary graph list */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-display text-base font-bold text-slate-950">Statistik Portofolio Hutang</h3>
              <p className="text-xs text-slate-500">Rasio alokasi kredit berdasarkan tingkat kepatuhan.</p>
            </div>

            <div className="space-y-4">
              {/* Overdue Ratio */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="font-semibold">Hutang Melewati Jatuh Tempo (Terlambat)</span>
                  <span className="font-mono font-bold text-rose-600">
                    Rp {summary.hutangTerlambat.toLocaleString('id-ID')} ({summary.totalHutangAktif > 0 ? Math.round((summary.hutangTerlambat / summary.totalHutangAktif) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${summary.totalHutangAktif > 0 ? (summary.hutangTerlambat / summary.totalHutangAktif) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Imminent Due Ratio */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="font-semibold">Hutang Segera Jatuh Tempo (H-7)</span>
                  <span className="font-mono font-bold text-amber-600">
                    Rp {summary.hutangAkanJatuhTempo.toLocaleString('id-ID')} ({summary.totalHutangAktif > 0 ? Math.round((summary.hutangAkanJatuhTempo / summary.totalHutangAktif) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${summary.totalHutangAktif > 0 ? (summary.hutangAkanJatuhTempo / summary.totalHutangAktif) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Safe Debt Ratio */}
              {(() => {
                const safeAmt = Math.max(0, summary.totalHutangAktif - summary.hutangTerlambat - summary.hutangAkanJatuhTempo);
                return (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span className="font-semibold">Hutang Berjangka Aman (Tenor &gt; 7 Hari)</span>
                      <span className="font-mono font-bold text-emerald-600">
                        Rp {safeAmt.toLocaleString('id-ID')} ({summary.totalHutangAktif > 0 ? Math.round((safeAmt / summary.totalHutangAktif) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${summary.totalHutangAktif > 0 ? (safeAmt / summary.totalHutangAktif) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT PEMBAYARAN */}
      {activeReportTab === 'riwayat' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              placeholder="Cari riwayat pembayaran berdasarkan nama supplier atau nomor referensi..."
              className="w-full bg-transparent text-xs text-slate-800 outline-hidden"
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tanggal Pembayaran</th>
                    <th className="px-6 py-4">Supplier Mitra</th>
                    <th className="px-6 py-4">No. Faktur</th>
                    <th className="px-6 py-4">Metode Bayar</th>
                    <th className="px-6 py-4 font-mono">Kode Referensi</th>
                    <th className="px-6 py-4 text-right">Jumlah Pelunasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.riwayatPembayaran
                    .filter(tr => tr.supplierName.toLowerCase().includes(supplierSearch.toLowerCase()) || tr.nomor_referensi.toLowerCase().includes(supplierSearch.toLowerCase()))
                    .map((tr) => (
                      <tr key={tr.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-mono">{tr.tanggal_pembayaran}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{tr.supplierName}</td>
                        <td className="px-6 py-4 font-mono text-slate-500">{tr.nomorFaktur}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize font-semibold text-slate-600">{tr.metode_pembayaran}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400">{tr.nomor_referensi}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-right text-emerald-600">
                          Rp {tr.jumlah_pembayaran.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}

                  {data.riwayatPembayaran.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Belum ada riwayat transaksi pembayaran dicatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REKAP HUTANG PER SUPPLIER */}
      {activeReportTab === 'supplier' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              placeholder="Cari nama supplier..."
              className="w-full bg-transparent text-xs text-slate-800 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {data.rekapPerSupplier
              .filter(s => s.namaSupplier.toLowerCase().includes(supplierSearch.toLowerCase()))
              .map((sup) => {
                const totalDebt = sup.jumlahHutang;
                const paid = sup.terbayar;
                const balance = sup.belumDibayar;
                const paidPercent = totalDebt > 0 ? Math.round((paid / totalDebt) * 100) : 0;

                return (
                  <div key={sup.supplierId} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md transition-shadow text-left space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-display text-sm font-bold text-slate-900">{sup.namaSupplier}</h4>
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                          Prioritas: {sup.tingkatPrioritas}
                        </span>
                      </div>

                      <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">Rekap Kredit</span>
                    </div>

                    {/* Progress tracking */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-medium text-slate-500">
                        <span>Rasio Pembayaran Kredit</span>
                        <span className="font-mono">{paidPercent}% Terbayar</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${paidPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-50 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Total Invoice</p>
                        <p className="font-mono font-bold text-slate-800">Rp {totalDebt.toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Telah Dibayar</p>
                        <p className="font-mono font-bold text-emerald-600">Rp {paid.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-semibold">Sisa Hutang</p>
                        <p className="font-mono font-bold text-brand-600">Rp {balance.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: DAFTAR HUTANG YANG TERLAMBAT */}
      {activeReportTab === 'terlambat' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-5 space-y-2">
            <h4 className="font-display text-sm font-bold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-600" /> Detektor Keterlambatan Jatuh Tempo
            </h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              Berikut adalah daftar tagihan kredit aktif yang telah melewati masa tenggang pembayaran akhir. Segera lakukan pelunasan untuk menghentikan denda harian supplier yang terus bertambah.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Faktur & Supplier</th>
                    <th className="px-6 py-4">Batas Jatuh Tempo</th>
                    <th className="px-6 py-4">Jumlah Hari Late</th>
                    <th className="px-6 py-4">Hutang Pokok</th>
                    <th className="px-6 py-4 text-rose-700">Denda Keterlambatan</th>
                    <th className="px-6 py-4 text-right">Total Tagihan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.hutangTerlambatList.map((h) => (
                    <tr key={h.id} className="hover:bg-rose-50/5/30 transition-colors bg-rose-50/5">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{h.supplierName}</p>
                          <p className="text-[10px] font-mono text-slate-400">Faktur: {h.nomor_faktur}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold">{h.tanggal_jatuh_tempo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-rose-600 font-bold">
                        🚨 {h.hariKeterlambatan} Hari Terlambat
                      </td>
                      <td className="px-6 py-4 font-mono">Rp {h.jumlah_hutang.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 font-mono text-rose-600 font-semibold">Rp {h.denda_keterlambatan.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-right text-rose-700">
                        Rp {(h.jumlah_hutang + h.denda_keterlambatan).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}

                  {data.hutangTerlambatList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        🎉 Luar biasa! Tidak ada data hutang kredit yang terlambat melewati jatuh tempo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
