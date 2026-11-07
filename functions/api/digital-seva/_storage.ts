const BUCKET = 'digital-seva-preview-docs';

export interface StoredDocument {
  id: string;
  bookingId: string;
  documentType: string;
  objectKey: string;
  originalFileName: string;
  contentType: 'application/pdf' | 'image/jpeg' | 'image/png';
  sizeBytes: number;
  sha256: string;
}

function storageConfig(env: { SUPABASE_URL?: string; SUPABASE_SECRET_KEY?: string }) {
  const base = String(env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = String(env.SUPABASE_SECRET_KEY || '');
  if (!base || !key) throw new Error('Private document storage is not configured.');
  const parsed = new URL(base);
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) {
    throw new Error('Private document storage URL is invalid.');
  }
  return { base, key };
}

function objectUrl(base: string, objectKey: string) {
  const path = objectKey.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/${BUCKET}/${path}`;
}

export async function uploadPrivateDocument(
  env: { SUPABASE_URL?: string; SUPABASE_SECRET_KEY?: string },
  objectKey: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<void> {
  const { base, key } = storageConfig(env);
  const response = await fetch(objectUrl(base, objectKey), {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': contentType, 'x-upsert': 'false', 'Cache-Control': 'no-store' },
    body: bytes
  });
  if (!response.ok) {
    console.error('Supabase document upload failed with status:', response.status);
    throw new Error('A document could not be stored securely.');
  }
}

export async function deletePrivateDocument(
  env: { SUPABASE_URL?: string; SUPABASE_SECRET_KEY?: string },
  objectKey: string
): Promise<void> {
  const { base, key } = storageConfig(env);
  const response = await fetch(objectUrl(base, objectKey), {
    method: 'DELETE',
    headers: { apikey: key, 'Cache-Control': 'no-store' }
  });
  if (!response.ok && response.status !== 404) {
    console.error('Supabase document deletion failed with status:', response.status);
    throw new Error('The stored document could not be deleted.');
  }
}

export async function createPrivateDocumentUrl(
  env: { SUPABASE_URL?: string; SUPABASE_SECRET_KEY?: string },
  objectKey: string,
  expiresIn = 60,
  downloadName?: string
): Promise<string> {
  const { base, key } = storageConfig(env);
  const path = objectKey.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${base}/storage/v1/object/sign/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ expiresIn, ...(downloadName ? { download: downloadName } : {}) })
  });
  if (!response.ok) {
    console.error('Supabase signed URL creation failed with status:', response.status);
    throw new Error('A secure document link could not be created.');
  }
  const data = await response.json() as { signedURL?: string };
  if (!data.signedURL) throw new Error('Supabase did not return a secure document link.');
  return data.signedURL.startsWith('http') ? data.signedURL : `${base}/storage/v1${data.signedURL.startsWith('/') ? data.signedURL : `/${data.signedURL}`}`;
}

export const DOCUMENT_BUCKET_NAME = BUCKET;
