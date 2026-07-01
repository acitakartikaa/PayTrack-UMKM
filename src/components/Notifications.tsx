import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  MessageSquare,
  X
} from 'lucide-react';
import { Notifikasi, HutangKredit } from '../types';

interface NotificationsProps {
  notifications: Notifikasi[];
  hutangs: HutangKredit[];
  onRefresh: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  hutangs,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formDebtId, setFormDebtId] = useState('');
  const [formMsg, setFormMsg] = useState('');

  const db = JSON.parse(localStorage.getItem('paytrack_umkm_relational_db') || '{}');

  const handleMarkAsRead = (id: string) => {
    const data = { ...db };
    data.notifikasi = (data.notifikasi || []).map((n: any) => n.id === id ? { ...n, dibaca: true } : n);
    localStorage.setItem('paytrack_umkm_relational_db', JSON.stringify(data));
    onRefresh();
  };

  const handleMarkAllRead = () => {
    const data = { ...db };
    data.notifikasi = (data.notifikasi || []).map((n: any) => ({ ...n, dibaca: true }));
    localStorage.setItem('paytrack_umkm_relational_db', JSON.stringify(data));
    onRefresh();
  };

  const handleClearAll = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan semua riwayat notifikasi?')) {
      const data = { ...db };
      data.notifikasi = [];
      localStorage.setItem('paytrack_umkm_relational_db', JSON.stringify(data));
      onRefresh();
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMsg) return;

    const data = { ...db };
    const customId = `custom-${Date.now()}`;
    
    data.notifikasi = [
      ...(data.notifikasi || []),
      {
        id: customId,
        hutang_id: formDebtId || 'none',
        tipe: 'H-1', // Default category
        pesan: `[PENGINGAT] ${formMsg}`,
        tanggal_dibuat: '2026-06-29',
        dibaca: false
      }
    ];

    localStorage.setItem('paytrack_umkm_relational_db', JSON.stringify(data));
    onRefresh();
    setFormMsg('');
    setShowAddModal(false);
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.dibaca;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header operations */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 md:text-2xl">Notifikasi & Pengingat</h2>
          <p className="text-xs text-slate-500">Notifikasi otomatis jatuh tempo faktur kredit, denda keterlambatan, dan catatan memo pengingat mandiri.</p>
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <PlusCircle className="h-4 w-4 text-brand-600" /> Buat Pengingat Kustom
          </button>
          
          {notifications.some(n => !n.dibaca) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" /> Tandai Semua Dibaca
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-700 font-bold text-xs px-4 py-2.5 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" /> Kosongkan Notifikasi
            </button>
          )}
        </div>
      </div>

      {/* Filter and stats overview */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
          <button
            onClick={() => setFilter('unread')}
            className={`rounded-lg px-4 py-1.5 font-bold transition-all cursor-pointer ${
              filter === 'unread' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Belum Dibaca ({notifications.filter(n => !n.dibaca).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-1.5 font-bold transition-all cursor-pointer ${
              filter === 'all' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Semua Riwayat ({notifications.length})
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-400">Kalender Sistem: 2026-06-29</span>
      </div>

      {/* Notifications list layout */}
      <div className="space-y-3">
        {filtered.map((n) => {
          const isAuto = n.id.startsWith('auto-');
          const isOverdue = n.tipe === 'terlambat';

          return (
            <div 
              key={n.id} 
              className={`rounded-3xl border p-4.5 flex gap-4 text-xs transition-all bg-white hover:bg-slate-50/50 ${
                !n.dibaca ? 'border-brand-200 bg-brand-50/5/30' : 'border-slate-100'
              }`}
            >
              {/* Alert Indicator */}
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                isOverdue 
                  ? 'bg-rose-100 text-rose-700' 
                  : n.id.startsWith('custom-')
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {isOverdue ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : n.id.startsWith('custom-') ? (
                  <MessageSquare className="h-5 w-5" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
              </div>

              {/* Message text details */}
              <div className="flex-1 text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      isOverdue 
                        ? 'bg-rose-100 text-rose-800' 
                        : n.id.startsWith('custom-')
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isOverdue ? 'Keterlambatan' : isAuto ? `Jatuh Tempo ${n.tipe}` : 'Pengingat Toko'}
                    </span>
                    {!n.dibaca && (
                      <span className="h-2 w-2 rounded-full bg-brand-600"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{n.tanggal_dibuat}</span>
                </div>

                <p className={`font-medium ${!n.dibaca ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                  {n.pesan}
                </p>

                {/* Mark read button */}
                {!n.dibaca && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-[10px] font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all cursor-pointer flex items-center gap-0.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Tandai Sudah Dibaca
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white">
            <Bell className="h-10 w-10 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">Tidak ada notifikasi baru</p>
            <p className="text-[11px] text-slate-400">Semua pemberitahuan pembayaran telah dibaca atau dikosongkan.</p>
          </div>
        )}
      </div>

      {/* Add Custom Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-bold text-slate-900">Buat Catatan Pengingat</h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hubungkan ke Faktur Hutang (Opsional)</label>
                <select
                  value={formDebtId}
                  onChange={(e) => setFormDebtId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-hidden"
                >
                  <option value="">-- Tidak Ada Hubungan Faktur --</option>
                  {hutangs.map(h => (
                    <option key={h.id} value={h.id}>Faktur: {h.nomor_faktur} (Rp {h.jumlah_hutang.toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Isi Pesan Catatan Pengingat</label>
                <textarea
                  value={formMsg}
                  onChange={(e) => setFormMsg(e.target.value)}
                  placeholder="Contoh: Ingatkan menelepon Pak Retno perihal perpanjangan tempo pembayaran CV Maju Jaya..."
                  rows={4}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-hidden resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/10 cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
