"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Activity, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State Loading dipisah agar tombol yang berputar (spin) tidak bersamaan
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false); 
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- 1. FUNGSI LOGIN / REGISTER REGULER ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        await supabase.auth.signInWithPassword({ email, password });
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem.';
      setErrorMsg(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. FUNGSI LOGIN DEMO / GUEST ---
  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setErrorMsg(null);

    try {
      // PERHATIAN: Masukkan email dan password akun demo Anda di bawah ini
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@nexushub.com', 
        password: 'demo123', 
      });
      
      if (error) throw error;
      router.push('/dashboard');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Gagal masuk ke akun Demo.';
      setErrorMsg(errMsg);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-sm">
            <Activity className="text-white w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
          {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Nexus Hub'}
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm">
          Akses alat utilitas dokumen PDF dengan aman dan privat.
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm text-center font-medium">
            🚨 {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="email"
              required
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="password"
              required
              placeholder="Kata Sandi (Min. 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isDemoLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? 'Memproses...' : (isLogin ? 'Masuk ke Sistem' : 'Daftar Sekarang')}
          </button>
        </form>

        {/* --- GARIS PEMISAH (SEPARATOR) --- */}
        <div className="relative flex items-center justify-center w-full my-6 border-t border-slate-200 dark:border-slate-700">
          <span className="absolute px-4 text-xs font-semibold text-slate-400 bg-white dark:bg-slate-800 uppercase tracking-wider">
            Atau
          </span>
        </div>

        {/* --- TOMBOL DEMO LOGIN --- */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading || isDemoLoading}
          className="w-full bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50 font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center"
        >
          {isDemoLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          {isDemoLoading ? 'Menghubungkan...' : 'Masuk sebagai Guest (Demo)'}
        </button>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            {isLogin ? 'Belum punya akun? Daftar di sini.' : 'Sudah punya akun? Masuk di sini.'}
          </button>
        </div>
      </div>
    </div>
  );
}