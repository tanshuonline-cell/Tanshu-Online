const PREVIEW_BUCKET = 'digital-seva-preview-docs';

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

type StorageEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  DIGITAL_SEVA_STORAGE_BUCKET?: string;
  CASHFREE_ENVIRONMENT?: string;
};

function storageConfig(env: StorageEnv) {
  const base = String(env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = String(env.SUPABASE_SECRET_KEY || '');
  // Preserve the already-working Preview bucket, but never let Production fall back to it.
  const bucket = String(env.DIGITAL_SEVA_STORAGE_BUCKET ||
    (env.CASHFREE_ENVIRONMENT === 'SANDBOX' ? PREVIEW_BUCKET : '')).trim();
  if (!base || !key) throw new Error('Private document storage is not configured.');
  if (!bucket || !/^[a-z0-9][a-z0-9._-]{1,62}$/.test(bucket)) {
    throw new Error('A dedicated Digital Seva document bucket must be configured for this environment.');
  }
  const parsed = new URL(base);
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) {
    throw new Error('Private document storage URL is invalid.');
  }
  return { base, key, bucket };
}

function objectUrl(base: string, bucket: string, objectKey: string) {
  const path = objectKey.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/${encodeURIComponent(bucket)}/${path}`;
}

export async function uploadPrivateDocument(
  env: StorageEnv,
  objectKey: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<void> {
  const { base, key, bucket } = storageConfig(env);
  const response = await fetch(objectUrl(base, bucket, objectKey), {
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
  env: StorageEnv,
  objectKey: string
): Promise<void> {
  const { base, key, bucket } = storageConfig(env);
  const response = await fetch(objectUrl(base, bucket, objectKey), {
    method: 'DELETE',
    headers: { apikey: key, 'Cache-Control': 'no-store' }
  });
  if (!response.ok && response.status !== 404) {
    console.error('Supabase document deletion failed with status:', response.status);
    throw new Error('The stored document could not be deleted.');
  }
}

export async function createPrivateDocumentUrl(
  env: StorageEnv,
  objectKey: string,
  expiresIn = 60,
  downloadName?: string
): Promise<string> {
  const { base, key, bucket } = storageConfig(env);
  const path = objectKey.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${base}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${path}`, {
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

// Kept for compatibility with existing imports; runtime requests always use the
// environment-specific bucket resolved by storageConfig().
export const DOCUMENT_BUCKET_NAME = PREVIEW_BUCKET;
