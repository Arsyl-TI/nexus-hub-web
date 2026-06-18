"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, FileEdit, X, CheckCircle, Loader2, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PdfToWordPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setErrorMessage("Hanya dokumen PDF yang diperbolehkan.");
        return;
      }
      setSelectedFile(file);
      setResultUrl(null);
      setErrorMessage(null);
    }
  };

  const removeFile = () => setSelectedFile(null);

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setResultUrl(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    // BACA SESI PENGGUNA SAAT INI
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      formData.append('userId', session.user.id); // SISIPKAN ID PENGGUNA
    }

    try {
      const response = await fetch('/api/pdf-to-word', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan sistem');

      setResultUrl(data.url);
      setSelectedFile(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AREA FORM UTAMA */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">PDF to Word Converter</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Ubah file PDF Anda menjadi dokumen Microsoft Word (.docx) yang dapat diedit kembali dengan mudah.</p>

            {!selectedFile ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-slate-50 dark:bg-slate-700/50 relative">
                <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <UploadCloud className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                <p className="font-semibold text-slate-700 dark:text-slate-200">Klik di sini untuk memilih file PDF</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Struktur dokumen akan disesuaikan secara otomatis</p>
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                  <div className="flex items-center">
                    <FileEdit className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100 truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={removeFile} disabled={isProcessing} className="p-2 text-blue-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <button onClick={handleConvert} disabled={isProcessing} className="mt-6 w-full py-3 rounded-xl font-bold flex justify-center items-center text-white bg-blue-600 hover:bg-blue-700 shadow-md">
                  {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sedang Mengonversi Dokumen...</> : 'Konversi ke Word Sekarang'}
                </button>
              </div>
            )}

            {errorMessage && <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 rounded-lg text-sm">🚨 {errorMessage}</div>}

            {resultUrl && (
              <div className="mt-8 p-6 bg-blue-50 dark:bg-slate-700/50 border border-blue-200 dark:border-slate-600 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Konversi Sukses!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">File Word Anda siap diunduh dan diedit kembali.</p>
                <a href={resultUrl} download target="_blank" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 shadow-md">Unduh File Word (.docx)</a>
              </div>
            )}
          </div>

          {/* PANEL KANAN: DETAIL ALAT */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400 font-bold"><Info className="w-5 h-5" /><h3>Informasi Alur</h3></div>
              <ul className="text-sm text-blue-800/80 dark:text-blue-300/80 space-y-3 list-disc pl-5">
                <li>Sistem kami mengekstrak teks, tabel, dan tata letak gambar dari PDF untuk dituangkan ke bentuk format Word secara presisi.</li>
                <li>Hasil konversi berupa format `.docx` modern (kompatibel dengan Microsoft Word 2007 ke atas serta Google Docs).</li>
                <li>Kecepatan konversi sangat bergantung pada jumlah halaman dan banyaknya objek di dalam PDF Anda.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}