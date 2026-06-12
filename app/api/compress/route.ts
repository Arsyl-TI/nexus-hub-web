import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file.' }, { status: 400 });
    }

    // Simpan ukuran asli untuk perhitungan persentase di UI
    const originalSize = file.size;

    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    // Kirim ke server Python
    const pythonResponse = await fetch('http://localhost:5001/api/compress-pdf', {
      method: 'POST',
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
        throw new Error('Gagal memproses file di server pemroses.');
    }

    // Tangkap data file PDF (dalam bentuk buffer bita) dari Python
    const compressedBuffer = await pythonResponse.arrayBuffer();
    const compressedSize = compressedBuffer.byteLength;

    // Buat nama unik dan simpan ke Supabase Storage
    const uniqueFilename = `compressed_${Date.now()}_${Math.floor(Math.random() * 1000)}.pdf`;

    const { error: storageError } = await supabase
      .storage
      .from('pdf-results')
      .upload(uniqueFilename, compressedBuffer, {
        contentType: 'application/pdf',
      });

    if (storageError) throw new Error(storageError.message);

    const { data: publicUrlData } = supabase.storage.from('pdf-results').getPublicUrl(uniqueFilename);
    const downloadUrl = publicUrlData.publicUrl;

    // Catat log kesuksesan
    await supabase.from('activity_logs').insert([{
        session_id: 'anonymous',
        tool_type: 'COMPRESS',
        input_files: [file.name],
        output_file_url: downloadUrl,
        status: 'SUCCESS',
        error_details: null
    }]);

    // Kembalikan URL beserta detail ukurannya agar bisa dipamerkan di layar!
    return NextResponse.json({ 
        success: true, 
        url: downloadUrl,
        originalSize,
        compressedSize 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    console.error("🚨 LOG ERROR TERMINAL:", errorMessage);
    
    await supabase.from('activity_logs').insert([{
        session_id: 'anonymous',
        tool_type: 'COMPRESS',
        input_files: [],
        output_file_url: null,
        status: 'FAILED',
        error_details: errorMessage
    }]);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}