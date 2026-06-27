"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, FileSearch, X, Loader2, Info, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CheckResult {
  passed: boolean;
  details: string;
}

interface FormatResults {
  font_check: CheckResult;
  size_check: CheckResult;
  toc_check: CheckResult;
  cover_check: CheckResult;
  page_number_check: CheckResult;
  abstract_check: CheckResult;
  margin_check: CheckResult;
  spacing_check: CheckResult;
}

const ResultCard = ({ title, result }: { title: string, result: CheckResult }) => (
  <div className={`p-4 rounded-xl border transition-all shadow-sm ${result.passed ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50'}`}>
    <div className="flex items-start">
      {result.passed ? <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" /> : <XCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />}
      <div>
        <p className="font-bold text-slate-800 dark:text-slate-200">{title}</p>
        <p className={`text-sm mt-1 ${result.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
          {result.details}
        </p>
      </div>
    </div>
  </div>
);

export default function CheckFormatPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<FormatResults | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // STATE BARU UNTUK PREVIEW
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setErrorMessage("Hanya dokumen PDF yang diperbolehkan.");
        return;
      }
      setSelectedFile(file);
      setResults(null);
      setPreviewUrl(null);
      setErrorMessage(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleCheck = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setResults(null);
    setPreviewUrl(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) formData.append('userId', session.user.id);

    try {
      const response = await fetch('/api/check-format', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan sistem');

      setResults(data.results);
      setPreviewUrl(data.previewUrl); // MENYIMPAN URL PREVIEW DARI SERVER

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-teal-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Validasi Format Tugas Akhir UIR</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">AI akan memindai struktur PDF Anda untuk dicocokkan dengan pedoman penulisan Teknik Informatika UIR.</p>

            {!selectedFile ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-teal-500 transition-colors cursor-pointer relative bg-slate-50 dark:bg-slate-700/50">
                <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0" />
                <UploadCloud className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                <p className="font-semibold text-slate-700 dark:text-slate-200">Klik / Tarik file Proposal atau Tugas Akhir ke sini</p>
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 rounded-lg">
                  <div className="flex items-center">
                    <FileSearch className="w-6 h-6 text-teal-600 dark:text-teal-400 mr-3" />
                    <div>
                      <p className="text-sm font-bold text-teal-900 dark:text-teal-100 truncate max-w-[200px] md:max-w-md">{selectedFile.name}</p>
                    </div>
                  </div>
                  <button onClick={removeFile} disabled={isProcessing} className="p-2 text-teal-400 hover:text-red-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <button onClick={handleCheck} disabled={isProcessing} className="mt-6 w-full py-3.5 rounded-xl font-bold flex justify-center items-center text-white bg-teal-600 hover:bg-teal-700 shadow-md">
                  {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Menganalisis Pedoman Dokumen...</> : 'Mulai Cek Format Penulisan'}
                </button>
              </div>
            )}

            {errorMessage && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg font-medium border border-red-200">🚨 {errorMessage}</div>}

            {results && (
              <div className="mt-10 animate-in fade-in zoom-in duration-500">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="bg-teal-100 dark:bg-teal-900/50 p-2 rounded-lg"><FileSearch className="w-5 h-5 text-teal-700 dark:text-teal-400" /></div>
                  <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Laporan Hasil Validasi</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResultCard title="Standar Font (Times New Roman)" result={results.font_check} />
                  <ResultCard title="Ukuran Font Dominan (12pt)" result={results.size_check} />
                  <ResultCard title="Penomoran Romawi & Arab" result={results.page_number_check} />
                  <ResultCard title="Batas Abstrak (Maks 500 Kata)" result={results.abstract_check} />
                  <ResultCard title="Daftar Isi Otomatis" result={results.toc_check} />
                  <ResultCard title="Format Sampul (Judul 14pt)" result={results.cover_check} />
                  <ResultCard title="Batas Margin (Kiri 4cm, Lainnya 3cm)" result={results.margin_check} />
                  <ResultCard title="Spasi Baris (Wajib 2 Spasi)" result={results.spacing_check} />
                </div>

                {/* --- KOMPONEN BARU: PREVIEW PDF BERCORAT MERAH --- */}
                {previewUrl && (
                  <div className="mt-10 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-md">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Preview Highlight Kesalahan</h3>
                      </div>
                      <a href={previewUrl} target="_blank" className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg shadow-sm transition-colors">
                        Buka Layar Penuh
                      </a>
                    </div>
                    {/* Menggunakan Toolbar=0 agar tampilan PDF bersih */}
                    <iframe src={`${previewUrl}#toolbar=0&navpanes=0`} className="w-full h-[600px] bg-slate-200 dark:bg-slate-700" title="PDF Preview" />
                  </div>
                )}
                
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-100 dark:border-teal-800/50 sticky top-24">
              <div className="flex gap-2 font-bold text-teal-800 dark:text-teal-400 mb-4 text-lg items-center">
                <Info className="w-6 h-6"/> Parameter Validasi
              </div>
              <ul className="text-sm space-y-4 text-teal-900/80 dark:text-teal-300/80">
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div><p><strong>Daftar Isi:</strong> Memastikan Anda tidak membuat titik-titik secara manual.</p></li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div><p><strong>Sampul:</strong> Memastikan judul besar berukuran 14pt dan nama Anda 12pt.</p></li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div><p><strong>Penomoran:</strong> Memindai area bawah halaman untuk transisi angka i, ii ke 1, 2.</p></li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div><p><strong>Deteksi Visual:</strong> Sistem akan menggarisi teks dengan <strong>kotak merah</strong> jika menemukan jenis font/ukuran yang menyimpang!</p></li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div><p><strong>Deteksi Margin & Spasi:</strong> AI menghitung ruang matematika antar huruf.</p></li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div><p><strong>Kotak Merah:</strong> Pelanggaran pada jenis Font, Ukuran, dan Margin Kertas.</p></li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div><p><strong>Kotak Oranye:</strong> Pelanggaran pada Spasi Paragraf (Bukan 2 Spasi).</p></li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}