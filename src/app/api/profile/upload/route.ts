import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate type parameter
    if (!type || (type !== 'avatar' && type !== 'banner')) {
      return NextResponse.json({ error: 'Invalid image type. Must be "avatar" or "banner"' }, { status: 400 });
    }

    // Create unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const extension = file.type.split('/')[1];
    const filename = `${type}-${hash}.${extension}`;
    const userId = session.user.id || session.user.email;

    // Upload to Supabase Storage
    const filePath = `profile-pictures/${userId}/${filename}`;
    const { error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(filePath, buffer, { upsert: true, contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData?.publicUrl;

    // Update user profile in database with the image URL
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(type === 'avatar' ? { image: imageUrl } : { bannerImage: imageUrl }),
      },
    });

    // Return the response with the image URL
    return NextResponse.json({
      message: 'Image uploaded successfully',
      imageUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 