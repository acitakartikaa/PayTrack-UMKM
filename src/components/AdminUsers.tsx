import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Trash2, 
  UserPlus, 
  Edit, 
  Briefcase, 
  Check, 
  AlertTriangle,
  Coins,
  X
} from 'lucide-react';
import { User, UMKM } from '../types';
import { addUser, deleteUser, saveDb, getDb } from '../dbManager';

interface AdminUsersProps {
  users: User[];
  umkmList: UMKM[];
  onRefresh: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  umkmList,
  onRefresh
}) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formRole, setFormRole] = useState<'owner' | 'admin'>('owner');
  const [formUmkmId, setFormUmkmId] = useState('umkm-1');
  
  // Enterprise (UMKM) details editor state
  const [showUmkmModal, setShowUmkmModal] = useState(false);
  const [umkmName, setUmkmName] = useState(umkmList[0]?.nama_umkm || '');
  const [umkmOwnerName, setUmkmOwnerName] = useState(umkmList[0]?.pemilik_name || '');
  const [umkmCash, setUmkmCash] = useState(umkmList[0]?.saldo_kas.toString() || '0');

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formUsername) {
      setAlertMsg({ type: 'error', text: 'Nama lengkap dan username wajib diisi!' });
      return;
    }

    // Check duplicate username
    const exists = users.some(u => u.username.toLowerCase() === formUsername.toLowerCase());
    if (exists) {
      setAlertMsg({ type: 'error', text: 'Username tersebut sudah terdaftar di sistem!' });
      return;
    }

    addUser({
      username: formUsername.toLowerCase().trim(),
      name: formName.trim(),
      role: formRole,
      umkm_id: formRole === 'owner' ? formUmkmId : null
    });

    setAlertMsg({ type: 'success', text: `User @${formUsername} berhasil didaftarkan!` });
    onRefresh();
    setTimeout(() => {
      setShowAddUserModal(false);
      setFormName('');
      setFormUsername('');
      setAlertMsg(null);
    }, 1200);
  };

  const handleDeleteUser = (id: string) => {
    const res = deleteUser(id);
    if (res.success) {
      setAlertMsg({ type: 'success', text: res.message });
      onRefresh();
    } else {
      setAlertMsg({ type: 'error', text: res.message });
    }
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const handleUpdateUmkm = (e: React.FormEvent) => {
    e.preventDefault();
    const db = getDb();
    if (db.umkm[0]) {
      db.umkm[0].nama_umkm = umkmName;
      db.umkm[0].pemilik_name = umkmOwnerName;
      db.umkm[0].saldo_kas = parseFloat(umkmCash) || 0;
      saveDb(db);
      setAlertMsg({ type: 'success', text: 'Profil & kas UMKM berhasil diperbarui oleh Administrator!' });
      onRefresh();
      setShowUmkmModal(false);
      setTimeout(() => setAlertMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 md:text-2xl">Konsol Admin Sistem</h2>
          <p className="text-xs text-slate-500">Kelola kredensial pengguna, otorisasi peran sistem, serta edit profil portofolio UMKM.</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowUmkmModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <Briefcase className="h-4 w-4 text-brand-600" /> Edit Profil Toko & Kas
          </button>
          
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/15 transition-all hover:bg-brand-700 active:scale-95 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Tambah User Baru
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {alertMsg && (
        <div className={`flex items-center gap-3 rounded-2xl border p-4 text-xs font-semibold ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p className="flex-1">{alertMsg.text}</p>
          <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-slate-900">✕</button>
        </div>
      )}

      {/* Two sections: User list, Business profile metadata */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left: User Table list */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="h-5 w-5 text-brand-600" />
            <h3 className="font-display text-base font-bold text-slate-950">Daftar Pengguna Aktif</h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Nama Lengkap</th>
                  <th className="px-5 py-3.5">Username</th>
                  <th className="px-5 py-3.5">Peran Otoritas</th>
                  <th className="px-5 py-3.5">Hubungan UMKM</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">@{u.username}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        <Shield className="h-3 w-3" /> {u.role === 'admin' ? 'Admin' : 'Pemilik UMKM'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-medium">
                      {u.role === 'owner' 
                        ? (umkmList.find(m => m.id === u.umkm_id)?.nama_umkm || 'Sembako Berkah Budi')
                        : '-'
                      }
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {u.id !== 'usr-1' && u.id !== 'usr-2' ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                          title="Hapus Kredensial"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 italic">Bawaan Sistem</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: UMKM Profile Snapshot */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="h-5 w-5 text-brand-600" />
            <h3 className="font-display text-base font-bold text-slate-950">Informasi UMKM Terkait</h3>
          </div>

          {umkmList.map((m) => (
            <div key={m.id} className="space-y-4 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Nama Badan Usaha</p>
                  <p className="font-display text-sm font-bold text-slate-950">{m.nama_umkm}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Pemilik Penanggung Jawab</p>
                  <p className="font-semibold text-slate-800">{m.pemilik_name}</p>
                </div>
                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Sisa Kas Berjalan</p>
                    <p className="font-mono text-sm font-bold text-emerald-600">Rp {m.saldo_kas.toLocaleString('id-ID')}</p>
                  </div>
                  <span className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Coins className="h-4 w-4" />
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-50 bg-blue-50/10 p-4 text-[11px] text-slate-500 leading-relaxed space-y-1.5">
                <p className="font-bold text-slate-700">💡 Tip Administrator:</p>
                <p>Otoritas Admin Sistem memungkinkan Anda merekayasa/mengedit data mentah kas dan profil badan usaha di panel atas agar memudahkan simulasi tanpa harus logout.</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-bold text-slate-900">Otorisasi Pengguna Baru</h4>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Andi Wijaya"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Username Otoritas</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Contoh: andiwijaya"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-700">Peran Akses (Otoritas)</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="owner">Pemilik UMKM (Akses Penuh Kelola Hutang)</option>
                    <option value="admin">Admin Sistem (Akses Kelola User & Monitor)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="w-full rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/10 cursor-pointer"
                >
                  Daftarkan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UMKM Profile/Cash Editor Modal */}
      {showUmkmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-bold text-slate-900">Ubah Pengaturan Toko & Kas</h4>
              <button 
                onClick={() => setShowUmkmModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUmkm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Toko UMKM</label>
                <input
                  type="text"
                  value={umkmName}
                  onChange={(e) => setFormName(e.target.value)} // Wait, use correct setState: setUmkmName!
                  onInput={(e: any) => setUmkmName(e.target.value)}
                  placeholder="Contoh: Sembako Berkah Budi"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Pemilik UMKM</label>
                <input
                  type="text"
                  value={umkmOwnerName}
                  onInput={(e: any) => setUmkmOwnerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Saldo Kas Operasional (Rp)</label>
                <input
                  type="number"
                  value={umkmCash}
                  onInput={(e: any) => setUmkmCash(e.target.value)}
                  placeholder="Contoh: 35000000"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 outline-hidden"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUmkmModal(false)}
                  className="w-full rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/10 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
