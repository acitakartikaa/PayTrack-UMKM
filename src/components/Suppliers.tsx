import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Phone, 
  DollarSign, 
  Award, 
  Edit, 
  Trash2,
  AlertCircle,
  X
} from 'lucide-react';
import { Supplier } from '../types';
import { addSupplier, updateSupplier, deleteSupplier } from '../dbManager';

interface SuppliersProps {
  suppliers: Supplier[];
  userRole: 'admin' | 'owner';
  onRefresh: () => void;
}

export const Suppliers: React.FC<SuppliersProps> = ({
  suppliers,
  userRole,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCreditLimit, setFormCreditLimit] = useState('');
  const [formPriority, setFormPriority] = useState<'tinggi' | 'sedang' | 'rendah'>('sedang');

  // Feedback states
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setFormName('');
    setFormContact('');
    setFormAddress('');
    setFormCreditLimit('');
    setFormPriority('sedang');
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setAlertMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setAlertMsg(null);
    setEditingId(sup.id);
    setFormName(sup.nama_supplier);
    setFormContact(sup.kontak);
    setFormAddress(sup.alamat);
    setFormCreditLimit(sup.batas_kredit.toString());
    setFormPriority(sup.tingkat_prioritas);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formContact) {
      setAlertMsg({ type: 'error', text: 'Nama supplier dan Kontak wajib diisi!' });
      return;
    }

    const limit = parseFloat(formCreditLimit) || 0;
    
    if (editingId) {
      updateSupplier(editingId, {
        nama_supplier: formName,
        kontak: formContact,
        alamat: formAddress,
        batas_kredit: limit,
        tingkat_prioritas: formPriority
      });
      setAlertMsg({ type: 'success', text: 'Supplier berhasil diperbarui!' });
    } else {
      addSupplier({
        nama_supplier: formName,
        kontak: formContact,
        alamat: formAddress,
        batas_kredit: limit,
        tingkat_prioritas: formPriority
      });
      setAlertMsg({ type: 'success', text: 'Supplier baru berhasil ditambahkan!' });
    }

    onRefresh();
    setTimeout(() => {
      setShowModal(false);
      resetForm();
    }, 1000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      const result = deleteSupplier(id);
      if (result.success) {
        setAlertMsg({ type: 'success', text: result.message });
        onRefresh();
      } else {
        setAlertMsg({ type: 'error', text: result.message });
      }
      setTimeout(() => setAlertMsg(null), 5000);
    }
  };

  // Filter & Search logic
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.nama_supplier.toLowerCase().includes(search.toLowerCase()) || 
                          s.alamat.toLowerCase().includes(search.toLowerCase()) ||
                          s.kontak.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterPriority === 'all' || s.tingkat_prioritas === filterPriority;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 md:text-2xl">Data Supplier</h2>
          <p className="text-xs text-slate-500">Kelola dan tinjau kemitraan supplier, batas kredit kredit, dan prioritas bayar.</p>
        </div>

        {/* Add Button - Accessible to Admin and Owner */}
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/15 transition-all hover:bg-brand-700 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Tambah Supplier
        </button>
      </div>

      {/* Global Alerts inside screen */}
      {alertMsg && (
        <div className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-semibold border ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="flex-1">{alertMsg.text}</p>
          <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-slate-900">✕</button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs flex items-center">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama supplier, kontak, atau alamat..."
            className="w-full bg-transparent text-xs text-slate-800 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent font-medium text-slate-700 outline-hidden"
            >
              <option value="all">Semua Prioritas</option>
              <option value="tinggi">Prioritas Tinggi</option>
              <option value="sedang">Prioritas Sedang</option>
              <option value="rendah">Prioritas Rendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map((sup) => (
          <div 
            key={sup.id}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            {/* Upper part */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {sup.nama_supplier}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">ID: {sup.id}</span>
                </div>

                {/* Priority Badge */}
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  sup.tingkat_prioritas === 'tinggi'
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : sup.tingkat_prioritas === 'sedang'
                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                }`}>
                  {sup.tingkat_prioritas}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{sup.kontak || 'Kontak tidak dicantumkan'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{sup.alamat || 'Alamat tidak dicantumkan'}</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                  <DollarSign className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400">Batas Kredit</p>
                    <p className="font-mono font-bold text-slate-800">
                      Rp {sup.batas_kredit.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(sup)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                title="Edit Supplier"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(sup.id)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50/50 text-red-500 transition-all hover:bg-red-100 hover:text-red-700 cursor-pointer"
                title="Hapus Supplier"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredSuppliers.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white">
            <Users className="h-10 w-10 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">Tidak ada supplier ditemukan</p>
            <p className="text-[11px] text-slate-400">Silakan tambahkan data supplier baru atau ubah kata kunci pencarian Anda.</p>
          </div>
        )}
      </div>

      {/* Supplier Modal (Add / Edit Slideover / Centered) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-bold text-slate-900">
                {editingId ? 'Edit Supplier' : 'Tambah Supplier Baru'}
              </h4>
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Supplier / Badan Usaha</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: PT Sumber Sembako Raya"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tingkat Prioritas</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="tinggi">🚨 Tinggi (Stok Utama / Kemitraan Inti)</option>
                    <option value="sedang">⚠️ Sedang (Stok Penunjang)</option>
                    <option value="rendah">💡 Rendah (Stok Alternatif)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Batas Kredit (Rp)</label>
                  <input
                    type="number"
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(e.target.value)}
                    placeholder="Contoh: 30000000"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kontak Person & Nomor HP</label>
                <input
                  type="text"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  placeholder="Contoh: 0812-xxxx-xxxx (Ibu Retno)"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Alamat Kantor / Gudang</label>
                <textarea
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Alamat lengkap supplier..."
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-hidden resize-none"
                />
              </div>

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
                  {editingId ? 'Simpan Perubahan' : 'Tambah Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
