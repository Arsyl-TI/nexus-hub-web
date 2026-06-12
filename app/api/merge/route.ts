import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 1. Tangkap data file yang dikirim dari Frontend
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: 'Minimal harus mengunggah 2 file PDF untuk digabungkan.' },
        { status: 400 }
      );
    }

    // Siapkan array untuk menyimpan nama file (untuk keperluan log database)
    const fileNames = files.map((f) => f.name);

    // 2. Buat dokumen PDF kosong baru menggunakan pdf-lib
    const mergedPdf = await PDFDocument.create();

    // 3. Looping semua file yang diunggah dan gabungkan halamannya
    for (const file of files) {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    // 4. Simpan hasil gabungan menjadi bita memori (Uint8Array)
    const mergedPdfBytes = await mergedPdf.save();

    // 5. Buat nama file unik untuk disimpan ke Supabase Storage
    const uniqueFilename = `merged_${Date.now()}_${Math.floor(Math.random() * 1000)}.pdf`;

    // 6. Unggah ke Supabase Storage (Bucket: pdf-results)
    // PERBAIKAN: Menghapus variabel 'storageData' karena tidak digunakan
    const { error: storageError } = await supabase
      .storage
      .from('pdf-results')
      .upload(uniqueFilename, mergedPdfBytes, {
        contentType: 'application/pdf',
      });

    if (storageError) throw new Error(storageError.message);

    // Dapatkan URL publik agar file bisa didownload user
    const { data: publicUrlData } = supabase.storage.from('pdf-results').getPublicUrl(uniqueFilename);
    const downloadUrl = publicUrlData.publicUrl;

    // 7. Catat aktivitas ini ke Database Supabase (activity_logs)
    await supabase.from('activity_logs').insert([
      {
        session_id: 'anonymous', 
        tool_type: 'MERGE',
        input_files: fileNames,
        output_file_url: downloadUrl,
        status: 'SUCCESS',
        error_details: null
      }
    ]);

    // 8. Kembalikan respons sukses beserta link download ke Frontend
    return NextResponse.json({ success: true, url: downloadUrl });

  // PERBAIKAN: Mengubah tipe 'any' menjadi 'unknown' yang merupakan standar TypeScript aman
  } catch (error: unknown) {
    // Memastikan tipe error adalah Object Error standar
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    console.error("Terjadi kesalahan:", errorMessage);
    
    // Jika gagal, catat error ke database
    await supabase.from('activity_logs').insert([
      {
        session_id: 'anonymous',
        tool_type: 'MERGE',
        input_files: [],
        output_file_url: null,
        status: 'FAILED',
        error_details: errorMessage
      }
    ]);

    return NextResponse.json({ error: errorMessage || 'Gagal memproses file' }, { status: 500 });
  }
}