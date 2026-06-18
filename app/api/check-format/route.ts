import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string || 'anonymous';

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada dokumen.' }, { status: 400 });
    }

    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    const pythonServer = process.env.NEXT_PUBLIC_PYTHON_SERVER || 'http://localhost:5001';
    
    const pythonResponse = await fetch(`${pythonServer}/api/check-format`, {
      method: 'POST',
      body: pythonFormData,
    });

    const data = await pythonResponse.json();
    if (!pythonResponse.ok) throw new Error(data.error || 'Gagal mengecek format dokumen.');

    let previewUrl = null;

    // --- UBAH BASE64 MENJADI FILE FISIK & UNGGAH KE SUPABASE ---
    if (data.pdf_base64) {
      const pdfBuffer = Buffer.from(data.pdf_base64, 'base64');
      const uniqueFilename = `annotated_${Date.now()}_${Math.floor(Math.random() * 1000)}.pdf`;

      const { error: storageError } = await supabase
        .storage
        .from('pdf-results')
        .upload(uniqueFilename, pdfBuffer, {
          contentType: 'application/pdf',
        });

      if (!storageError) {
        const { data: publicUrlData } = supabase.storage.from('pdf-results').getPublicUrl(uniqueFilename);
        previewUrl = publicUrlData.publicUrl;
      }
    }

    await supabase.from('activity_logs').insert([{
        user_id: userId,
        session_id: 'authenticated',
        tool_type: 'FORMAT_CHECK',
        input_files: [file.name],
        output_file_url: previewUrl,
        status: 'SUCCESS',
        error_details: null
    }]);

    // Kembalikan Data Hasil beserta URL Previewnya
    return NextResponse.json({ success: true, results: data.results, previewUrl });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}