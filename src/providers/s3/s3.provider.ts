import { env, randomUUIDv7, S3Client } from 'bun';

const bucketName = env.AWS_S3_BUCKET_NAME || 'pdf-bucket';

const s3Client = new S3Client({
  accessKeyId: env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  bucket: bucketName,
  region: env.AWS_REGION || 'ap-southeast-7',
});


export async function uploadPdftoS3(pdfBuffer: Buffer) {
  const filename = `${randomUUIDv7()}.pdf`;

  await s3Client.write(filename, pdfBuffer, {
    type: 'application/pdf',
  });

  const fileFullPath = `https://${bucketName}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;

  return {
    filename,
    fileFullPath,
    size: pdfBuffer.length,
  };
}