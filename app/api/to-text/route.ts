import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah.' }, { status: 400 });
    }

    // MEMBUNGKUS ULANG FILE SEBELUM DIKIRIM KE PYTHON
    // Ini mencegah error boundary pada fetch bawaan Node.js
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    // Tambahkan baris ini untuk memanggil URL dari .env
    const pythonServer = process.env.NEXT_PUBLIC_PYTHON_SERVER || 'http://localhost:5001';

    const pythonResponse = await fetch(`${pythonServer}/api/extract-text`, {
      method: 'POST',
      body: pythonFormData, 
    });

    const pythonData = await pythonResponse.json();

    if (!pythonResponse.ok) {
        throw new Error(pythonData.error || 'Server pemroses teks gagal.');
    }

    const extractedText = pythonData.text;
    const txtBuffer = Buffer.from(extractedText, 'utf-8');
    const uniqueFilename = `extracted_${Date.now()}_${Math.floor(Math.random() * 1000)}.txt`;

    const { error: storageError } = await supabase
      .storage
      .from('pdf-results')
      .upload(uniqueFilename, txtBuffer, {
        contentType: 'text/plain',
      });

    if (storageError) throw new Error(storageError.message);

    const { data: publicUrlData } = supabase.storage.from('pdf-results').getPublicUrl(uniqueFilename);
    const downloadUrl = publicUrlData.publicUrl;

    await supabase.from('activity_logs').insert([{
        session_id: 'anonymous',
        tool_type: 'TO_TEXT',
        input_files: [file.name],
        output_file_url: downloadUrl,
        status: 'SUCCESS',
        error_details: null
    }]);

    return NextResponse.json({ success: true, url: downloadUrl });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    
    // MUNCULKAN ERROR DI TERMINAL AGAR MUDAH DILACAK
    console.error("🚨 LOG ERROR TERMINAL:", errorMessage);
    
    await supabase.from('activity_logs').insert([{
        session_id: 'anonymous',
        tool_type: 'TO_TEXT',
        input_files: [],
        output_file_url: null,
        status: 'FAILED',
        error_details: errorMessage
    }]);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}