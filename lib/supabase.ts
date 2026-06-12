import { createClient } from '@supabase/supabase-js';

// Mengambil kunci dari file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Membuat dan mengekspor koneksi client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);