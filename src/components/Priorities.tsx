import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Coins, 
  ArrowRight,
  TrendingUp,
  Info,
  DollarSign
} from 'lucide-react';
import { HutangKredit, Supplier, UMKM } from '../types';
import { runPaymentSimulation, recordPayment } from '../dbManager';

interface PrioritiesProps {
  umkm: UMKM;
  hutangs: HutangKredit[];
  suppliers: Supplier[];
  onRefresh: () => void;
}

export const Priorities: React.FC<PrioritiesProps> = ({
  umkm,
  hutangs,
  suppliers,
  onRefresh
}) => {
  const [simulatedCash, setSimulatedCash] = useState<number>(umkm.saldo_kas);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Trigger simulation computation
  useEffect(() => {
    const results = runPaymentSimulation(simulatedCash);
    setSimulationResults(results);
  }, [simulatedCash, hutangs, suppliers]);

  const handleApplySimulation = () => {
    if (confirm('Apakah Anda ingin merealisasikan semua rekomendasi pelunasan dari simulasi ini? Tindakan ini akan mencatat pembayaran secara otomatis dan mengurangi saldo kas asli Anda.')) {
      const db = JSON.parse(localStorage.getItem('paytrack_umkm_relational_db') || '{}');
      const todayStr = '2026-06-29';

      let count = 0;
      simulationResults.forEach(rec => {
        if (rec.rekomendasiStatus === 'lunas' || rec.rekomendasiStatus === 'cicil') {
          recordPayment({
            hutang_id: rec.hutangId,
            tanggal_pembayaran: todayStr,
            jumlah_pembayaran: rec.rekomendasiJumlah,
            metode_pembayaran: 'transfer',
            nomor_referensi: `SIM-AUTO-${Math.floor(Math.random() * 900000 + 100000)}`,
            bukti_pembayaran_url: 'placeholder_simulasi.png'
          }, todayStr);
          count++;
        }
      });

      setSuccessMessage(`Berhasil merealisasikan ${count} pembayaran terhitung dari hasil simulasi anggaran!`);
      onRefresh();
      setTimeout(() => setSuccessMessage(null), 6000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Upper header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 md:text-2xl">Prioritas & Simulasi Bayar</h2>
          <p className="text-xs text-slate-500">Gunakan algoritma cerdas PayTrack untuk mengurutkan tingkat urgensi hutang dan menyimulasikan anggaran kas.</p>
        </div>

        <button
          onClick={() => setShowFormulaInfo(!showFormulaInfo)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
        >
          <Info className="h-4 w-4 text-brand-500" /> {showFormulaInfo ? 'Sembunyikan Formula' : 'Cara Kerja Prioritas'}
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          <p className="flex-1">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-slate-900">✕</button>
        </div>
      )}

      {/* Formula Explanation box */}
      {showFormulaInfo && (
        <div className="rounded-3xl border border-blue-100 bg-blue-50/20 p-5 space-y-4">
          <h4 className="font-display text-sm font-bold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-blue-500" /> Cara Kerja Penilaian Skor Prioritas
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sistem menganalisis seluruh faktur hutang aktif Anda dan menghitung skor keterdesakan pembayaran secara kuantitatif dengan formula bobot berikut:
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-white p-4 text-center space-y-1">
              <span className="text-xl">📅</span>
              <p className="text-xs font-bold text-slate-800">Jatuh Tempo (40%)</p>
              <p className="text-[10px] text-slate-400">Semakin dekat batas jatuh tempo (atau jika telah terlambat), maka kontribusi nilainya semakin tinggi mendekati 100.</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-4 text-center space-y-1">
              <span className="text-xl">⚠️</span>
              <p className="text-xs font-bold text-slate-800">Denda Keterlambatan (35%)</p>
              <p className="text-[10px] text-slate-400">Memiliki denda aktif yang berjalan memicu nilai urgensi tinggi demi menghentikan pembengkakan beban bunga denda harian.</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-4 text-center space-y-1">
              <span className="text-xl">🤝</span>
              <p className="text-xs font-bold text-slate-800">Prioritas Supplier (25%)</p>
              <p className="text-[10px] text-slate-400">Supplier berkategori Prioritas Tinggi (misalnya stok utama toko) diprioritaskan di atas supplier biasa.</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid container: Simulation on left, scores list on right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left column: Simulator Controls and Recommendations */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Coins className="h-5 w-5 text-emerald-500" /> Simulasi Kemampuan Pembayaran
              </h3>
              <p className="text-xs text-slate-500">
                Sesuaikan sisa anggaran kas Anda di bawah ini untuk melihat simulasi alokasi pembayaran mana yang paling produktif.
              </p>
            </div>

            {/* Slider controls */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4 text-left">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-xs font-bold text-slate-700">Jumlah Kas untuk Simulasi:</label>
                <div className="relative rounded-xl border border-slate-200 bg-white px-3 py-1.5 flex items-center w-full sm:w-48">
                  <span className="font-mono text-xs font-semibold text-slate-400 mr-1.5">Rp</span>
                  <input
                    type="number"
                    value={simulatedCash}
                    onChange={(e) => setSimulatedCash(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              {/* Slider bar */}
              <input
                type="range"
                min="0"
                max={umkm.saldo_kas * 2 || 50000000}
                step="50000"
                value={simulatedCash}
                onChange={(e) => setSimulatedCash(parseFloat(e.target.value) || 0)}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Rp 0</span>
                <span>(Saldo Kas Asli: Rp {umkm.saldo_kas.toLocaleString('id-ID')})</span>
                <span>Rp {(umkm.saldo_kas * 2 || 50000000).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Recommendation Cards */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hasil Rekomendasi Alokasi Pembayaran:</h4>
              
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {simulationResults.map((rec) => (
                  <div key={rec.hutangId} className="rounded-2xl border border-slate-100 p-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center bg-white hover:bg-slate-50/50">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Faktur: {rec.nomorFaktur}</span>
                        <span className="inline-block rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-brand-600">
                          Skor {rec.skorPrioritas}
                        </span>
                      </div>
                      <h5 className="font-display text-xs font-bold text-slate-900">{rec.namaSupplier}</h5>
                      <p className="text-[10px] text-slate-400 font-semibold">Batas Jatuh Tempo: {rec.tanggalJatuhTempo}</p>
                    </div>

                    <div className="flex items-center gap-4 text-left sm:text-right">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Rencana Alokasi</p>
                        <p className="font-mono text-xs font-bold text-slate-900">
                          Rp {rec.rekomendasiJumlah.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[9px] text-slate-400">Sisa Tagihan: Rp {rec.sisaTagihan.toLocaleString('id-ID')}</p>
                      </div>

                      {/* Recommendation Status Tag */}
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold border ${
                        rec.rekomendasiStatus === 'lunas'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : rec.rekomendasiStatus === 'cicil'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {rec.rekomendasiStatus === 'lunas' ? (
                          <>• Rekomendasi Penuh</>
                        ) : rec.rekomendasiStatus === 'cicil' ? (
                          <>• Rekomendasi Cicil</>
                        ) : (
                          <>• Ditunda</>
                        )}
                      </span>
                    </div>
                  </div>
                ))}

                {simulationResults.length === 0 && (
                  <p className="text-center py-10 text-xs text-slate-400">Tidak ada hutang aktif untuk disimulasikan.</p>
                )}
              </div>
            </div>
          </div>

          {simulationResults.some(r => r.rekomendasiStatus === 'lunas' || r.rekomendasiStatus === 'cicil') && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-left text-[11px] text-slate-400">
                *Klik tombol di samping untuk langsung melunasi anggaran simulasi secara otomatis.
              </div>
              <button
                onClick={handleApplySimulation}
                className="flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-brand-700 shadow-md shadow-brand-500/15 cursor-pointer"
              >
                Terapkan & Bayar Rekomendasi <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

        {/* Right column: Dynamic Score Leaderboard */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-600" /> Pemeringkat Urgensi
            </h3>
            <p className="text-xs text-slate-500">Urutan keterdesakan bayar seluruh faktur aktif saat ini.</p>
          </div>

          <div className="space-y-3.5">
            {simulationResults.map((rec, index) => (
              <div key={rec.hutangId} className="flex items-center gap-3 rounded-2xl border border-slate-50 bg-slate-50/50 p-3.5">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                  {index + 1}
                </span>

                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-xs text-slate-800 truncate leading-snug">{rec.namaSupplier}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Faktur: {rec.nomorFaktur}</p>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-lg bg-brand-50 px-2 py-1 font-mono text-xs font-bold text-brand-600">
                    {rec.skorPrioritas}
                  </span>
                </div>
              </div>
            ))}

            {simulationResults.length === 0 && (
              <p className="text-center py-10 text-xs text-slate-400">Tidak ada peringkat berjalan.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
