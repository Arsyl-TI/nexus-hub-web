import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const userId = formData.get('userId') as string || 'anonymous'; // TANGKAP ID

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Minimal harus mengunggah 1 gambar.' }, { status: 400 });
    }

    // Bungkus ulang semua gambar ke FormData baru untuk dikirim ke Python
    const pythonFormData = new FormData();
    files.forEach((file) => {
      pythonFormData.append('files', file);
    });

    const pythonServer = process.env.NEXT_PUBLIC_PYTHON_SERVER || 'http://localhost:5001';
    
    const pythonResponse = await fetch(`${pythonServer}/api/image-to-pdf`, {
      method: 'POST',
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
        throw new Error('Gagal mengubah gambar menjadi PDF.');
    }

    const pdfBuffer = await pythonResponse.arrayBuffer();
    const uniqueFilename = `img2pdf_${Date.now()}_${Math.floor(Math.random() * 1000)}.pdf`;

    const { error: storageError } = await supabase
      .storage
      .from('pdf-results')
      .upload(uniqueFilename, pdfBuffer, {
        contentType: 'application/pdf',
      });

    if (storageError) throw new Error(storageError.message);

    const { data: publicUrlData } = supabase.storage.from('pdf-results').getPublicUrl(uniqueFilename);
    const downloadUrl = publicUrlData.publicUrl;

    await supabase.from('activity_logs').insert([{
        user_id: userId,
        session_id: 'anonymous',
        tool_type: 'IMG_TO_PDF',
        input_files: files.map(f => f.name),
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