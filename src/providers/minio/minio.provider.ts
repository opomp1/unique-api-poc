import { env, randomUUIDv7 } from 'bun';
import { Client } from 'minio';

const minioClient = new Client({
  accessKey: env.MINIO_ACCESS_KEY || 'minio',
  endPoint: env.MINIO_URL || 'localhost',
  port: Number(env.MINIO_PORT) || 9000,
  secretKey: env.MINIO_SECRET_KEY || 'miniosecretkey',
  useSSL: env.MINIO_USE_SSL === 'true',
});

const bucketName = env.MINIO_BUCKET_NAME || 'pdf';

const minioConnectionString = (() => {
  const protocol = env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const url = env.MINIO_PORT
    ? `${env.MINIO_URL}:${env.MINIO_PORT}`
    : env.MINIO_URL;
  return `${protocol}://${url || 'localhost:9000'}`;
 
})();

export async function uploadPdf(pdfBuffer: Buffer) {
  const filename = `${randomUUIDv7()}.pdf`;
  const filepath = `/${bucketName}/${filename}`;

  await minioClient.putObject(
    bucketName,
    filename,
    pdfBuffer,
    pdfBuffer.length,
    { 'Content-Type': 'application/pdf' }
  );

  return {
    filename,
    filepath,
    fileFullPath: `${minioConnectionString}${filepath}`,
    size: pdfBuffer.length,
  };
}
