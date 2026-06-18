"use client";

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Activity, ArrowRight, ShieldCheck, Zap, Layers, Moon, Sun } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah login agar tombol berubah secara dinamis
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsLoggedIn(true);
      
      requestAnimationFrame(() => setMounted(true));
    };
    checkSession();
  }, []);

  if (!mounted) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900"></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 flex flex-col">
      
      {/* NAVBAR */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Nexus Hub</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <Link 
            href={isLoggedIn ? "/dashboard" : "/login"} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition-colors shadow-md"
          >
            {isLoggedIn ? "Masuk Dashboard" : "Login"}
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-grow flex flex-col justify-center items-center px-4 text-center">
        <div className="max-w-4xl mx-auto py-20">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold border border-blue-200 dark:border-blue-800">
            ✨ Proyek Implementasi & Pengujian Perangkat Lunak
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
            Kelola Dokumen PDF Anda <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
              Lebih Cepat & Pintar
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Satu platform tangguh untuk menggabungkan, mengompresi, mengekstrak, dan mengubah format dokumen Anda tanpa iklan dan tanpa mengorbankan privasi.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href={isLoggedIn ? "/dashboard" : "/login"} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 text-lg"
            >
              {isLoggedIn ? "Buka Dashboard Saya" : "Mulai Gunakan Gratis"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="w-full max-w-6xl mx-auto py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Eksekusi Sekejap</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Didukung oleh mesin backend Python Microservice khusus untuk memastikan manipulasi file berat diproses tanpa hambatan.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Privasi Terjamin</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              File Anda akan otomatis dibersihkan dari server (*Garbage Collection*) seketika setelah proses pengunduhan selesai.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Layers className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">5 Alat Terintegrasi</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Mulai dari penggabung PDF, ekstraksi gambar, konversi ke Word, hingga reduksi ukuran file tersedia di satu tempat.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Nexus Hub. Didesain dengan standar Enterprise untuk mata kuliah IPPL.</p>
      </footer>

    </div>
  );
}