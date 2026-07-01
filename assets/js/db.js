/**
 * Central LocalStorage Database Manager for PayTrack UMKM
 * Handles all CRUD operations, relations, automatic denda, priority calculations, and payment simulations.
 */

const STORAGE_KEY = 'paytrack_umkm_vanilla_db';
const AUTH_KEY = 'paytrack_umkm_auth_user';

// Simple helper to generate ID
function generateId() {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

// Seed Data
const defaultDatabase = {
  users: [
    { id: 'usr-1', username: 'budi', name: 'Budi Santoso', role: 'owner', password: '123' },
    { id: 'usr-2', username: 'admin', name: 'Dewi Lestari', role: 'admin', password: '123' }
  ],
  umkm: {
    nama_umkm: 'Sembako Berkah Budi',
    pemilik_name: 'Budi Santoso',
    saldo_kas: 35000000 // Rp 35.000.000
  },
  supplier: [
    {
      id: 'sup-1',
      nama_supplier: 'CV Maju Jaya Sembako',
      kontak: '0812-3456-7890 (Pak Bambang)',
      alamat: 'Jl. Industri No. 12, Surabaya',
      batas_kredit: 50000000,
      tingkat_prioritas: 'tinggi'
    },
    {
      id: 'sup-2',
      nama_supplier: 'PT Indofood Distribusi',
      kontak: '0821-9876-5432 (Bu Retno)',
      alamat: 'Kawasan Rungkut Industri, Surabaya',
      batas_kredit: 30000000,
      tingkat_prioritas: 'sedang'
    },
    {
      id: 'sup-3',
      nama_supplier: 'UD Berkah Tani Sayur',
      kontak: '0857-1111-2222 (Kang Maman)',
      alamat: 'Pasar Wonokromo Stan No. 45, Surabaya',
      batas_kredit: 10000000,
      tingkat_prioritas: 'rendah'
    },
    {
      id: 'sup-4',
      nama_supplier: 'Koperasi Susu Sejahtera',
      kontak: '0819-8888-9999 (Pak Haji)',
      alamat: 'Jl. Raya Batu No. 7, Malang',
      batas_kredit: 20000000,
      tingkat_prioritas: 'tinggi'
    }
  ],
  hutang_kredit: [
    {
      id: 'htg-1',
      supplier_id: 'sup-1',
      nomor_faktur: 'FACT-20260601-01',
      jumlah_hutang: 15000000,
      tanggal_transaksi: '2026-06-15',
      tanggal_jatuh_tempo: '2026-07-06', // H-7 from today (2026-06-29)
      denda_keterlambatan: 0,
      status_hutang: 'belum_lunas'
    },
    {
      id: 'htg-2',
      supplier_id: 'sup-2',
      nomor_faktur: 'FACT-20260605-22',
      jumlah_hutang: 8000000,
      tanggal_transaksi: '2026-06-20',
      tanggal_jatuh_tempo: '2026-07-02', // H-3
      denda_keterlambatan: 0,
      status_hutang: 'dicicil'
    },
    {
      id: 'htg-3',
      supplier_id: 'sup-3',
      nomor_faktur: 'FACT-20260520-09',
      jumlah_hutang: 4500000,
      tanggal_transaksi: '2026-05-20',
      tanggal_jatuh_tempo: '2026-06-20', // Overdue
      denda_keterlambatan: 225000,
      status_hutang: 'belum_lunas'
    },
    {
      id: 'htg-4',
      supplier_id: 'sup-4',
      nomor_faktur: 'FACT-20260610-15',
      jumlah_hutang: 5000000,
      tanggal_transaksi: '2026-06-10',
      tanggal_jatuh_tempo: '2026-06-30', // H-1
      denda_keterlambatan: 0,
      status_hutang: 'belum_lunas'
    },
    {
      id: 'htg-5',
      supplier_id: 'sup-1',
      nomor_faktur: 'FACT-20260612-45',
      jumlah_hutang: 12000000,
      tanggal_transaksi: '2026-06-12',
      tanggal_jatuh_tempo: '2026-06-29', // TODAY!
      denda_keterlambatan: 0,
      status_hutang: 'belum_lunas'
    }
  ],
  jadwal_pembayaran: [
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
    {
      id: 'jdw-7',
      hutang_id: 'htg-3',
      tanggal_rencana: '2026-06-20',
      jumlah_rencana: 4500000,
      status_rencana: 'belum_dibayar'
    }
  ],
  transaksi_pembayaran: [
    {
      id: 'tr-1',
      hutang_id: 'htg-2',
      tanggal_pembayaran: '2026-06-22',
      jumlah_pembayaran: 2000000,
      metode_pembayaran: 'transfer',
      nomor_referensi: 'TRF-9823102-ID',
      bukti_pembayaran_url: ''
    },
    {
      id: 'tr-2',
      hutang_id: 'htg-2',
      tanggal_pembayaran: '2026-06-26',
      jumlah_pembayaran: 2000000,
      metode_pembayaran: 'e-wallet',
      nomor_referensi: 'OVO-441129-IDX',
      bukti_pembayaran_url: ''
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

// Main DB Accessors
function getDb() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const db = JSON.parse(JSON.stringify(defaultDatabase));
    recalculatePrioritiesInternal(db);
    generateNotificationsInternal(db);
    saveDb(db);
    return db;
  }
  try {
    const db = JSON.parse(data);
    // Backward compatibility or auto compute priorities on access
    recalculatePrioritiesInternal(db);
    return db;
  } catch (e) {
    console.error('Failed to parse db, resetting to default', e);
    return JSON.parse(JSON.stringify(defaultDatabase));
  }
}

function saveDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function resetDb() {
  localStorage.removeItem(STORAGE_KEY);
  return getDb();
}

// Auth Helper
function loginUser(username, password) {
  const db = getDb();
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false, message: 'Username atau password salah!' };
}

function getLoggedInUser() {
  const userStr = localStorage.getItem(AUTH_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
}

// Recalculate Priorities Internal
function recalculatePrioritiesInternal(db, todayStr = '2026-06-29') {
  const activeDebts = db.hutang_kredit.filter(h => h.status_hutang !== 'lunas');
  const scores = activeDebts.map(hutang => {
    const supplier = db.supplier.find(s => s.id === hutang.supplier_id);
    const score = supplier ? calculatePriorityScore(hutang, supplier, todayStr) : 0;
    return { hutang_id: hutang.id, score };
  });

  scores.sort((a, b) => b.score - a.score);

  db.prioritas_pembayaran = scores.map((item, index) => ({
    id: `pr-${generateId()}`,
    hutang_id: item.hutang_id,
    skor_prioritas: item.score,
    urutan_rekomendasi: index + 1
  }));
}

// Calculates dynamic score based on weightings
function calculatePriorityScore(hutang, supplier, todayStr = '2026-06-29') {
  const today = new Date(todayStr);
  const due = new Date(hutang.tanggal_jatuh_tempo);
  const timeDiff = due.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // 1. Jatuh Tempo (40% Weight)
  let jatuhTempoScore = 0;
  if (daysRemaining <= 0) {
    jatuhTempoScore = 100;
  } else if (daysRemaining <= 7) {
    jatuhTempoScore = 100 - (daysRemaining * 7);
  } else if (daysRemaining <= 30) {
    jatuhTempoScore = 50 - ((daysRemaining - 7) * 1.5);
  } else {
    jatuhTempoScore = 10;
  }
  jatuhTempoScore = Math.max(0, Math.min(100, jatuhTempoScore));

  // 2. Denda (35% Weight)
  let dendaScore = 0;
  if (hutang.denda_keterlambatan > 0) {
    const dendaRatio = hutang.denda_keterlambatan / hutang.jumlah_hutang;
    dendaScore = Math.min(100, 70 + (dendaRatio * 1000));
  } else if (daysRemaining < 0) {
    dendaScore = 80;
  } else if (daysRemaining === 0) {
    dendaScore = 50;
  } else if (daysRemaining <= 3) {
    dendaScore = 25;
  } else {
    dendaScore = 0;
  }
  dendaScore = Math.max(0, Math.min(100, dendaScore));

  // 3. Supplier Priority (25% Weight)
  let supplierScore = 30; // Rendah
  if (supplier.tingkat_prioritas === 'tinggi') {
    supplierScore = 100;
  } else if (supplier.tingkat_prioritas === 'sedang') {
    supplierScore = 65;
  }

  const totalScore = (jatuhTempoScore * 0.40) + (dendaScore * 0.35) + (supplierScore * 0.25);
  return Math.round(totalScore * 10) / 10;
}

// Notifications Generator
function generateNotificationsInternal(db, todayStr = '2026-06-29') {
  const today = new Date(todayStr);
  const activeDebts = db.hutang_kredit.filter(h => h.status_hutang !== 'lunas');
  
  db.notifikasi = db.notifikasi.filter(n => n.id.startsWith('custom-'));

  activeDebts.forEach(hutang => {
    const supplier = db.supplier.find(s => s.id === hutang.supplier_id);
    if (!supplier) return;

    const due = new Date(hutang.tanggal_jatuh_tempo);
    const timeDiff = due.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let tipe = null;
    let pesan = '';

    if (daysRemaining === 7) {
      tipe = 'H-7';
      pesan = `Hutang Rp ${hutang.jumlah_hutang.toLocaleString('id-ID')} (Faktur: ${hutang.nomor_faktur}) kepada ${supplier.nama_supplier} akan jatuh tempo dalam 7 hari.`;
    } else if (daysRemaining === 3) {
      tipe = 'H-3';
      pesan = `Hutang Rp ${hutang.jumlah_hutang.toLocaleString('id-ID')} (Faktur: ${hutang.nomor_faktur}) kepada ${supplier.nama_supplier} akan jatuh tempo dalam 3 hari.`;
    } else if (daysRemaining === 1) {
      tipe = 'H-1';
      pesan = `PENTING: Hutang Rp ${hutang.jumlah_hutang.toLocaleString('id-ID')} (Faktur: ${hutang.nomor_faktur}) kepada ${supplier.nama_supplier} akan jatuh tempo BESOK.`;
    } else if (daysRemaining === 0) {
      tipe = 'hari_H';
      pesan = `HARI INI JATUH TEMPO! Segera lunasi hutang Rp ${hutang.jumlah_hutang.toLocaleString('id-ID')} (Faktur: ${hutang.nomor_faktur}) kepada ${supplier.nama_supplier}.`;
    } else if (daysRemaining < 0) {
      tipe = 'terlambat';
      const absDays = Math.abs(daysRemaining);
      pesan = `TERLAMBAT ${absDays} HARI! Hutang kepada ${supplier.nama_supplier} senilai Rp ${hutang.jumlah_hutang.toLocaleString('id-ID')} (Faktur: ${hutang.nomor_faktur}) telah terlambat.`;
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

// Supplier CRUD
function getSuppliers() {
  return getDb().supplier;
}

function addSupplier(sup) {
  const db = getDb();
  const newSup = { ...sup, id: `sup-${generateId()}` };
  db.supplier.push(newSup);
  saveDb(db);
  return newSup;
}

function updateSupplier(id, updated) {
  const db = getDb();
  db.supplier = db.supplier.map(s => s.id === id ? { ...s, ...updated } : s);
  saveDb(db);
}

function deleteSupplier(id) {
  const db = getDb();
  const hasDebts = db.hutang_kredit.some(h => h.supplier_id === id);
  if (hasDebts) {
    return { success: false, message: 'Supplier tidak dapat dihapus karena masih dikaitkan dengan hutang!' };
  }
  db.supplier = db.supplier.filter(s => s.id !== id);
  saveDb(db);
  return { success: true };
}

// Hutang CRUD
function getHutangs() {
  return getDb().hutang_kredit;
}

function addHutang(hutang, numInstallments = 1) {
  const db = getDb();
  const htgId = `htg-${generateId()}`;
  const newHutang = {
    ...hutang,
    id: htgId,
    denda_keterlambatan: parseFloat(hutang.denda_keterlambatan) || 0,
    jumlah_hutang: parseFloat(hutang.jumlah_hutang),
    status_hutang: 'belum_lunas'
  };
  db.hutang_kredit.push(newHutang);

  // Generate installments
  const installmentAmount = Math.round(newHutang.jumlah_hutang / numInstallments);
  const baseDueDate = new Date(newHutang.tanggal_jatuh_tempo);
  const baseStartDate = new Date(newHutang.tanggal_transaksi);
  const timeDiff = baseDueDate.getTime() - baseStartDate.getTime();
  const dayStep = numInstallments > 1 ? Math.floor(timeDiff / (numInstallments - 1)) : 0;

  for (let i = 0; i < numInstallments; i++) {
    const renDate = new Date(baseStartDate.getTime() + (dayStep * i));
    const finalAmount = i === numInstallments - 1
      ? newHutang.jumlah_hutang - (installmentAmount * (numInstallments - 1))
      : installmentAmount;

    db.jadwal_pembayaran.push({
      id: `jdw-${generateId()}`,
      hutang_id: htgId,
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

function updateHutang(id, updated) {
  const db = getDb();
  db.hutang_kredit = db.hutang_kredit.map(h => h.id === id ? { 
    ...h, 
    ...updated, 
    jumlah_hutang: parseFloat(updated.jumlah_hutang), 
    denda_keterlambatan: parseFloat(updated.denda_keterlambatan) || 0 
  } : h);
  recalculatePrioritiesInternal(db);
  generateNotificationsInternal(db);
  saveDb(db);
}

function deleteHutang(id) {
  const db = getDb();
  db.hutang_kredit = db.hutang_kredit.filter(h => h.id !== id);
  db.jadwal_pembayaran = db.jadwal_pembayaran.filter(j => j.hutang_id !== id);
  db.transaksi_pembayaran = db.transaksi_pembayaran.filter(t => t.hutang_id !== id);
  recalculatePrioritiesInternal(db);
  generateNotificationsInternal(db);
  saveDb(db);
}

// Jadwal Pembayaran
function getJadwalPembayaran() {
  const db = getDb();
  return db.jadwal_pembayaran.map(j => {
    const hutang = db.hutang_kredit.find(h => h.id === j.hutang_id);
    const supplier = hutang ? db.supplier.find(s => s.id === hutang.supplier_id) : null;
    return {
      ...j,
      nomor_faktur: hutang ? hutang.nomor_faktur : 'Faktur Tidak Diketahui',
      nama_supplier: supplier ? supplier.nama_supplier : 'Supplier Tidak Diketahui'
    };
  });
}

function generateJadwalCustom(hutangId, tanggal, jumlah) {
  const db = getDb();
  const jdw = {
    id: `jdw-${generateId()}`,
    hutang_id: hutangId,
    tanggal_rencana: tanggal,
    jumlah_rencana: parseFloat(jumlah),
    status_rencana: 'belum_dibayar'
  };
  db.jadwal_pembayaran.push(jdw);
  saveDb(db);
  return jdw;
}

function updateJadwalStatus(id, status) {
  const db = getDb();
  db.jadwal_pembayaran = db.jadwal_pembayaran.map(j => j.id === id ? { ...j, status_rencana: status } : j);
  saveDb(db);
}

// Transaksi Pembayaran (Pembayaran)
function getTransaksiPembayaran() {
  const db = getDb();
  return db.transaksi_pembayaran.map(t => {
    const hutang = db.hutang_kredit.find(h => h.id === t.hutang_id);
    const supplier = hutang ? db.supplier.find(s => s.id === hutang.supplier_id) : null;
    return {
      ...t,
      nomor_faktur: hutang ? hutang.nomor_faktur : 'Faktur Tidak Diketahui',
      nama_supplier: supplier ? supplier.nama_supplier : 'Supplier Tidak Diketahui'
    };
  });
}

function addTransaksiPembayaran(trans) {
  const db = getDb();
  const transId = `tr-${generateId()}`;
  const amountPaid = parseFloat(trans.jumlah_pembayaran);

  // Validate balance
  if (db.umkm.saldo_kas < amountPaid) {
    return { success: false, message: 'Saldo kas tidak mencukupi untuk melakukan pembayaran ini!' };
  }

  const newTrans = {
    id: transId,
    hutang_id: trans.hutang_id,
    tanggal_pembayaran: trans.tanggal_pembayaran,
    jumlah_pembayaran: amountPaid,
    metode_pembayaran: trans.metode_pembayaran,
    nomor_referensi: trans.nomor_referensi || `REF-${generateId().toUpperCase()}`,
    bukti_pembayaran_url: trans.bukti_pembayaran_url || ''
  };

  db.transaksi_pembayaran.push(newTrans);

  // Update cash balance
  db.umkm.saldo_kas -= amountPaid;

  // Track financial record
  db.laporan_keuangan.push({
    id: `lap-${generateId()}`,
    tanggal: trans.tanggal_pembayaran,
    tipe: 'pengeluaran',
    jumlah: amountPaid,
    kategori: 'pembayaran_hutang',
    keterangan: `Pembayaran hutang faktur ke supplier. Referensi: ${newTrans.nomor_referensi}`,
    referensi_id: transId
  });

  // Check debt payments and update debt status
  const hutang = db.hutang_kredit.find(h => h.id === trans.hutang_id);
  if (hutang) {
    const totalPaid = db.transaksi_pembayaran
      .filter(t => t.hutang_id === hutang.id)
      .reduce((sum, curr) => sum + curr.jumlah_pembayaran, 0);

    const totalDue = hutang.jumlah_hutang + hutang.denda_keterlambatan;

    if (totalPaid >= totalDue) {
      hutang.status_hutang = 'lunas';
    } else {
      hutang.status_hutang = 'dicicil';
    }

    // Try to auto-resolve matching unpaid schedules for this debt
    let remainingAmount = amountPaid;
    const unpaidSchedules = db.jadwal_pembayaran
      .filter(j => j.hutang_id === hutang.id && j.status_rencana === 'belum_dibayar')
      .sort((a, b) => new Date(a.tanggal_rencana) - new Date(b.tanggal_rencana));

    for (let j of unpaidSchedules) {
      if (remainingAmount <= 0) break;
      if (remainingAmount >= j.jumlah_rencana) {
        j.status_rencana = 'dibayar';
        remainingAmount -= j.jumlah_rencana;
      } else {
        // Partial schedule paid, keep status but record paid details internally
        break;
      }
    }
  }

  recalculatePrioritiesInternal(db);
  generateNotificationsInternal(db);
  saveDb(db);
  return { success: true, transaction: newTrans };
}

// Payment Cash Simulation Helper
function runPaymentSimulation(cashAmount, todayStr = '2026-06-29') {
  const db = getDb();
  const activeDebts = db.hutang_kredit.filter(h => h.status_hutang !== 'lunas');

  const debtDetails = activeDebts.map(hutang => {
    const supplier = db.supplier.find(s => s.id === hutang.supplier_id);
    const scoreObj = db.prioritas_pembayaran.find(p => p.hutang_id === hutang.id);
    const score = scoreObj ? scoreObj.skor_prioritas : (supplier ? calculatePriorityScore(hutang, supplier, todayStr) : 0);

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

  let remainingCash = parseFloat(cashAmount) || 0;
  const recommendations = [];

  debtDetails.forEach(item => {
    const h = item.hutang;

    if (remainingCash <= 0) {
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

// Global Export equivalents for Vanilla Script environment
window.PayTrackDB = {
  getDb,
  saveDb,
  resetDb,
  loginUser,
  getLoggedInUser,
  logoutUser,
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  getHutangs,
  addHutang,
  updateHutang,
  deleteHutang,
  getJadwalPembayaran,
  generateJadwalCustom,
  updateJadwalStatus,
  getTransaksiPembayaran,
  addTransaksiPembayaran,
  runPaymentSimulation
};
