import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const formData = await req.formData();
  const file = formData.get('thumbnail') as File;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `${params.projectId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const filePath = `project-thumbnails/${params.projectId}/${filename}`;
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
  await prisma.project.update({
    where: { id: params.projectId },
    data: { thumbnail: url },
  });
  return NextResponse.json({ url });
} 