"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, FileDown, X, CheckCircle, Loader2, ArrowRight, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CompressPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [result, setResult] = useState<{
    url: string;
    originalSize: number;
    compressedSize: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setErrorMessage("Hanya file PDF yang diperbolehkan.");
        return;
      }
      setSelectedFile(file);
      setResult(null);
      setErrorMessage(null);
    }
  };

  const removeFile = () => setSelectedFile(null);

  const handleCompress = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    // BACA SESI PENGGUNA SAAT INI
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      formData.append('userId', session.user.id); // SISIPKAN ID PENGGUNA
    }

    try {
      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan pada server');
      }

      setResult({
        url: data.url,
        originalSize: data.originalSize,
        compressedSize: data.compressedSize
      });
      setSelectedFile(null);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: Area Kerja Utama */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Alat Kompresi PDF</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Perkecil ukuran file dokumen PDF Anda dengan tetap mempertahankan kualitas teksnya.</p>

            {!selectedFile ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors bg-slate-50 dark:bg-slate-700/50 relative">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Klik atau Drag & Drop file di sini"
                />
                <UploadCloud className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
                <p className="font-semibold text-slate-700 dark:text-slate-200">Klik area ini untuk memilih file PDF</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Maksimal 10MB per file</p>
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <FileDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-3" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">{formatBytes(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={removeFile}
                    disabled={isProcessing}
                    className="p-2 text-emerald-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <button 
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className={`mt-6 w-full py-3 rounded-xl font-bold flex justify-center items-center text-white transition-all
                    ${isProcessing ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg'}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sedang Mengompresi...
                    </>
                  ) : (
                    'Kompres PDF Sekarang'
                  )}
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                🚨 {errorMessage}
              </div>
            )}

            {result && (
              <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl text-center animate-in fade-in zoom-in duration-300">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Kompresi Selesai!</h3>
                
                <div className="flex items-center justify-center gap-4 mb-6 text-sm font-medium">
                  <div className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg">
                    {formatBytes(result.originalSize)}
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                    {formatBytes(result.compressedSize)}
                  </div>
                </div>

                <a 
                  href={result.url} 
                  download
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Unduh PDF Ringan
                </a>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: Panel Informasi */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-400 font-bold">
                <Info className="w-5 h-5" />
                <h3>Informasi Kompresi</h3>
              </div>
              <ul className="text-sm text-emerald-800/80 dark:text-emerald-300/80 space-y-3 list-disc pl-5">
                <li>Sistem kami mengompresi PDF menggunakan algoritma *deflate* dan penghapusan *garbage data*.</li>
                <li>Hanya mendukung pemrosesan 1 file secara bersamaan.</li>
                <li>Teks akan tetap tajam, namun resolusi gambar di dalam dokumen mungkin akan sedikit diturunkan.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}