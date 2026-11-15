const PREVIEW_BUCKET = 'digital-seva-preview-docs';
type StorageEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  DIGITAL_SEVA_STORAGE_BUCI?: string;
  DIGITAL_SEVA_STORAGE_BUCKET?: string;
  CF_PAGES_BRANCH?: string;
};

function bucketName(env: StorageEnv): string {
  // DIGITAL_SEVA_STORAGE_BUCI is the intentionally configured production
  // variable name. Keep BUCKET as a backwards-compatible alias.
  const configured = String(env.DIGITAL_SEVA_STORAGE_BUCI || env.DIGITAL_SEVA_STORAGE_BUCKET || '').trim();
  if (configured) return configured;
  if (String(env.CF_PAGES_BRANCH || '').toLowerCase() === 'main') {
    throw new Error('Production Digital Seva document storage bucket is not configured.');
  }
  return PREVIEW_BUCKET;
}

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

function storageConfig(env: StorageEnv) {
  const base = String(env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = String(env.SUPABASE_SECRET_KEY || '');
  if (!base || !key) throw new Error('Private document storage is not configured.');
  const parsed = new URL(base);
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) {
    throw new Error('Private document storage URL is invalid.');
  }
  return { base, key, bucket: bucketName(env) };
}

function storageHeaders(key: string, extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { apikey: key, ...extra };
  // Legacy Supabase service_role keys are JWTs and must also be sent as a
  // Bearer token so Storage evaluates requests with the service_role.
  // New sb_secret_* API keys are opaque keys, not JWTs; send those via apikey only.
  if (key.startsWith('eyJ') && key.split('.').length === 3) {
    headers.Authorization = \`Bearer \${key}\`;
  }
  return headers;
}

function objectUrl(base: string, bucket: string, objectKey: string) {
  const path = objectKey.split('/').map(encodeURIComponent).join('/');
  return \`\${base}/storage/v1/object/\${bucket}/\${path}\`;
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
    headers: storageHeaders(key, { 'Content-Type': contentType, 'x-upsert': 'false', 'Cache-Control': 'no-store' }),
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
    headers: storageHeaders(key, { 'Cache-Control': 'no-store' })
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
  const response = await fetch(\`\${base}/storage/v1/object/sign/\${bucket}/\${path}\`, {
    method: 'POST',
    headers: storageHeaders(key, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }),
    body: JSON.stringify({ expiresIn, ...(downloadName ? { download: downloadName } : {}) })
  });
  if (!response.ok) {
    console.error('Supabase signed URL creation failed with status:', response.status);
    throw new Error('A secure document link could not be created.');
  }
  const data = await response.json() as { signedURL?: string };
  if (!data.signedURL) throw new Error('Supabase did not return a secure document link.');
  return data.signedURL.startsWith('http') ? data.signedURL : \`\${base}/storage/v1\${data.signedURL.startsWith('/') ? data.signedURL : \`/\${data.signedURL}\`}\`;
}

export const DOCUMENT_BUCKET_NAME = PREVIEW_BUCKET;
