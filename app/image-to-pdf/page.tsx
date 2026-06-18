"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, FileImage, X, CheckCircle, Loader2, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ImageToPdfPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Validasi hanya menerima gambar JPG, JPEG, dan PNG
      const imgFiles = filesArray.filter(file => 
        file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
      );
      setSelectedFiles(prev => [...prev, ...imgFiles]);
      setResultUrl(null);
      setErrorMessage(null);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;

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
      const response = await fetch('/api/image-to-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan sistem');

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
        <Link href="/dashboard" className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Image to PDF Converter</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Ubah dan gabungkan kumpulan foto/gambar Anda menjadi satu dokumen PDF terstruktur.</p>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-amber-500 dark:hover:border-amber-400 transition-colors bg-slate-50 dark:bg-slate-700/50 relative">
              <input type="file" multiple accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud className="w-12 h-12 text-amber-500 dark:text-amber-400 mx-auto mb-4" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">Klik di sini untuk memilih file gambar</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Mendukung format JPG, JPEG, dan PNG</p>
            </div>

            {errorMessage && <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 rounded-lg text-sm">🚨 {errorMessage}</div>}

            {selectedFiles.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Gambar Terpilih ({selectedFiles.length}):</h3>
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center">
                        <FileImage className="w-5 h-5 text-amber-500 mr-3" />
                        <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                      </div>
                      <button onClick={() => removeFile(index)} className="p-1 text-slate-400 hover:text-red-500 rounded"><X className="w-4 h-4" /></button>
                    </li>
                  ))}
                </ul>

                <button onClick={handleConvert} disabled={isProcessing} className="mt-6 w-full py-3 rounded-xl font-bold flex justify-center items-center text-white bg-amber-500 hover:bg-amber-600 shadow-md">
                  {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Mengonversi ke PDF...</> : 'Konversi Semua Gambar Sekarang'}
                </button>
              </div>
            )}

            {resultUrl && (
              <div className="mt-8 p-6 bg-amber-50 dark:bg-slate-700/50 border border-amber-200 dark:border-slate-600 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Konversi Berhasil!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Gambar Anda sukses disatukan ke dalam file PDF.</p>
                <a href={resultUrl} download target="_blank" className="inline-block bg-amber-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-600 shadow-md">Unduh File PDF</a>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4 text-amber-700 dark:text-amber-400 font-bold"><Info className="w-5 h-5" /><h3>Panduan Fitur</h3></div>
              <ul className="text-sm text-amber-800/80 dark:text-amber-300/80 space-y-3 list-disc pl-5">
                <li>Anda bisa memilih banyak foto sekaligus.</li>
                <li>Setiap gambar akan otomatis diubah menjadi 1 halaman PDF terpisah tanpa merusak rasio aspek foto aslinya.</li>
                <li>Sangat cocok untuk merapikan foto dokumen pendaftaran, tugas kuliah, atau kwitansi menjadi satu dokumen resmi.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}