import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string || 'anonymous'; // TANGKAP ID

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file dokumen.' }, { status: 400 });
    }

    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    const pythonServer = process.env.NEXT_PUBLIC_PYTHON_SERVER || 'http://localhost:5001';
    
    // Kirim data ke Python server
    const pythonResponse = await fetch(`${pythonServer}/api/pdf-to-word`, {
      method: 'POST',
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
        throw new Error('Gagal mengonversi struktur PDF ke Word.');
    }

    // Ambil data buffer dokumen .docx
    const docxBuffer = await pythonResponse.arrayBuffer();
    const uniqueFilename = `docx_${Date.now()}_${Math.floor(Math.random() * 1000)}.docx`;

    // Unggah file Word ke Supabase Bucket
    const { error: storageError } = await supabase
      .storage
      .from('pdf-results')
      .upload(uniqueFilename, docxBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

    if (storageError) throw new Error(storageError.message);

    const { data: publicUrlData } = supabase.storage.from('pdf-results').getPublicUrl(uniqueFilename);
    const downloadUrl = publicUrlData.publicUrl;

    // Catat log kesuksesan di PostgreSQL
    await supabase.from('activity_logs').insert([{
        user_id: userId,
        session_id: 'anonymous',
        tool_type: 'PDF_TO_WORD',
        input_files: [file.name],
        output_file_url: downloadUrl,
        status: 'SUCCESS',
        error_details: null
    }]);

    return NextResponse.json({ success: true, url: downloadUrl });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}