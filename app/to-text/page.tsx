"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, FileText, X, CheckCircle, Loader2 } from 'lucide-react';

export default function ToTextPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setErrorMessage("Hanya file PDF yang diperbolehkan.");
        return;
      }
      setSelectedFile(file);
      setResultUrl(null);
      setErrorMessage(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      setErrorMessage("Pilih file PDF terlebih dahulu.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResultUrl(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/to-text', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan pada server');
      }

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-purple-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Link>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Alat Ekstraksi Teks (PDF to Text)</h1>
          <p className="text-slate-500 mb-8">Unggah dokumen PDF untuk menyalin seluruh isinya menjadi file teks murni (.txt).</p>

          {!selectedFile ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors bg-slate-50 relative">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Klik atau Drag & Drop file di sini"
              />
              <UploadCloud className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <p className="font-semibold text-slate-700">Klik area ini untuk memilih file PDF</p>
              <p className="text-sm text-slate-500 mt-1">Hanya bisa memproses 1 dokumen dalam satu waktu</p>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-bold text-purple-900 truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
                    <p className="text-xs text-purple-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={removeFile}
                  disabled={isProcessing}
                  className="p-2 text-purple-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button 
                onClick={handleExtract}
                disabled={isProcessing}
                className={`mt-6 w-full py-3 rounded-xl font-bold flex justify-center items-center text-white transition-all
                  ${isProcessing ? 'bg-slate-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'}`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sedang Mengekstrak Teks...
                  </>
                ) : (
                  'Ekstrak Teks Sekarang'
                )}
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              🚨 {errorMessage}
            </div>
          )}

          {resultUrl && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-800 mb-2">Ekstraksi Berhasil!</h3>
              <p className="text-emerald-600 mb-4 text-sm">Teks berhasil dibaca dan disalin ke dalam file dokumen.</p>
              <a 
                href={resultUrl} 
                download
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Unduh File Teks (.txt)
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}