import { S3Client, PutObjectCommand, GetObjectCommand, PutObjectCommandInput, PutObjectCommandOutput,  } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest } from 'next/server';
import { unauthorizedResponse } from '@/lib/response';
import { AuthService } from '@/lib/auth';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  //authentication and authorization checks can be added here
  const user = AuthService.getUserFromRequest(req);
  if (!user || user.role !== 'admin') return unauthorizedResponse();

  const { filename, fileType } = await req.json();

  const key = `images/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return new Response(JSON.stringify({ url: signedUrl, key }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
