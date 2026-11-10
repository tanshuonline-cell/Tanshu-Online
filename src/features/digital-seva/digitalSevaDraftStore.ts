const DB_NAME = 'tanshu-digital-seva-drafts';
const STORE_NAME = 'service-drafts';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface DigitalSevaDraftRecord {
  serviceId: string;
  savedAt: number;
  data: Record<string, unknown>;
}

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Browser draft storage is unavailable.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'serviceId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open draft storage.'));
  });
}

export async function loadDigitalSevaDraft(serviceId: string): Promise<DigitalSevaDraftRecord | null> {
  const db = await openDraftDb();
  try {
    const record = await new Promise<DigitalSevaDraftRecord | undefined>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(serviceId);
      request.onsuccess = () => resolve(request.result as DigitalSevaDraftRecord | undefined);
      request.onerror = () => reject(request.error);
    });
    if (!record) return null;
    if (!record.savedAt || Date.now() - record.savedAt > DRAFT_TTL_MS) {
      await deleteDigitalSevaDraft(serviceId);
      return null;
    }
    return record;
  } finally {
    db.close();
  }
}

export async function saveDigitalSevaDraft(serviceId: string, data: Record<string, unknown>): Promise<void> {
  const db = await openDraftDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ serviceId, savedAt: Date.now(), data } satisfies DigitalSevaDraftRecord);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Draft save was interrupted.'));
    });
  } finally {
    db.close();
  }
}

export async function deleteDigitalSevaDraft(serviceId: string): Promise<void> {
  const db = await openDraftDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(serviceId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Draft cleanup was interrupted.'));
    });
  } finally {
    db.close();
  }
}
