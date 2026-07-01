import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Search, 
  DollarSign, 
  User, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Image as ImageIcon,
  Check,
  ExternalLink,
  Printer,
  X,
  Plus
} from 'lucide-react';
import { TransaksiPembayaran, HutangKredit, Supplier } from '../types';
import { recordPayment } from '../dbManager';

interface PaymentsProps {
  payments: TransaksiPembayaran[];
  hutangs: HutangKredit[];
  suppliers: Supplier[];
  preselectedDebtId: string | null;
  preselectedAmount?: number;
  onRefresh: () => void;
  onClosePreselected: () => void;
}

// Preset proofs of payments for instant mock upload
const PAYMENT_PROOFS = [
  { id: 'bca', name: 'M-Transfer BCA', color: 'bg-blue-600', text: 'BUKTI_TRANSFER_BCA_SUCCESS.png' },
  { id: 'mandiri', name: 'Livin Mandiri', color: 'bg-yellow-500', text: 'MANDIRI_LIVIN_TRF_OK.png' },
  { id: 'ovo', name: 'OVO E-Wallet Receipt', color: 'bg-purple-600', text: 'OVO_PAYMENT_SLIP_DONE.png' },
  { id: 'cash', name: 'Kuitansi Tunai', color: 'bg-slate-700', text: 'KUITANSI_TUNAI_MATERAI.png' }
];

