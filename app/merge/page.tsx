"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, File, X, CheckCircle, Loader2, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MergePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const pdfFiles = filesArray.filter(file => file.type === 'application/pdf');
      setSelectedFiles(prev => [...prev, ...pdfFiles]);
      setResultUrl(null);
      setErrorMessage(null);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      setErrorMessage("Pilih minimal 2 file PDF untuk digabungkan.");
      return;
    }
    

    setIsProcessing(true);
    setErrorMessage(null);
    setResultUrl(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    // BACA SESI PENGGUNA SAAT INI
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      formData.append('userId', session.user.id); // SISIPKAN ID PENGGUNA
    }

    try {
      const response = await fetch('/api/merge', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan pada server');
      }

      setResultUrl(data.url);
      setSelectedFiles([]); 
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
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Link>

        {/* Layout Berbasis Grid untuk Mengisi Ruang Kosong */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: Area Kerja Utama (Lebar 2 Kolom) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Alat Penggabung PDF (Merger)</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Pilih beberapa file PDF untuk digabungkan menjadi satu dokumen berurutan.</p>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-slate-50 dark:bg-slate-700/50 relative">
              <input 
                type="file" 
                multiple 
                accept=".pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Klik atau Drag & Drop file di sini"
              />
              <UploadCloud className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">Klik area ini untuk memilih file PDF</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Atau *Drag and Drop* file Anda kemari (Maks 10MB per file)</p>
            </div>

            {errorMessage && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                🚨 {errorMessage}
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Antrean File ({selectedFiles.length}):</h3>
                <ul className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center">
                        <File className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3" />
                        <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs dark:text-slate-200">{file.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button 
                        onClick={() => removeFile(index)}
                        className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Hapus file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={handleMerge}
                  disabled={isProcessing || selectedFiles.length < 2}
                  className={`mt-6 w-full py-3 rounded-xl font-bold flex justify-center items-center text-white transition-all
                    ${isProcessing || selectedFiles.length < 2 ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Memproses File Anda...
                    </>
                  ) : (
                    'Gabungkan PDF Sekarang'
                  )}
                </button>
              </div>
            )}

            {resultUrl && (
              <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-2">Penggabungan Berhasil!</h3>
                <p className="text-emerald-600 dark:text-emerald-500 mb-4 text-sm">File Anda telah berhasil digabung dan tersimpan dengan aman.</p>
                <a 
                  href={resultUrl} 
                  download
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Unduh File Hasil
                </a>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: Panel Informasi Ekstra */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400 font-bold">
                <Info className="w-5 h-5" />
                <h3>Cara Penggunaan</h3>
              </div>
              <ul className="text-sm text-blue-800/80 dark:text-blue-300/80 space-y-3 list-disc pl-5">
                <li>Klik area unggah atau seret file PDF Anda ke dalam kotak.</li>
                <li>Pastikan Anda mengunggah minimal 2 dokumen.</li>
                <li>Sistem akan menggabungkan dokumen sesuai urutan Anda memasukkannya ke dalam antrean.</li>
                <li>Proses ini aman; file Anda akan dihapus dari *cache* secara otomatis.</li>
              </ul>
            </div>
            
            {/* Ruang tambahan untuk iklan / fitur lain di masa depan */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex items-center justify-center min-h-[150px]">
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center">Ruang Iklan / Info Tambahan</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}