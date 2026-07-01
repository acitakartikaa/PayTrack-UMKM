/**
 * Types and Relational Schemas for PayTrack UMKM
 * SPDX-License-Identifier: Apache-2.0
 */

// 1. Users Table
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'owner'; // Admin Sistem vs Pemilik UMKM
  umkm_id: string | null;  // Foreign Key to UMKM table (null for Admin)
}

// 2. UMKM Table
export interface UMKM {
  id: string;
  nama_umkm: string;
  pemilik_name: string;
  saldo_kas: number;      // Current cash balance
}

// 3. Supplier Table
export interface Supplier {
  id: string;
  nama_supplier: string;
  kontak: string;
  alamat: string;
  batas_kredit: number;
  tingkat_prioritas: 'tinggi' | 'sedang' | 'rendah'; // High, Medium, Low
}

// 4. Hutang Kredit Table
export interface HutangKredit {
  id: string;
  supplier_id: string;     // Foreign Key to Supplier
  nomor_faktur: string;
  jumlah_hutang: number;
  tanggal_transaksi: string; // YYYY-MM-DD
  tanggal_jatuh_tempo: string; // YYYY-MM-DD
  denda_keterlambatan: number;
  status_hutang: 'belum_lunas' | 'lunas' | 'dicicil';
}

// 5. Jadwal Pembayaran Table (Installments / Payment Schedules)
export interface JadwalPembayaran {
  id: string;
  hutang_id: string;       // Foreign Key to HutangKredit
  tanggal_rencana: string;  // YYYY-MM-DD
  jumlah_rencana: number;
  status_rencana: 'belum_dibayar' | 'dibayar';
}

// 6. Prioritas Pembayaran Table (Scoring and suggestions)
export interface PrioritasPembayaran {
  id: string;
  hutang_id: string;       // Foreign Key to HutangKredit
  skor_prioritas: number;  // Combined score (0-100)
  urutan_rekomendasi: number;
}

// 7. Transaksi Pembayaran Table (Realisasi Pembayaran)
export interface TransaksiPembayaran {
  id: string;
  hutang_id: string;       // Foreign Key to HutangKredit
  tanggal_pembayaran: string; // YYYY-MM-DD
  jumlah_pembayaran: number;
  metode_pembayaran: 'tunai' | 'transfer' | 'e-wallet';
  nomor_referensi: string;
  bukti_pembayaran_url: string; // Placeholder or base64 data URL
}

// 8. Notifikasi Table
export interface Notifikasi {
  id: string;
  hutang_id: string;       // Foreign Key to HutangKredit
  tipe: 'H-7' | 'H-3' | 'H-1' | 'hari_H' | 'terlambat';
  pesan: string;
  tanggal_dibuat: string;  // YYYY-MM-DD
  dibaca: boolean;
}

// 9. Laporan Keuangan Table (Cash flow history)
export interface LaporanKeuangan {
  id: string;
  tanggal: string;         // YYYY-MM-DD
  tipe: 'pemasukan' | 'pengeluaran';
  jumlah: number;
  kategori: 'pembayaran_hutang' | 'modal_awal' | 'pendapatan' | 'lainnya';
  keterangan: string;
  referensi_id?: string;   // Optional reference to a payment ID or transaction
}

// Full Relational Database Schema Container
export interface RelationalDatabase {
  users: User[];
  umkm: UMKM[];
  supplier: Supplier[];
  hutang_kredit: HutangKredit[];
  jadwal_pembayaran: JadwalPembayaran[];
  prioritas_pembayaran: PrioritasPembayaran[];
  transaksi_pembayaran: TransaksiPembayaran[];
  notifikasi: Notifikasi[];
  laporan_keuangan: LaporanKeuangan[];
}

// Helper structures for Payment Simulation
export interface SimulasiRekomendasi {
  hutangId: string;
  nomorFaktur: string;
  namaSupplier: string;
  jumlahHutang: number;
  sisaTagihan: number;
  skorPrioritas: number;
  tanggalJatuhTempo: string;
  rekomendasiStatus: 'lunas' | 'cicil' | 'tunda';
  rekomendasiJumlah: number;
}
