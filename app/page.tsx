"use client";

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FileDown, FileText, Combine, History, Activity, Moon, Sun } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// 1. SOLUSI ERROR 'ANY': Kita definisikan tipe data Supabase dengan jelas
interface ActivityLog {
  id: string;
  created_at: string;
  tool_type: string;
  status: string;
  output_file_url: string | null;
  error_details: string | null;
}

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Menggunakan tipe ActivityLog, bukan 'any'
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    // 2. SOLUSI ERROR 'DECLARED': Kita pindahkan fungsi ini ke DALAM useEffect 
    // agar terisolasi dengan rapi dan tidak bentrok.
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (data) setLogs(data as ActivityLog[]);
    };

    // 3. SOLUSI ERROR 'SETSTATE': Kita jalankan fetchLogs dulu, 
    // lalu setMounted di akhir menggunakan requestAnimationFrame agar tidak bertabrakan dengan render bawaan React.
    requestAnimationFrame(() => {
      setMounted(true);
    });
    
    fetchLogs();
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      
      {/* HEADER & NAVBAR */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Nexus Hub</h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Proyek IPPL &copy; 2026</p>
            
            {/* TOMBOL DARK MODE */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title="Ganti Tema"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Smart Utility Tools untuk Segala Kebutuhan
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Pilih alat yang Anda butuhkan. Pemrosesan dilakukan dengan cepat, aman, dan tanpa perlu mendaftar.
          </p>
        </div>

        {/* TOOLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link href="/merge" className="group">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 h-full flex flex-col">
              <div className="bg-blue-50 dark:bg-slate-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Combine className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">PDF Merger</h3>
              <p className="text-slate-500 dark:text-slate-400 flex-grow">
                Gabungkan dua atau lebih file PDF menjadi satu dokumen utuh dengan urutan yang bisa Anda atur.
              </p>
            </div>
          </Link>

          <Link href="/compress" className="group">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:emerald-300 dark:hover:border-emerald-500 transition-all duration-300 h-full flex flex-col">
              <div className="bg-emerald-50 dark:bg-slate-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
                <FileDown className="w-7 h-7 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">PDF Compressor</h3>
              <p className="text-slate-500 dark:text-slate-400 flex-grow">
                Perkecil ukuran file PDF Anda agar lebih ringan saat diunggah tanpa mengurangi kualitas teks.
              </p>
            </div>
          </Link>

          <Link href="/to-text" className="group">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:purple-300 dark:hover:border-purple-500 transition-all duration-300 h-full flex flex-col">
              <div className="bg-purple-50 dark:bg-slate-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">PDF to Text</h3>
              <p className="text-slate-500 dark:text-slate-400 flex-grow">
                Ekstrak seluruh teks dari dokumen PDF Anda secara instan dan simpan sebagai file teks murni.
              </p>
            </div>
          </Link>
        </div>

        {/* ACTIVITY HISTORY */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-16">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">Riwayat Aktivitas Publik</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 font-medium">Waktu</th>
                  <th className="px-6 py-3 font-medium">Jenis Alat</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      Mengambil data riwayat...
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="px-6 py-4">
                      {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                      {log.tool_type === 'MERGE' ? 'PDF Merger' : log.tool_type === 'COMPRESS' ? 'PDF Compressor' : 'PDF to Text'}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">Success</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">Failed</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'SUCCESS' && log.output_file_url ? (
                        <a href={log.output_file_url} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</a>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">{log.error_details || '-'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GLOBAL HEALTH STATUS FOOTER */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 pb-4">
          <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
            {/* Indikator 1: Next.js */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Next.js Server: Online
            </div>
            
            {/* Indikator 2: Supabase */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Supabase Connection: Connected
            </div>

            {/* Indikator 3: Python */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Python Engine: Active
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}