import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string || 'anonymous'; // TANGKAP ID

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file.' }, { status: 400 });
    }

    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    const pythonServer = process.env.NEXT_PUBLIC_PYTHON_SERVER || 'http://localhost:5001';
    
    // Kirim ke server Python
    const pythonResponse = await fetch(`${pythonServer}/api/pdf-to-images`, {
      method: 'POST',
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
        throw new Error('Gagal mengekstrak gambar dari PDF.');
    }

    // Tangkap file ZIP dari Python
    const zipBuffer = await pythonResponse.arrayBuffer();

    // Buat nama unik dan simpan ke Supabase Storage
    const uniqueFilename = `images_${Date.now()}_${Math.floor(Math.random() * 1000)}.zip`;

    const { error: storageError } = await supabase
      .storage
      .from('pdf-results')
      // Pastikan content-type diatur sebagai file ZIP
      .upload(uniqueFilename, zipBuffer, {
        contentType: 'application/zip', 
      });

    if (storageError) throw new Error(storageError.message);

    const { data: publicUrlData } = supabase.storage.from('pdf-results').getPublicUrl(uniqueFilename);
    const downloadUrl = publicUrlData.publicUrl;

    await supabase.from('activity_logs').insert([{
        user_id: userId,
        session_id: 'anonymous',
        tool_type: 'TO_IMAGE',
        input_files: [file.name],
        output_file_url: downloadUrl,
        status: 'SUCCESS',
        error_details: null
    }]);

    return NextResponse.json({ success: true, url: downloadUrl });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    console.error("🚨 ERROR TO-IMAGE:", errorMessage);
    
    await supabase.from('activity_logs').insert([{
        session_id: 'anonymous',
        tool_type: 'TO_IMAGE',
        input_files: [],
        output_file_url: null,
        status: 'FAILED',
        error_details: errorMessage
    }]);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}