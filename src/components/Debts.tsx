import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Edit, 
  Trash2, 
  CreditCard,
  PlusCircle,
  X
} from 'lucide-react';
import { HutangKredit, Supplier } from '../types';
import { addHutang, updateHutang, deleteHutang } from '../dbManager';

interface DebtsProps {
  hutangs: HutangKredit[];
  suppliers: Supplier[];
  onRefresh: () => void;
  onOpenRecordPayment: (debtId: string) => void;
}

export const Debts: React.FC<DebtsProps> = ({
  hutangs,
  suppliers,
  onRefresh,
  onOpenRecordPayment
}) => {
  const [search, setSearch] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formFaktur, setFormFaktur] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formTxDate, setFormTxDate] = useState('2026-06-29');
  const [formDueDate, setFormDueDate] = useState('2026-07-29');
  const [formInstallments, setFormInstallments] = useState('1'); // How many installments to split into

  // Denda state (Only used when editing existing debt)
  const [formDenda, setFormDenda] = useState('0');
  const [formStatus, setFormStatus] = useState<'belum_lunas' | 'lunas' | 'dicicil'>('belum_lunas');

  const [alertError, setAlertError] = useState<string | null>(null);

  // Load localStorage database to calculate progress for each debt
  const db = JSON.parse(localStorage.getItem('paytrack_umkm_relational_db') || '{}');
  const paymentTransactions = db.transaksi_pembayaran || [];

  const resetForm = () => {
    setFormSupplierId(suppliers[0]?.id || '');
    setFormFaktur('');
    setFormAmount('');
    setFormTxDate('2026-06-29');
    setFormDueDate('2026-07-29');
    setFormInstallments('1');
    setFormDenda('0');
    setFormStatus('belum_lunas');
    setEditingId(null);
    setAlertError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (h: HutangKredit) => {
    setAlertError(null);
    setEditingId(h.id);
    setFormSupplierId(h.supplier_id);
    setFormFaktur(h.nomor_faktur);
    setFormAmount(h.jumlah_hutang.toString());
    setFormTxDate(h.tanggal_transaksi);
    setFormDueDate(h.tanggal_jatuh_tempo);
    setFormDenda(h.denda_keterlambatan.toString());
    setFormStatus(h.status_hutang);
    setFormInstallments('1'); // Non-editable during standard edit, since schedules are already set
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplierId) {
      setAlertError('Silakan pilih supplier terlebih dahulu!');
      return;
    }
    if (!formFaktur) {
      setAlertError('Nomor faktur wajib diisi!');
      return;
    }
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      setAlertError('Jumlah hutang harus berupa angka positif!');
      return;
    }

    const txDate = new Date(formTxDate);
    const dueDate = new Date(formDueDate);
    if (dueDate < txDate) {
      setAlertError('Tanggal jatuh tempo tidak boleh mendahului tanggal transaksi!');
      return;
    }

    if (editingId) {
      updateHutang(editingId, {
        supplier_id: formSupplierId,
        nomor_faktur: formFaktur,
        jumlah_hutang: amount,
        tanggal_transaksi: formTxDate,
        tanggal_jatuh_tempo: formDueDate,
        denda_keterlambatan: parseFloat(formDenda) || 0,
        status_hutang: formStatus
      });
    } else {
      const installments = parseInt(formInstallments) || 1;
      addHutang({
        supplier_id: formSupplierId,
        nomor_faktur: formFaktur,
        jumlah_hutang: amount,
        tanggal_transaksi: formTxDate,
        tanggal_jatuh_tempo: formDueDate
      }, installments);
    }

    onRefresh();
    setShowModal(false);
    resetForm();
  };

  const handleDeleteDebt = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan hutang ini? Semua jadwal pembayaran dan riwayat pembayaran terkait akan ikut terhapus secara permanen (Cascade Delete).')) {
      deleteHutang(id);
      onRefresh();
    }
  };

  // Calculations per debt
  const getDebtProgress = (h: HutangKredit) => {
    const totalPaid = paymentTransactions
      .filter((t: any) => t.hutang_id === h.id)
      .reduce((sum: number, curr: any) => sum + curr.jumlah_pembayaran, 0);
    const totalDebt = h.jumlah_hutang + h.denda_keterlambatan;
    const percent = totalDebt > 0 ? Math.min(100, Math.round((totalPaid / totalDebt) * 100)) : 0;
    return {
      totalPaid,
      percent,
      remaining: Math.max(0, totalDebt - totalPaid)
    };
  };

  // Filtering & searching
  const filteredHutangs = hutangs.filter(h => {
    const supplier = suppliers.find(s => s.id === h.supplier_id);
    const matchesSearch = h.nomor_faktur.toLowerCase().includes(search.toLowerCase()) ||
                          (supplier && supplier.nama_supplier.toLowerCase().includes(search.toLowerCase()));
    const matchesSupplier = filterSupplier === 'all' || h.supplier_id === filterSupplier;
    const matchesStatus = filterStatus === 'all' || h.status_hutang === filterStatus;
    return matchesSearch && matchesSupplier && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Upper header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 md:text-2xl">Catatan Hutang Kredit</h2>
          <p className="text-xs text-slate-500">Rekam, pantau denda keterlambatan, dan rancang cicilan untuk setiap invoice kredit.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/15 transition-all hover:bg-brand-700 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Catat Hutang Baru
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs flex items-center">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor faktur atau nama supplier..."
            className="w-full bg-transparent text-xs text-slate-800 outline-hidden"
          />
        </div>

        {/* Option selectors */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Supplier selector */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400 font-semibold">Supplier:</span>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="bg-transparent font-medium text-slate-700 outline-hidden"
            >
              <option value="all">Semua</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.nama_supplier}</option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent font-medium text-slate-700 outline-hidden"
            >
              <option value="all">Semua</option>
              <option value="belum_lunas">Belum Lunas</option>
              <option value="dicicil">Dicicil</option>
              <option value="lunas">Lunas</option>
            </select>
          </div>

        </div>
      </div>

      {/* Debts Table / Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredHutangs.map((h) => {
          const s = suppliers.find(sup => sup.id === h.supplier_id);
          const progress = getDebtProgress(h);
          
          return (
            <div 
              key={h.id}
              className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Upper row */}
                <div className="flex items-start justify-between">
                  <div className="text-left">
                    <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-bold text-slate-600">
                      Faktur: {h.nomor_faktur}
                    </span>
                    <h3 className="mt-2 font-display text-sm font-bold text-slate-900 leading-tight">
                      {s ? s.nama_supplier : 'Supplier Terhapus'}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    h.status_hutang === 'lunas'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : h.status_hutang === 'dicicil'
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {h.status_hutang.replace('_', ' ')}
                  </span>
                </div>

                {/* Pricing / Finance overview */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 text-left">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400">Hutang Pokok</p>
                    <p className="font-mono text-xs font-bold text-slate-800">
                      Rp {h.jumlah_hutang.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400">Denda</p>
                    <p className={`font-mono text-xs font-bold ${h.denda_keterlambatan > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      Rp {h.denda_keterlambatan.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-slate-400">Sisa Tagihan</p>
                    <p className="font-mono text-xs font-bold text-brand-600">
                      Rp {progress.remaining.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between text-[10px] font-medium text-slate-500">
                    <span>Kemajuan Pembayaran</span>
                    <span className="font-mono">{progress.percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${h.status_hutang === 'lunas' ? 'bg-emerald-500' : 'bg-brand-500'}`} 
                      style={{ width: `${progress.percent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Date constraints */}
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Transaksi: {h.tanggal_transaksi}</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-600"><Clock className="h-3 w-3 text-brand-500" /> Jatuh Tempo: {h.tanggal_jatuh_tempo}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                {/* Left: Quick Realize Payment Button */}
                {h.status_hutang !== 'lunas' ? (
                  <button
                    onClick={() => onOpenRecordPayment(h.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 cursor-pointer transition-all shadow-xs"
                  >
                    <CreditCard className="h-3.5 w-3.5" /> Catat Bayar
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Pembayaran Lunas
                  </span>
                )}

                {/* Right: edit & delete */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(h)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                    title="Edit Faktur"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDebt(h.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50/50 text-red-500 transition-all hover:bg-red-100 hover:text-red-700 cursor-pointer"
                    title="Hapus Faktur"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filteredHutangs.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white">
            <FileText className="h-10 w-10 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">Tidak ada data hutang ditemukan</p>
            <p className="text-[11px] text-slate-400">Silakan catat data kredit baru dengan menekan tombol kanan atas.</p>
          </div>
        )}
      </div>

      {/* Debt CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-bold text-slate-900">
                {editingId ? 'Edit Catatan Hutang' : 'Catat Hutang Kredit Baru'}
              </h4>
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {alertError && (
              <p className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {alertError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pilih Supplier Mitra</label>
                <select
                  value={formSupplierId}
                  onChange={(e) => setFormSupplierId(e.target.value)}
                  disabled={!!editingId}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-hidden"
                >
                  <option value="" disabled>-- Pilih Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.nama_supplier} (Prioritas: {s.tingkat_prioritas})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nomor Faktur / Invoice</label>
                  <input
                    type="text"
                    value={formFaktur}
                    onChange={(e) => setFormFaktur(e.target.value)}
                    placeholder="Contoh: INV/2026/01/009"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Jumlah Hutang Pokok (Rp)</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="Contoh: 10000000"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tanggal Transaksi / Beli</label>
                  <input
                    type="date"
                    value={formTxDate}
                    onChange={(e) => setFormTxDate(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tanggal Jatuh Tempo Akhir</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              {editingId ? (
                /* Editing layout allows managing Denda and Status explicitly */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-3 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-rose-700">Denda Keterlambatan (Rp)</label>
                    <input
                      type="number"
                      value={formDenda}
                      onChange={(e) => setFormDenda(e.target.value)}
                      placeholder="Contoh: 150000"
                      className="w-full rounded-2xl border border-rose-200 bg-rose-50/20 px-4 py-3 text-sm font-mono text-rose-800 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Status Pembayaran</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-hidden"
                    >
                      <option value="belum_lunas">Belum Lunas</option>
                      <option value="dicicil">Dicicil</option>
                      <option value="lunas">Lunas</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* Creating layout allows setting up scheduled installment plans */
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700">Pembayaran Secara Cicilan (Jadwal Otomatis)</label>
                  <div className="flex gap-4">
                    {['1', '2', '3', '4'].map((num) => (
                      <label 
                        key={num} 
                        className={`flex-1 rounded-2xl border p-3.5 flex flex-col items-center justify-center cursor-pointer text-center transition-all ${
                          formInstallments === num 
                            ? 'bg-brand-50 border-brand-500 text-brand-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="formInstallments"
                          value={num}
                          checked={formInstallments === num}
                          onChange={(e) => setFormInstallments(e.target.value)}
                          className="sr-only"
                        />
                        <span className="font-mono text-sm font-bold">{num}x</span>
                        <span className="text-[10px] mt-0.5">Cicilan</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic leading-snug">
                    *Aplikasi akan membagi jumlah hutang pokok secara merata ke dalam {formInstallments} jadwal pembayaran cicilan dengan interval waktu berimbang otomatis.
                  </p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/10 cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Catat Hutang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
