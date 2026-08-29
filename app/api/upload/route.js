import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFile } from '@/services/storage';
import { verifyCloudinaryConnection } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = {
  resumes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  avatars: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  companies: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ],
};

const MAX_FILE_SIZE = {
  resumes: 10 * 1024 * 1024, // 10MB
  avatars: 5 * 1024 * 1024,   // 5MB
  companies: 5 * 1024 * 1024, // 5MB
};

export async function GET() {
  try {
    const connectionStatus = await verifyCloudinaryConnection();
    return NextResponse.json({
      success: true,
      cloudinary: connectionStatus,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'resumes';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate MIME Type
    const allowedMime = ALLOWED_MIME_TYPES[folder] || ALLOWED_MIME_TYPES.resumes;
    if (file.type && !allowedMime.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type "${file.type}". Allowed formats for ${folder}: ${allowedMime.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate File Size
    const maxSize = MAX_FILE_SIZE[folder] || MAX_FILE_SIZE.resumes;
    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      return NextResponse.json(
        {
          error: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of ${sizeMB}MB`,
        },
        { status: 400 }
      );
    }

    const result = await uploadFile(file, folder);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
