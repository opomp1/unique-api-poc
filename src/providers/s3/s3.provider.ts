import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env, randomUUIDv7 } from 'bun';

const bucketName = env.AWS_S3_BUCKET_NAME || 'pdf-bucket';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  },
  // bucketEndpoint: bucketName,
  region: env.AWS_REGION || 'ap-southeast-7',
});

export async function uploadPdftoS3(pdfBuffer: Buffer) {
  const filename = `${randomUUIDv7()}.pdf`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    ACL: 'private',
    Body: pdfBuffer,
    ContentType: 'application/pdf',
  });

  await s3Client.send(command);

  // const fileFullPath = `https://${bucketName}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;

  return {
    filename,
    // fileFullPath,
    size: pdfBuffer.length,
  };
}

export async function getPdfUrl(filename: string) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filename,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return url;
}
