"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, File, X, CheckCircle, Loader2 } from 'lucide-react';

export default function MergePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fungsi untuk menangani saat user memilih file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Filter hanya menerima file PDF
      const pdfFiles = filesArray.filter(file => file.type === 'application/pdf');
      setSelectedFiles(prev => [...prev, ...pdfFiles]);
      // Reset state lainnya
      setResultUrl(null);
      setErrorMessage(null);
    }
  };

  // Fungsi untuk menghapus file dari daftar pilihan
  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Fungsi untuk mengirim file ke API Serverless Next.js
  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      setErrorMessage("Pilih minimal 2 file PDF untuk digabungkan.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResultUrl(null);

    // Bungkus file menggunakan FormData
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

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
      setSelectedFiles([]); // Kosongkan daftar setelah sukses
    } catch (error: unknown) {
        // PERBAIKAN DI FRONTEND
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6">
      <div className="max-w-3xl mx-auto">
        {/* Tombol Kembali */}
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Link>

        {/* Judul Halaman */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Alat Penggabung PDF (Merger)</h1>
          <p className="text-slate-500 mb-8">Pilih beberapa file PDF untuk digabungkan menjadi satu dokumen berurutan.</p>

          {/* Area Kotak Upload File */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50 relative">
            <input 
              type="file" 
              multiple 
              accept=".pdf" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Klik atau Drag & Drop file di sini"
            />
            <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="font-semibold text-slate-700">Klik area ini untuk memilih file PDF</p>
            <p className="text-sm text-slate-500 mt-1">Atau *Drag and Drop* file Anda kemari (Maks 10MB per file)</p>
          </div>

          {/* Pesan Error */}
          {errorMessage && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              🚨 {errorMessage}
            </div>
          )}

          {/* Daftar File Terpilih */}
          {selectedFiles.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-slate-700 mb-3">Antrean File ({selectedFiles.length}):</h3>
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center">
                      <File className="w-5 h-5 text-slate-400 mr-3" />
                      <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button 
                      onClick={() => removeFile(index)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                      title="Hapus file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* Tombol Eksekusi */}
              <button 
                onClick={handleMerge}
                disabled={isProcessing || selectedFiles.length < 2}
                className={`mt-6 w-full py-3 rounded-xl font-bold flex justify-center items-center text-white transition-all
                  ${isProcessing || selectedFiles.length < 2 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
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

          {/* Kotak Hasil (Tampil jika proses berhasil) */}
          {resultUrl && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-800 mb-2">Penggabungan Berhasil!</h3>
              <p className="text-emerald-600 mb-4 text-sm">File Anda telah berhasil digabung dan tersimpan dengan aman.</p>
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
      </div>
    </div>
  );
}