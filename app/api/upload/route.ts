import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { unauthorizedResponse } from '@/lib/response';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse()
    } 
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Only allow image files
    if (!file.type.startsWith('image/')) {
      return Response.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
    }

    // Generate a unique filename
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Return public URL (absolute for frontend)
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/uploads/${filename}`;
    return Response.json({ success: true, url });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}