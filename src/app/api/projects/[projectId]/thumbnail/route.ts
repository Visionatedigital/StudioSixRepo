import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const formData = await req.formData();
  const file = formData.get('thumbnail') as File;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Save file to /public/uploads/projects/
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'projects');
  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = `${params.projectId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const filepath = path.join(uploadsDir, filename);
  await fs.writeFile(filepath, buffer);

  const url = `/uploads/projects/${filename}`;

  // Update project in DB
  await prisma.project.update({
    where: { id: params.projectId },
    data: { thumbnail: url },
  });

  return NextResponse.json({ url });
} 