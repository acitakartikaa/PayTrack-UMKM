/**
 * Relational Database Manager for PayTrack UMKM
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  RelationalDatabase, 
  User, 
  UMKM, 
  Supplier, 
  HutangKredit, 
  JadwalPembayaran, 
  PrioritasPembayaran, 
  TransaksiPembayaran, 
  Notifikasi, 
  LaporanKeuangan,
  SimulasiRekomendasi
} from './types';

const STORAGE_KEY = 'paytrack_umkm_relational_db';

// Simple function to generate UUID-like string
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

// Default Seed Data
const defaultDatabase: RelationalDatabase = {
  users: [
    {
      id: 'usr-1',
      username: 'budi',
      name: 'Budi Santoso',
      role: 'owner',
      umkm_id: 'umkm-1'
    },
    {
      id: 'usr-2',
      username: 'admin',
      name: 'Dewi Lestari',
      role: 'admin',
      umkm_id: null
    }
  ],
  umkm: [
    {
      id: 'umkm-1',
      nama_umkm: 'Sembako Berkah Budi',
      pemilik_name: 'Budi Santoso',
      saldo_kas: 35000000 // Rp 35.000.000
    }
  ],
  supplier: [
    {
      id: 'sup-1',
      nama_supplier: 'CV Maju Jaya Sembako',
      kontak: '0812-3456-7890 (Pak Bambang)',
      alamat: 'Jl. Industri No. 12, Surabaya',
      batas_kredit: 50000000, // Rp 50.000.000
      tingkat_prioritas: 'tinggi'
    },
    {
      id: 'sup-2',
      nama_supplier: 'PT Indofood Distribusi',
      kontak: '0821-9876-5432 (Bu Retno)',
      alamat: 'Kawasan Rungkut Industri, Surabaya',
      batas_kredit: 30000000, // Rp 30.000.000
      tingkat_prioritas: 'sedang'
    },
    {
      id: 'sup-3',
      nama_supplier: 'UD Berkah Tani Sayur',
      kontak: '0857-1111-2222 (Kang Maman)',
      alamat: 'Pasar Wonokromo Stan No. 45, Surabaya',
      batas_kredit: 10000000, // Rp 10.000.000
      tingkat_prioritas: 'rendah'
    },
    {
      id: 'sup-4',
      nama_supplier: 'Koperasi Susu Sejahtera',
      kontak: '0819-8888-9999 (Pak Haji)',
      alamat: 'Jl. Raya Batu No. 7, Malang',
      batas_kredit: 20000000, // Rp 20.000.000
      tingkat_prioritas: 'tinggi'
    }
  ],
  hutang_kredit: [
    {
      id: 'htg-1',
      supplier_id: 'sup-1',
      nomor_faktur: 'FACT-20260601-01',
      jumlah_hutang: 15000000, // Rp 15.000.000
      tanggal_transaksi: '2026-06-15',
      tanggal_jatuh_tempo: '2026-07-06', // H-7 from 2026-06-29
      denda_keterlambatan: 0,
      status_hutang: 'belum_lunas'
    },
    {
      id: 'htg-2',
      supplier_id: 'sup-2',
      nomor_faktur: 'FACT-20260605-22',
      jumlah_hutang: 8000000, // Rp 8.000.000
      tanggal_transaksi: '2026-06-20',
      tanggal_jatuh_tempo: '2026-07-02', // H-3 from 2026-06-29
      denda_keterlambatan: 0,
      status_hutang: 'dicicil'
    },
    {
      id: 'htg-3',
      supplier_id: 'sup-3',
      nomor_faktur: 'FACT-20260520-09',
      jumlah_hutang: 4500000, // Rp 4.500.000
      tanggal_transaksi: '2026-05-20',
      tanggal_jatuh_tempo: '2026-06-20', // Overdue since 9 days ago
      denda_keterlambatan: 225000, // Rp 225.000
      status_hutang: 'belum_lunas'
    },
    {
      id: 'htg-4',
      supplier_id: 'sup-4',
      nomor_faktur: 'FACT-20260610-15',
      jumlah_hutang: 5000000, // Rp 5.000.000
      tanggal_transaksi: '2026-06-10',
      tanggal_jatuh_tempo: '2026-06-30', // H-1 from 2026-06-29
      denda_keterlambatan: 0,
      status_hutang: 'belum_lunas'
    },
    {
      id: 'htg-5',
      supplier_id: 'sup-1',
      nomor_faktur: 'FACT-20260612-45',
      jumlah_hutang: 12000000, // Rp 12.000.000
      tanggal_transaksi: '2026-06-12',
      tanggal_jatuh_tempo: '2026-06-29', // TODAY! (Hari H)
      denda_keterlambatan: 0,
      status_hutang: 'belum_lunas'
    }
  ],
  jadwal_pembayaran: [
    // Schedules for CV Maju Jaya (FACT-20260601-01) - 2 Installments
    {
      id: 'jdw-1',
      hutang_id: 'htg-1',
      tanggal_rencana: '2026-06-30',
      jumlah_rencana: 7500000,
      status_rencana: 'belum_dibayar'
    },
    {
      id: 'jdw-2',
      hutang_id: 'htg-1',
      tanggal_rencana: '2026-07-06',
      jumlah_rencana: 7500000,
      status_rencana: 'belum_dibayar'
    },
    // Schedules for PT Indofood (FACT-20260605-22) - 4 Installments, 2 paid
    {
      id: 'jdw-3',
      hutang_id: 'htg-2',
      tanggal_rencana: '2026-06-22',
      jumlah_rencana: 2000000,
      status_rencana: 'dibayar'
    },
    {
      id: 'jdw-4',
      hutang_id: 'htg-2',
      tanggal_rencana: '2026-06-26',
      jumlah_rencana: 2000000,
      status_rencana: 'dibayar'
    },
    {
      id: 'jdw-5',
      hutang_id: 'htg-2',
      tanggal_rencana: '2026-06-29',
      jumlah_rencana: 2000000,
      status_rencana: 'belum_dibayar'
    },
    {
      id: 'jdw-6',
      hutang_id: 'htg-2',
      tanggal_rencana: '2026-07-02',
      jumlah_rencana: 2000000,
      status_rencana: 'belum_dibayar'
    },
    // Schedule for UD Berkah Tani
    {
      id: 'jdw-7',
      hutang_id: 'htg-3',
      tanggal_rencana: '2026-06-20',
      jumlah_rencana: 4500000,
      status_rencana: 'belum_dibayar'
    }
  ],
  transaksi_pembayaran: [
    // Realized payments for PT Indofood (FACT-20260605-22)
    {
      id: 'tr-1',
      hutang_id: 'htg-2',
      tanggal_pembayaran: '2026-06-22',
      jumlah_pembayaran: 2000000,
      metode_pembayaran: 'transfer',
      nomor_referensi: 'TRF-9823102-ID',
      bukti_pembayaran_url: 'placeholder_transfer.png'
    },
    {
      id: 'tr-2',
      hutang_id: 'htg-2',
      tanggal_pembayaran: '2026-06-26',
      jumlah_pembayaran: 2000000,
      metode_pembayaran: 'e-wallet',
      nomor_referensi: 'OVO-441129-IDX',
      bukti_pembayaran_url: 'placeholder_ewallet.png'
    }
  ],
  prioritas_pembayaran: [],
  notifikasi: [],
  laporan_keuangan: [
    {
      id: 'lap-1',
      tanggal: '2026-06-01',
      tipe: 'pemasukan',
      jumlah: 50000000,
      kategori: 'modal_awal',
      keterangan: 'Setoran modal awal usaha Sembako Berkah Budi'
    },
    {
      id: 'lap-2',
      tanggal: '2026-06-10',
      tipe: 'pengeluaran',
      jumlah: 11000000,
      kategori: 'lainnya',
      keterangan: 'Pembelian perlengkapan toko & rak etalase'
    },
    {
      id: 'lap-3',
      tanggal: '2026-06-22',
      tipe: 'pengeluaran',
      jumlah: 2000000,
      kategori: 'pembayaran_hutang',
      keterangan: 'Pembayaran cicilan 1 faktur FACT-20260605-22 ke PT Indofood Distribusi',
      referensi_id: 'tr-1'
    },
    {
      id: 'lap-4',
      tanggal: '2026-06-26',
      tipe: 'pengeluaran',
      jumlah: 2000000,
      kategori: 'pembayaran_hutang',
      keterangan: 'Pembayaran cicilan 2 faktur FACT-20260605-22 ke PT Indofood Distribusi',
      referensi_id: 'tr-2'
    }
  ]
};

// Initialize the database
export function getDb(): RelationalDatabase {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Initialise with seed data, compute priorities and notifications, then save
    const db = { ...defaultDatabase };
    recalculatePrioritiesInternal(db);
    generateNotificationsInternal(db, '2026-06-29'); // Base date
    saveDb(db);
    return db;
  }
  
  try {
    const db = JSON.parse(data) as RelationalDatabase;
    // Always make sure priorities and notifications are up-to-date
    recalculatePrioritiesInternal(db);
    return db;
  } catch (e) {
    console.error('Error parsing database, resetting to default', e);
    return defaultDatabase;
  }
}

export function saveDb(db: RelationalDatabase): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// -------------------------------------------------------------
// CORE CALCULATIONS: PRIORITY SCORING SYSTEM
// -------------------------------------------------------------
// Weights:
// 1. Jatuh Tempo (40%)
// 2. Denda Keterlambatan (35%)
// 3. Tingkat Prioritas Supplier (25%)
//
// Let's implement this robustly based on system date or selected date (Default 2026-06-29)
export function calculatePriorityScore(
  hutang: HutangKredit,
  supplier: Supplier,
  todayStr: string = '2026-06-29'
): number {
  const today = new Date(todayStr);
  const due = new Date(hutang.tanggal_jatuh_tempo);
  
  // Calculate difference in days
  const timeDiff = due.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  // 1. Jatuh Tempo Score (40% Weight)
  let jatuhTempoScore = 0;
  if (daysRemaining <= 0) {
    // Overdue or due today
    jatuhTempoScore = 100;
  } else if (daysRemaining <= 7) {
    // Imminent: H-1 to H-7 gets high score (95 down to 50)
    jatuhTempoScore = 100 - (daysRemaining * 7);
  } else if (daysRemaining <= 30) {
    // H-8 to H-30 gets medium-low score (50 down to 15)
    jatuhTempoScore = 50 - ((daysRemaining - 7) * 1.5);
  } else {
    // More than 30 days gets a minimum score
    jatuhTempoScore = 10;
  }
  jatuhTempoScore = Math.max(0, Math.min(100, jatuhTempoScore));

  // 2. Denda Keterlambatan Score (35% Weight)
  // Scoring is based on whether there is already a denda or if it is overdue
  let dendaScore = 0;
  if (hutang.denda_keterlambatan > 0) {
    // Active penalty fee is very urgent
    // Calculate ratio of penalty to the total debt
    const dendaRatio = hutang.denda_keterlambatan / hutang.jumlah_hutang;
    dendaScore = Math.min(100, 70 + (dendaRatio * 1000)); // Base 70 + scaled penalty impact
  } else if (daysRemaining < 0) {
    // Overdue but denda not yet recorded
    dendaScore = 80;
  } else if (daysRemaining === 0) {
    // Due today
    dendaScore = 50;
  } else if (daysRemaining <= 3) {
    // Approaching due date
    dendaScore = 25;
  } else {
    dendaScore = 0;
  }
  dendaScore = Math.max(0, Math.min(100, dendaScore));

  // 3. Supplier Priority Score (25% Weight)
  let supplierScore = 30; // Rendah
  if (supplier.tingkat_prioritas === 'tinggi') {
    supplierScore = 100;
  } else if (supplier.tingkat_prioritas === 'sedang') {
    supplierScore = 65;
  }

  // Calculate Weighted Score
  const totalScore = (jatuhTempoScore * 0.40) + (dendaScore * 0.35) + (supplierScore * 0.25);
  return Math.round(totalScore * 10) / 10; // Round to 1 decimal place
}

// Internal function to recalculate the prioritas_pembayaran table
function recalculatePrioritiesInternal(db: RelationalDatabase, todayStr: string = '2026-06-29'): void {
  const activeDebts = db.hutang_kredit.filter(h => h.status_hutang !== 'lunas');
  
  const scores = activeDebts.map(hutang => {
    const supplier = db.supplier.find(s => s.id === hutang.supplier_id);
    const score = supplier ? calculatePriorityScore(hutang, supplier, todayStr) : 0;
    return {
      hutang_id: hutang.id,
      score
    };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Map to prioritas_pembayaran
  db.prioritas_pembayaran = scores.map((item, index) => ({
    id: `pr-${generateId()}`,
    hutang_id: item.hutang_id,
    skor_prioritas: item.score,
    urutan_rekomendasi: index + 1
  }));
}

export function forceRecalculatePriorities(todayStr: string = '2026-06-29'): void {
  const db = getDb();
  recalculatePrioritiesInternal(db, todayStr);
  saveDb(db);
}

// -------------------------------------------------------------
// AUTOMATIC NOTIFICATION GENERATION
// -------------------------------------------------------------
// Scans active debts and generates notifications for:
// - H-7, H-3, H-1, Hari H, and Terlambat (Overdue)
export function generateNotificationsInternal(db: RelationalDatabase, todayStr: string = '2026-06-29'): void {
  const today = new Date(todayStr);
  const activeDebts = db.hutang_kredit.filter(h => h.status_hutang !== 'lunas');
  
  // Clear existing automatic notifications to avoid duplicates, or keep custom ones and rebuild
  // Let's filter out older notifications and re-generate to avoid spam
  db.notifikasi = db.notifikasi.filter(n => n.id.startsWith('custom-')); 

  activeDebts.forEach(hutang => {
    const supplier = db.supplier.find(s => s.id === hutang.supplier_id);
    if (!supplier) return;

    const due = new Date(hutang.tanggal_jatuh_tempo);
    const timeDiff = due.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let tipe: 'H-7' | 'H-3' | 'H-1' | 'hari_H' | 'terlambat' | null = null;
    let pesan = '';

    if (daysRemaining === 7) {
      tipe = 'H-7';
      pesan = `Hutang Rp ${hutang.jumlah_hutang.toLocaleString('id-ID')} (Faktur: ${hutang.nomor_faktur}) kepada ${supplier.nama_supplier} akan jatuh tempo dalam 7 hari.`;
    } else if (daysRemaining === 3) {
      tipe = 'H-3';
      pesan = `Hutang Rp ${hutang.jumlah_hutang.toLocaleString('id-ID')} (Faktur: ${hutang.nomor_faktur}) kepada ${supplier.nama_supplier} akan jatuh tempo dalam 3 hari. Segera siapkan saldo kas!`;
    } else if (daysRemaining === 1) {
      tipe = 'H-1';
      pesan = `PENTING: Hutang Rp ${hutang.jumlah_hutang.toLocaleString('id-ID')} (Faktur: ${hutang.nomor_faktur}) kepada ${supplier.nama_supplier} akan jatuh tempo BESOK.`;
    } else if (daysRemaining === 0) {
      tipe = 'hari_H';
      pesan = `HARI INI JATUH TEMPO! Segera lunasi hutang Rp ${hutang.jumlah_hutang.toLocaleString('id-ID')} (Faktur: ${hutang.nomor_faktur}) kepada ${supplier.nama_supplier}.`;
    } else if (daysRemaining < 0) {
      tipe = 'terlambat';
      const absDays = Math.abs(daysRemaining);
      pesan = `TERLAMBAT ${absDays} HARI! Hutang kepada ${supplier.nama_supplier} senilai Rp ${hutang.jumlah_hutang.toLocaleString('id-ID')} (Faktur: ${hutang.nomor_faktur}) telah melewati jatuh tempo. Denda aktif: Rp ${hutang.denda_keterlambatan.toLocaleString('id-ID')}.`;
    }

    if (tipe) {
      db.notifikasi.push({
        id: `auto-${hutang.id}-${tipe}`,
        hutang_id: hutang.id,
        tipe,
        pesan,
        tanggal_dibuat: todayStr,
        dibaca: false
      });
    }
  });
}

// -------------------------------------------------------------
// PAYMENT SIMULATION ALGORITHM
// -------------------------------------------------------------
// Provides recommendations based on cash balance input
export function runPaymentSimulation(cashInput: number, todayStr: string = '2026-06-29'): SimulasiRekomendasi[] {
  const db = getDb();
  
  // Get active unpaid debts
  const activeDebts = db.hutang_kredit.filter(h => h.status_hutang !== 'lunas');
  
  // Gather with details and scores
  const debtDetails = activeDebts.map(hutang => {
    const supplier = db.supplier.find(s => s.id === hutang.supplier_id);
    const scoreObj = db.prioritas_pembayaran.find(p => p.hutang_id === hutang.id);
    const score = scoreObj ? scoreObj.skor_prioritas : (supplier ? calculatePriorityScore(hutang, supplier, todayStr) : 0);
    
    // Calculate paid amount so far from transactions
    const totalPaid = db.transaksi_pembayaran
      .filter(t => t.hutang_id === hutang.id)
      .reduce((sum, curr) => sum + curr.jumlah_pembayaran, 0);

    const sisaTagihan = hutang.jumlah_hutang + hutang.denda_keterlambatan - totalPaid;

    return {
      hutang,
      supplierName: supplier ? supplier.nama_supplier : 'Supplier Tidak Diketahui',
      sisaTagihan,
      skorPrioritas: score
    };
  });

  // Sort by priority score DESC
  debtDetails.sort((a, b) => b.skorPrioritas - a.skorPrioritas);

  let remainingCash = cashInput;
  const recommendations: SimulasiRekomendasi[] = [];

  debtDetails.forEach(item => {
    const h = item.hutang;
    
    if (remainingCash <= 0) {
      // Out of cash
      recommendations.push({
        hutangId: h.id,
        nomorFaktur: h.nomor_faktur,
        namaSupplier: item.supplierName,
        jumlahHutang: h.jumlah_hutang + h.denda_keterlambatan,
        sisaTagihan: item.sisaTagihan,
        skorPrioritas: item.skorPrioritas,
        tanggalJatuhTempo: h.tanggal_jatuh_tempo,
        rekomendasiStatus: 'tunda',
        rekomendasiJumlah: 0
      });
    } else if (remainingCash >= item.sisaTagihan) {
      // Can afford full payment
      remainingCash -= item.sisaTagihan;
      recommendations.push({
        hutangId: h.id,
        nomorFaktur: h.nomor_faktur,
        namaSupplier: item.supplierName,
        jumlahHutang: h.jumlah_hutang + h.denda_keterlambatan,
        sisaTagihan: item.sisaTagihan,
        skorPrioritas: item.skorPrioritas,
        tanggalJatuhTempo: h.tanggal_jatuh_tempo,
        rekomendasiStatus: 'lunas',
        rekomendasiJumlah: item.sisaTagihan
      });
    } else {
      // Partial payment / installment recommendation
      // If we can pay a decent chunk (e.g. at least 25% or whatever is left)
      const payAmount = remainingCash;
      remainingCash = 0;
      recommendations.push({
        hutangId: h.id,
        nomorFaktur: h.nomor_faktur,
        namaSupplier: item.supplierName,
        jumlahHutang: h.jumlah_hutang + h.denda_keterlambatan,
        sisaTagihan: item.sisaTagihan,
        skorPrioritas: item.skorPrioritas,
        tanggalJatuhTempo: h.tanggal_jatuh_tempo,
        rekomendasiStatus: 'cicil',
        rekomendasiJumlah: payAmount
      });
    }
  });

  return recommendations;
}

// -------------------------------------------------------------
// RELATION INTEGRITY CRUD OPERATIONS
// -------------------------------------------------------------

// SUPPLIER CRUD
export function getSuppliers(): Supplier[] {
  return getDb().supplier;
}

export function addSupplier(supplier: Omit<Supplier, 'id'>): Supplier {
  const db = getDb();
  const newSup: Supplier = {
    ...supplier,
    id: `sup-${generateId()}`
  };
  db.supplier.push(newSup);
  saveDb(db);
  return newSup;
}

export function updateSupplier(id: string, updated: Omit<Supplier, 'id'>): void {
  const db = getDb();
  db.supplier = db.supplier.map(s => s.id === id ? { ...s, ...updated } : s);
  saveDb(db);
}

export function deleteSupplier(id: string): { success: boolean; message: string } {
  const db = getDb();
  // Check foreign key constraint: any active debts referencing this supplier?
  const hasDebts = db.hutang_kredit.some(h => h.supplier_id === id);
  if (hasDebts) {
    return { 
      success: false, 
      message: 'Tidak dapat menghapus supplier ini karena masih memiliki keterkaitan data hutang kredit aktif.' 
    };
  }
  db.supplier = db.supplier.filter(s => s.id !== id);
  saveDb(db);
  return { success: true, message: 'Supplier berhasil dihapus.' };
}


// HUTANG CRUD
export function getHutangs(): HutangKredit[] {
  return getDb().hutang_kredit;
}

export function addHutang(hutang: Omit<HutangKredit, 'id' | 'denda_keterlambatan' | 'status_hutang'>, numInstallments: number = 1): HutangKredit {
  const db = getDb();
  const id = `htg-${generateId()}`;
  const newHutang: HutangKredit = {
    ...hutang,
    id,
    denda_keterlambatan: 0,
    status_hutang: 'belum_lunas'
  };
  db.hutang_kredit.push(newHutang);

  // Automatically create Jadwal Pembayaran installments
  const installmentAmount = Math.round(hutang.jumlah_hutang / numInstallments);
  const baseDueDate = new Date(hutang.tanggal_jatuh_tempo);
  const baseStartDate = new Date(hutang.tanggal_transaksi);
  const timeDiff = baseDueDate.getTime() - baseStartDate.getTime();
  const dayStep = numInstallments > 1 ? Math.floor(timeDiff / (numInstallments - 1)) : 0;

  for (let i = 0; i < numInstallments; i++) {
    const renDate = new Date(baseStartDate.getTime() + (dayStep * i));
    const finalAmount = i === numInstallments - 1 
      ? hutang.jumlah_hutang - (installmentAmount * (numInstallments - 1)) // Prevent rounding errors on last schedule
      : installmentAmount;

    db.jadwal_pembayaran.push({
      id: `jdw-${generateId()}`,
      hutang_id: id,
      tanggal_rencana: renDate.toISOString().split('T')[0],
      jumlah_rencana: finalAmount,
      status_rencana: 'belum_dibayar'
    });
  }

  recalculatePrioritiesInternal(db);
  generateNotificationsInternal(db);
  saveDb(db);
  return newHutang;
}

export function updateHutang(id: string, updated: Partial<HutangKredit>): void {
  const db = getDb();
  db.hutang_kredit = db.hutang_kredit.map(h => {
    if (h.id === id) {
      const merged = { ...h, ...updated };
      return merged;
    }
    return h;
  });
  recalculatePrioritiesInternal(db);
  generateNotificationsInternal(db);
  saveDb(db);
}

export function deleteHutang(id: string): void {
  const db = getDb();
  // Relational Cascade Delete
  db.hutang_kredit = db.hutang_kredit.filter(h => h.id !== id);
  db.jadwal_pembayaran = db.jadwal_pembayaran.filter(j => j.hutang_id !== id);
  db.transaksi_pembayaran = db.transaksi_pembayaran.filter(t => t.hutang_id !== id);
  db.prioritas_pembayaran = db.prioritas_pembayaran.filter(p => p.hutang_id !== id);
  db.notifikasi = db.notifikasi.filter(n => n.hutang_id !== id);
  recalculatePrioritiesInternal(db);
  saveDb(db);
}


// PAYMENT REALIZATION (PENCATATAN TRANSAKSI PEMBAYARAN)
export function recordPayment(
  payment: Omit<TransaksiPembayaran, 'id'>,
  todayStr: string = '2026-06-29'
): TransaksiPembayaran {
  const db = getDb();
  const trId = `tr-${generateId()}`;
  const newPayment: TransaksiPembayaran = {
    ...payment,
    id: trId
  };
  
  // Save Transaction
  db.transaksi_pembayaran.push(newPayment);

  // Update UMKM Cash Balance (Saldo Kas)
  const umkm = db.umkm[0];
  if (umkm) {
    umkm.saldo_kas -= payment.jumlah_pembayaran;
  }

  // Create Laporan Keuangan entry for cash flow tracker
  const hutang = db.hutang_kredit.find(h => h.id === payment.hutang_id);
  const supplier = hutang ? db.supplier.find(s => s.id === hutang.supplier_id) : null;
  const supplierLabel = supplier ? supplier.nama_supplier : '';
  const fakturLabel = hutang ? hutang.nomor_faktur : '';

  db.laporan_keuangan.push({
    id: `lap-${generateId()}`,
    tanggal: payment.tanggal_pembayaran,
    tipe: 'pengeluaran',
    jumlah: payment.jumlah_pembayaran,
    kategori: 'pembayaran_hutang',
    keterangan: `Pembayaran hutang kepada ${supplierLabel} (${fakturLabel}) melalui ${payment.metode_pembayaran.toUpperCase()}`,
    referensi_id: trId
  });

  // Automatically update the payment schedules (JadwalPembayaran)
  // Find unpaid schedules for this debt, sort by date, mark them paid up to the payment amount
  let remainingPayment = payment.jumlah_pembayaran;
  const schedules = db.jadwal_pembayaran
    .filter(j => j.hutang_id === payment.hutang_id && j.status_rencana === 'belum_dibayar')
    .sort((a, b) => a.tanggal_rencana.localeCompare(b.tanggal_rencana));

  for (const sched of schedules) {
    if (remainingPayment >= sched.jumlah_rencana) {
      sched.status_rencana = 'dibayar';
      remainingPayment -= sched.jumlah_rencana;
    } else {
      // Partially paid installment could be modeled, but for ease, we can split
      // or reduce. Let's just say if remaining is greater than 0, we can subtract it
      // and keep scheduling simple.
      break;
    }
  }

  // Recalculate total payments made for this debt
  const totalPaid = db.transaksi_pembayaran
    .filter(t => t.hutang_id === payment.hutang_id)
    .reduce((sum, curr) => sum + curr.jumlah_pembayaran, 0);

  if (hutang) {
    const totalDue = hutang.jumlah_hutang + hutang.denda_keterlambatan;
    if (totalPaid >= totalDue) {
      hutang.status_hutang = 'lunas';
    } else if (totalPaid > 0) {
      hutang.status_hutang = 'dicicil';
    }
  }

  recalculatePrioritiesInternal(db, todayStr);
  generateNotificationsInternal(db, todayStr);
  saveDb(db);
  return newPayment;
}

// CASH MANAGEMENT OPERATIONS (PENAMBAHAN KAS, DLL)
export function addCash(amount: number, category: string, remarks: string, dateStr: string = '2026-06-29'): void {
  const db = getDb();
  const umkm = db.umkm[0];
  if (umkm) {
    umkm.saldo_kas += amount;
  }

  db.laporan_keuangan.push({
    id: `lap-${generateId()}`,
    tanggal: dateStr,
    tipe: 'pemasukan',
    jumlah: amount,
    kategori: category as any,
    keterangan: remarks
  });

  saveDb(db);
}

// REPORTS BUILDERS
export interface ReportsData {
  summary: {
    totalHutangAktif: number;
    hutangAkanJatuhTempo: number; // H-7 down to today
    hutangTerlambat: number;
    saldoKas: number;
    totalTerbayar: number;
  };
  riwayatPembayaran: (TransaksiPembayaran & { nomorFaktur: string; supplierName: string })[];
  rekapPerSupplier: {
    supplierId: string;
    namaSupplier: string;
    jumlahHutang: number;
    terbayar: number;
    belumDibayar: number;
    tingkatPrioritas: 'tinggi' | 'sedang' | 'rendah';
  }[];
  hutangTerlambatList: (HutangKredit & { supplierName: string; hariKeterlambatan: number })[];
}

export function getReportsData(todayStr: string = '2026-06-29'): ReportsData {
  const db = getDb();
  const today = new Date(todayStr);

  const activeDebts = db.hutang_kredit.filter(h => h.status_hutang !== 'lunas');
  
  let totalHutangAktif = 0;
  let hutangAkanJatuhTempo = 0;
  let hutangTerlambat = 0;

  activeDebts.forEach(h => {
    const due = new Date(h.tanggal_jatuh_tempo);
    const timeDiff = due.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Remaining unpaid part of this debt
    const totalPaidOnDebt = db.transaksi_pembayaran
      .filter(t => t.hutang_id === h.id)
      .reduce((s, curr) => s + curr.jumlah_pembayaran, 0);
    const remainingDebt = (h.jumlah_hutang + h.denda_keterlambatan) - totalPaidOnDebt;

    totalHutangAktif += remainingDebt;

    if (daysRemaining < 0) {
      hutangTerlambat += remainingDebt;
    } else if (daysRemaining <= 7) {
      hutangAkanJatuhTempo += remainingDebt;
    }
  });

  // Total Paid historically
  const totalTerbayar = db.transaksi_pembayaran.reduce((sum, curr) => sum + curr.jumlah_pembayaran, 0);

  // Riwayat Pembayaran with meta
  const riwayatPembayaran = db.transaksi_pembayaran.map(tr => {
    const h = db.hutang_kredit.find(hut => hut.id === tr.hutang_id);
    const s = h ? db.supplier.find(sup => sup.id === h.supplier_id) : null;
    return {
      ...tr,
      nomorFaktur: h ? h.nomor_faktur : 'Unknown',
      supplierName: s ? s.nama_supplier : 'Supplier Unknown'
    };
  }).sort((a, b) => b.tanggal_pembayaran.localeCompare(a.tanggal_pembayaran));

  // Rekap per Supplier
  const rekapPerSupplier = db.supplier.map(sup => {
    const debts = db.hutang_kredit.filter(h => h.supplier_id === sup.id);
    let totalHutang = 0;
    let terbayar = 0;

    debts.forEach(d => {
      totalHutang += d.jumlah_hutang + d.denda_keterlambatan;
      
      const paidOnDebt = db.transaksi_pembayaran
        .filter(t => t.hutang_id === d.id)
        .reduce((s, curr) => s + curr.jumlah_pembayaran, 0);
      terbayar += paidOnDebt;
    });

    return {
      supplierId: sup.id,
      namaSupplier: sup.nama_supplier,
      jumlahHutang: totalHutang,
      terbayar,
      belumDibayar: totalHutang - terbayar,
      tingkatPrioritas: sup.tingkat_prioritas
    };
  });

  // Overdue Debts list
  const hutangTerlambatList = activeDebts.filter(h => {
    const due = new Date(h.tanggal_jatuh_tempo);
    const daysRemaining = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining < 0;
  }).map(h => {
    const s = db.supplier.find(sup => sup.id === h.supplier_id);
    const due = new Date(h.tanggal_jatuh_tempo);
    const daysOverdue = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return {
      ...h,
      supplierName: s ? s.nama_supplier : 'Unknown',
      hariKeterlambatan: daysOverdue
    };
  }).sort((a, b) => b.hariKeterlambatan - a.hariKeterlambatan);

  return {
    summary: {
      totalHutangAktif,
      hutangAkanJatuhTempo,
      hutangTerlambat,
      saldoKas: db.umkm[0]?.saldo_kas || 0,
      totalTerbayar
    },
    riwayatPembayaran,
    rekapPerSupplier,
    hutangTerlambatList
  };
}

// ADMIN USERS MANAGEMENT
export function getUsers(): User[] {
  return getDb().users;
}

export function addUser(user: Omit<User, 'id'>): User {
  const db = getDb();
  const newUser: User = {
    ...user,
    id: `usr-${generateId()}`
  };
  db.users.push(newUser);
  saveDb(db);
  return newUser;
}

export function deleteUser(id: string): { success: boolean; message: string } {
  const db = getDb();
  if (id === 'usr-1' || id === 'usr-2') {
    return { success: false, message: 'Tidak dapat menghapus akun bawaan sistem.' };
  }
  db.users = db.users.filter(u => u.id !== id);
  saveDb(db);
  return { success: true, message: 'User berhasil dihapus.' };
}
