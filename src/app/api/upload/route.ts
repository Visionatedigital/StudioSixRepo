import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `upload-${randomUUID()}.${fileExtension}`;
    const userId = session.user.id || session.user.email;
    const filePath = `general/${userId}/${fileName}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { error: uploadError } = await supabase.storage
      .from('all-uploads')
      .upload(filePath, buffer, { upsert: true, contentType: file.type });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    const { data: publicUrlData } = supabase.storage
      .from('all-uploads')
      .getPublicUrl(filePath);
    const url = publicUrlData?.publicUrl;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 