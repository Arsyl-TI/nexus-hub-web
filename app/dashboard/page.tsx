"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FileDown, FileText, Combine, History, Activity, Moon, Sun, Images, FileEdit, LogOut, FileSearch } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// INI ADALAH BAGIAN YANG HILANG (Definisi Tipe Data untuk TypeScript)
interface ActivityLog {
  id: string;
  created_at: string;
  tool_type: string;
  status: string;
  output_file_url: string | null;
  error_details: string | null;
}

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Mengecek apakah pengguna sudah login
    const checkUserAndFetchLogs = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Jika belum login, otomatis dilempar ke halaman login
        router.push('/login');
        return;
      }

      setUserEmail(session.user.email || 'User');

      // Mengambil riwayat yang HANYA milik pengguna yang sedang login
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (data) setLogs(data as ActivityLog[]);
      
      // Mencegah error Hydration untuk Dark Mode
      requestAnimationFrame(() => setMounted(true));
    };

    checkUserAndFetchLogs();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Layar kosong sementara sebelum dialihkan (mencegah layar berkedip)
  if (!mounted) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300"></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      
      {/* HEADER & NAVBAR */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <Activity className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Nexus Hub</h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block font-medium">Hai, {userEmail}</p>
            
            {/* Tombol Logout */}
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-full text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors" 
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Tombol Tema */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Ganti Tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
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
            Pilih alat yang Anda butuhkan. Semua pemrosesan dilakukan dengan cepat, aman, dan tanpa pelacakan data.
          </p>
        </div>

        {/* TOOLS GRID - 5 Kotak */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          
          <Link href="/merge" className="group">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 h-full flex flex-col">
              <div className="bg-blue-50 dark:bg-slate-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Combine className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">PDF Merger</h3>
              <p className="text-slate-500 dark:text-slate-400 flex-grow text-sm">
                Gabungkan dua atau lebih file PDF menjadi satu dokumen utuh dengan urutan yang bisa diatur.
              </p>
            </div>
          </Link>

          <Link href="/compress" className="group">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:emerald-300 dark:hover:border-emerald-500 transition-all duration-300 h-full flex flex-col">
              <div className="bg-emerald-50 dark:bg-slate-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
                <FileDown className="w-7 h-7 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">PDF Compressor</h3>
              <p className="text-slate-500 dark:text-slate-400 flex-grow text-sm">
                Perkecil ukuran file dokumen PDF Anda agar lebih ringan saat diunggah tanpa merusak kualitas teks.
              </p>
            </div>
          </Link>

          <Link href="/to-text" className="group">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:purple-300 dark:hover:border-purple-500 transition-all duration-300 h-full flex flex-col">
              <div className="bg-purple-50 dark:bg-slate-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">PDF to Text</h3>
              <p className="text-slate-500 dark:text-slate-400 flex-grow text-sm">
                Ekstrak seluruh tulisan dari dokumen PDF Anda secara instan dan simpan sebagai file teks murni (.txt).
              </p>
            </div>
          </Link>

          <Link href="/image-to-pdf" className="group">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:amber-300 dark:hover:border-amber-500 transition-all duration-300 h-full flex flex-col">
              <div className="bg-amber-50 dark:bg-slate-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
                <Images className="w-7 h-7 text-amber-600 dark:text-amber-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Image to PDF</h3>
              <p className="text-slate-500 dark:text-slate-400 flex-grow text-sm">
                Gabungkan kumpulan foto (JPG/PNG) tugas atau dokumen Anda menjadi satu file PDF yang rapi.
              </p>
            </div>
          </Link>

          <Link href="/pdf-to-word" className="group">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:indigo-300 dark:hover:border-indigo-500 transition-all duration-300 h-full flex flex-col">
              <div className="bg-indigo-50 dark:bg-slate-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <FileEdit className="w-7 h-7 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">PDF to Word</h3>
              <p className="text-slate-500 dark:text-slate-400 flex-grow text-sm">
                Konversi file PDF menjadi dokumen Microsoft Word (.docx) agar isinya dapat diketik dan diedit kembali.
              </p>
            </div>
          </Link>

          {/* 6. Document Format Analyzer */}
          <Link href="/check-format" className="group">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-500 transition-all duration-300 h-full flex flex-col">
              <div className="bg-teal-50 dark:bg-slate-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors">
                {/* Pastikan Anda sudah import ikon FileSearch dari lucide-react di bagian atas file */}
                <FileSearch className="w-7 h-7 text-teal-600 dark:text-teal-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Format Analyzer</h3>
              <p className="text-slate-500 dark:text-slate-400 flex-grow text-sm">
                Cek otomatis apakah dokumen Tugas Akhir Anda sudah memenuhi standar (Font, Ukuran, dan Struktur).
              </p>
            </div>
          </Link>

        </div>

        {/* ACTIVITY HISTORY - SEKARANG MENJADI PRIVAT */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-16">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">Riwayat Aktivitas Pribadi</h3>
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
                      Belum ada riwayat aktivitas.
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="px-6 py-4">
                      {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                      {log.tool_type === 'MERGE' ? 'PDF Merger' : 
                       log.tool_type === 'COMPRESS' ? 'PDF Compressor' : 
                       log.tool_type === 'TO_TEXT' ? 'PDF to Text' : 
                       log.tool_type === 'IMG_TO_PDF' ? 'Image to PDF' : 
                       log.tool_type === 'PDF_TO_WORD' ? 'PDF to Word' : log.tool_type}
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
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Next.js Server: Online
            </div>
            
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Supabase Connection: Connected
            </div>

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