export const Payments: React.FC<PaymentsProps> = ({
  payments,
  hutangs,
  suppliers,
  preselectedDebtId,
  preselectedAmount,
  onRefresh,
  onClosePreselected
}) => {
  const [search, setSearch] = useState('');
  
  // Form modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [formDebtId, setFormDebtId] = useState('');
  const [formDate, setFormDate] = useState('2026-06-29');
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState<'tunai' | 'transfer' | 'e-wallet'>('transfer');
  const [formRef, setFormRef] = useState('');
  const [formProof, setFormProof] = useState('placeholder_transfer.png');

  // Selected receipt detail modal
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Auto pre-fill if pre-selected debt is supplied
  useEffect(() => {
    if (preselectedDebtId) {
      setFormDebtId(preselectedDebtId);
      const targetDebt = hutangs.find(h => h.id === preselectedDebtId);
      if (targetDebt) {
        // Find remaining debt to pay (debt + denda - total paid)
        const totalPaidOnDebt = payments
          .filter(p => p.hutang_id === preselectedDebtId)
          .reduce((sum, curr) => sum + curr.jumlah_pembayaran, 0);
        const remaining = targetDebt.jumlah_hutang + targetDebt.denda_keterlambatan - totalPaidOnDebt;
        
        // Use preselectedAmount (e.g. installment schedule amount) if given, else remaining
        setFormAmount(preselectedAmount ? preselectedAmount.toString() : remaining.toString());
      }
      
      // Generate reference number
      setFormRef(`TRF-${Math.floor(Math.random() * 9000000 + 1000000)}`);
      setShowFormModal(true);
    }
  }, [preselectedDebtId, preselectedAmount, hutangs, payments]);

  const handleOpenAdd = () => {
    onClosePreselected();
    const activeDebt = hutangs.find(h => h.status_hutang !== 'lunas');
    setFormDebtId(activeDebt?.id || '');
    setFormAmount('');
    setFormDate('2026-06-29');
    setFormMethod('transfer');
    setFormRef(`TRF-${Math.floor(Math.random() * 9000000 + 1000000)}`);
    setFormProof('placeholder_transfer.png');
    setShowFormModal(true);
  };

  // Adjust prefilled amount when selected invoice changes
  const handleDebtChange = (debtId: string) => {
    setFormDebtId(debtId);
    const targetDebt = hutangs.find(h => h.id === debtId);
    if (targetDebt) {
      const totalPaidOnDebt = payments
        .filter(p => p.hutang_id === debtId)
        .reduce((sum, curr) => sum + curr.jumlah_pembayaran, 0);
      const remaining = targetDebt.jumlah_hutang + targetDebt.denda_keterlambatan - totalPaidOnDebt;
      setFormAmount(remaining.toString());
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount);
    if (!formDebtId || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Pilih invoice dan isi jumlah pembayaran dengan benar!');
      return;
    }

    recordPayment({
      hutang_id: formDebtId,
      tanggal_pembayaran: formDate,
      jumlah_pembayaran: parsedAmount,
      metode_pembayaran: formMethod,
      nomor_referensi: formRef,
      bukti_pembayaran_url: formProof
    });

    onRefresh();
    setShowFormModal(false);
    onClosePreselected();
  };

  // Filter payment timeline list
  const enrichedPayments = payments.map(tr => {
    const h = hutangs.find(hut => hut.id === tr.hutang_id);
    const s = h ? suppliers.find(sup => sup.id === h.supplier_id) : null;
    return {
      ...tr,
      nomorFaktur: h ? h.nomor_faktur : 'Unknown',
      supplierName: s ? s.nama_supplier : 'Supplier Unknown'
    };
  }).sort((a, b) => b.tanggal_pembayaran.localeCompare(a.tanggal_pembayaran));

  const filteredPayments = enrichedPayments.filter(p => {
    return p.nomorFaktur.toLowerCase().includes(search.toLowerCase()) ||
           p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
           p.nomor_referensi.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header and Add action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 md:text-2xl">Realisasi Pembayaran</h2>
          <p className="text-xs text-slate-500">Rekam realisasi transaksi, unggah bukti bayar bank, dan buat kuitansi digital.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/15 transition-all hover:bg-brand-700 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Catat Realisasi Baru
        </button>
      </div>

      {/* Filter and search timeline */}
      <div className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs flex items-center">
        <Search className="h-4 w-4 text-slate-400 mr-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari transaksi berdasarkan nomor faktur, supplier, atau kode referensi..."
          className="w-full bg-transparent text-xs text-slate-800 outline-hidden"
        />
      </div>

      {/* Payments History log table */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Tanggal Pembayaran</th>
                <th className="px-6 py-4">Supplier & Faktur</th>
                <th className="px-6 py-4">Jumlah Terbayar</th>
                <th className="px-6 py-4">Metode & Referensi</th>
                <th className="px-6 py-4">Bukti & Dokumen</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-medium">{p.tanggal_pembayaran}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-900">{p.supplierName}</p>
                      <p className="text-[10px] font-mono text-slate-400">Faktur: {p.nomorFaktur}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-900">
                    Rp {p.jumlah_pembayaran.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        p.metode_pembayaran === 'transfer' 
                          ? 'bg-blue-50 text-blue-700' 
                          : p.metode_pembayaran === 'e-wallet'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.metode_pembayaran}
                      </span>
                      <p className="mt-1 text-[10px] font-mono text-slate-400">{p.nomor_referensi}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-bold transition-all cursor-pointer"
                    >
                      <ImageIcon className="h-4 w-4" /> Lihat Bukti
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      title="Cetak Kuitansi"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <CreditCard className="h-10 w-10 text-slate-300" />
                      <p className="text-xs font-bold text-slate-700">Belum ada realisasi pembayaran dicatat</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Record Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-bold text-slate-900">Catat Realisasi Pembayaran</h4>
              <button 
                onClick={() => {
                  setShowFormModal(false);
                  onClosePreselected();
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pilih Faktur Kredit Aktif</label>
                <select
                  value={formDebtId}
                  onChange={(e) => handleDebtChange(e.target.value)}
                  disabled={!!preselectedDebtId}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-hidden"
                >
                  <option value="" disabled>-- Pilih Faktur Hutang --</option>
                  {hutangs.filter(h => h.status_hutang !== 'lunas').map(h => {
                    const s = suppliers.find(sup => sup.id === h.supplier_id);
                    return (
                      <option key={h.id} value={h.id}>
                        {s ? s.nama_supplier : 'Supplier'} - {h.nomor_faktur} (Sisa: Rp {(h.jumlah_hutang + h.denda_keterlambatan).toLocaleString('id-ID')})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tanggal Bayar</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Jumlah Dana Dibayarkan (Rp)</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Metode Pembayaran</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="transfer">🏦 Transfer Bank</option>
                    <option value="e-wallet">📱 E-Wallet (OVO/Gopay/DANA)</option>
                    <option value="tunai">💵 Kas Tunai</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nomor Referensi / ID Transaksi</label>
                  <input
                    type="text"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    placeholder="Contoh: TRF-928131"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              {/* Advanced proof of payment preset picker */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">Pilih Bukti Slip Pembayaran Instan (Mock Uploader)</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_PROOFS.map((proof) => (
                    <button
                      key={proof.id}
                      type="button"
                      onClick={() => setFormProof(proof.text)}
                      className={`rounded-2xl border p-3 flex items-center justify-between transition-all cursor-pointer text-left ${
                        formProof === proof.text
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold truncate">{proof.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono truncate">{proof.text}</p>
                      </div>
                      {formProof === proof.text && (
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    onClosePreselected();
                  }}
                  className="w-full rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/10 cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Receipt Detail Printable Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-display text-base font-bold text-slate-900">Salinan Kuitansi Digital</h4>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Receipt area */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 text-xs font-mono text-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-2 rotate-45 bg-emerald-500 text-white font-sans text-[8px] font-bold uppercase tracking-wider py-1 px-8 text-center shadow-xs">
                PAID
              </div>

              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                <h5 className="font-sans text-sm font-bold text-slate-900">KUITANSI PEMBAYARAN</h5>
                <p className="text-[10px] text-slate-400">PAYTRACK • SEMBAKO BERKAH BUDI</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>No. Transaksi</span>
                  <span className="font-bold text-slate-950">{selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal Bayar</span>
                  <span className="font-bold text-slate-950">{selectedReceipt.tanggal_pembayaran}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Referensi</span>
                  <span className="font-bold text-slate-950">{selectedReceipt.nomor_referensi}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode</span>
                  <span className="font-bold text-slate-950 uppercase">{selectedReceipt.metode_pembayaran}</span>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-300">
                  <div className="flex justify-between">
                    <span>Penerima</span>
                    <span className="font-bold text-slate-950 truncate max-w-[180px]">{selectedReceipt.supplierName}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>No. Faktur</span>
                    <span className="font-bold text-slate-950">{selectedReceipt.nomorFaktur}</span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-double border-slate-300 flex justify-between items-center">
                  <span className="font-sans font-bold text-slate-900">TOTAL BAYAR</span>
                  <span className="text-sm font-bold text-emerald-600 font-mono">
                    Rp {selectedReceipt.jumlah_pembayaran.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Proof Attachment Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 font-sans">
                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-brand-500" /> Lampiran Slip Bukti Bank
                </p>
                <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white text-[10px] font-bold">
                    PNG
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-slate-800 truncate">{selectedReceipt.bukti_pembayaran_url}</p>
                    <p className="text-[8px] text-slate-400 font-mono">Verified Security Token</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => alert('Simulator: Mencetak salinan kuitansi fisik...')}
                className="w-full rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Cetak Salinan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
