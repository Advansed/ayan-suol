/**
 * Загрузка файлов.
 * - getUrl / uploadFileToMinIO — публичный бакет (legacy)
 * - uploadFotos / getFotos — приватные документы (паспорт, фото заказа)
 */

import { URL as API_BASE } from '../Store/api';
import { loginGetters } from '../Store/loginStore';

export interface UploadResult {
  filePath: string;
  /** Публичный URL (чат / getUrl) */
  url?: string;
  /** Signed URL для просмотра из приватного бакета (getSignUrl / getFotos) */
  signUrl?: string;
}

export interface UploadParams {
  cargo_id: string;
  recipient_id: string;
  token: string;
  type?: string;
  kind?: string;
}

/**
 * Конвертирует dataUrl (base64) в File
 */
export const dataUrlToFile                      = (dataUrl: string, filename = 'image.jpg'): File => {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  let mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  if (mime === 'image/jpg') mime = 'image/jpeg';
  const bstr = atob(arr[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const extFromMime = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const hasExt = /\.[^.]+$/.test(filename);
  const name = hasExt ? filename : `${filename}.${extFromMime}`;
  return new File([u8arr], name, { type: mime });
};

export const getImageExtension                  = (imageFile: string | File): string => {
  const normalizeExt = (ext: string) => {
    const value = ext.toLowerCase().replace('jpeg', 'jpg').replace('heic', 'jpg').replace('heif', 'jpg');
    return ['jpg', 'png', 'webp', 'gif'].includes(value) ? value : 'jpg';
  };

  if (typeof imageFile === 'string') {
    const mimeMatch = imageFile.split(',')[0]?.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    return normalizeExt(mime.split('/')[1] || 'jpg');
  }
  const fromName = imageFile.name.split('.').pop();
  if (fromName) return normalizeExt(fromName);
  const mime = imageFile.type || 'image/jpeg';
  return normalizeExt(mime.split('/')[1] || 'jpg');
};

const uniqueFilename                            = (original: string): string => {
  const ext = getImageExtension(original.includes('.') ? original : `file.${original}`);
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
};

const MAX_IMAGE_EDGE = 1280;
const TARGET_UPLOAD_BYTES = 400 * 1024;
const HARD_MAX_UPLOAD_BYTES = 500 * 1024;
const UPLOAD_RETRIES = 2;
const UPLOAD_RETRY_MS = 700;

const dataUrlByteLength = (dataUrl: string): number => {
  const payload = dataUrl.split(',')[1] || '';
  return Math.ceil((payload.length * 3) / 4);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${Math.max(0, bytes)} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
};

export const getDataUrlSize = (dataUrl: string): number => dataUrlByteLength(dataUrl);

const canvasSupportsWebp = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
};

const OUTPUT_MIME = canvasSupportsWebp() ? 'image/webp' : 'image/jpeg';

const bitmapToCompressedDataUrl = (bitmap: ImageBitmap, maxEdge: number, quality: number): string => {
  const edge = Math.max(bitmap.width, bitmap.height) || 1;
  let width = bitmap.width;
  let height = bitmap.height;
  if (edge > maxEdge) {
    const ratio = maxEdge / edge;
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Не удалось обработать фото');
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL(OUTPUT_MIME, quality);
};

/** Ресайз + WebP (или JPEG, если браузер не умеет WebP), чтобы уложиться в лимит uploadFotos. */
export const compressImageDataUrl = async (dataUrl: string): Promise<string> => {
  if (!dataUrl.startsWith('data:image/')) return dataUrl;

  const blob = dataUrlToFile(dataUrl, 'source.jpg');
  const before = blob.size;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    throw new Error('Не удалось обработать фото. Снимите кадр ещё раз в JPEG.');
  }

  try {
    let edge = Math.min(MAX_IMAGE_EDGE, Math.max(bitmap.width, bitmap.height));
    let quality = 0.72;
    let best = bitmapToCompressedDataUrl(bitmap, edge, quality);

    for (let i = 0; i < 6 && dataUrlByteLength(best) > TARGET_UPLOAD_BYTES; i++) {
      quality = Math.max(0.32, quality - 0.1);
      edge = Math.max(640, Math.round(edge * 0.8));
      best = bitmapToCompressedDataUrl(bitmap, edge, quality);
    }

    const after = dataUrlByteLength(best);
    console.log(
      `[фото] сжато: ${formatFileSize(before)} → ${formatFileSize(after)}` +
        ` (${OUTPUT_MIME.replace('image/', '')}, ${bitmap.width}×${bitmap.height} → max ${edge}px)`
    );

    if (after > HARD_MAX_UPLOAD_BYTES) {
      throw new Error('Не удалось загрузить фото: файл слишком большой.');
    }
    return best;
  } finally {
    bitmap.close();
  }
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const isTransientFetchError = (err: unknown): boolean => {
  const msg = err instanceof Error ? err.message : String(err);
  return /failed to fetch|load failed|networkerror|network request failed|the network connection was lost/i.test(msg);
};

export const uploadFileToMinIO                  = async (
  file: File | Blob,
  params: UploadParams
): Promise<UploadResult> => {
  const filename = file instanceof File ? file.name : uniqueFilename('image.jpg');
  const safeFilename = uniqueFilename(filename);

  const searchParams = new URLSearchParams({
    filename: safeFilename,
    cargo_id: params.cargo_id,
    token: params.token,
    recipient_id: params.recipient_id,
  });

  if (params.type) searchParams.set('type', params.type);
  if (params.kind) searchParams.set('kind', params.kind);

  const res = await fetch(`${API_BASE}/api/getUrl?${searchParams}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const { uploadUrl, filePath, publicUrl: url } = data;

  if (!uploadUrl) {
    throw new Error('Сервер не вернул uploadUrl');
  }

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': '',
    },
  });

  if (!uploadRes.ok) {
    throw new Error(`Ошибка загрузки файла: HTTP ${uploadRes.status}`);
  }

  return { filePath, url };
};

/**
 * Универсальная загрузка документов (паспорт и др.) через multipart FormData.
 * @param imageFile - dataUrl или File
 * @param filename - ключ в S3, напр. {userId}/passport/passport_front.jpg
 */
export const uploadFileToDocs = async (
  imageFile: string | File,
  filename: string
): Promise<{ filePath: string; signUrl?: string }> => {
  const token = loginGetters.getToken();
  if (!token) {
    throw new Error('Нет токена авторизации');
  }

  const key = filename.startsWith('/') ? filename.slice(1) : filename;
  const source =
    typeof imageFile === 'string' ? imageFile : await fileToDataUrl(imageFile);
  const compressed = await compressImageDataUrl(source);
  const ext = getImageExtension(compressed);
  const fileName = (key.split('/').pop() || `image.${ext}`).replace(/\.[^.]+$/, `.${ext}`);
  const file = dataUrlToFile(compressed, fileName);
  const uploadKey = key.replace(/\.[^.]+$/, '') + `.${ext}`;

  if (file.size > HARD_MAX_UPLOAD_BYTES) {
    throw new Error('Не удалось загрузить фото: файл слишком большой.');
  }

  console.log(
    `[фото] отправка в API uploadFotos: ${formatFileSize(file.size)}, ${file.type || ext}, ключ ${uploadKey}`
  );

  let lastError: unknown;
  let res: Response | undefined;

  for (let attempt = 0; attempt < UPLOAD_RETRIES; attempt++) {
    const form = new FormData();
    form.append('token', token);
    form.append('filename', uploadKey);
    form.append('file', file, file.name);

    try {
      res = await fetch(`${API_BASE}/api/uploadFotos`, {
        method: 'POST',
        body: form,
      });
      lastError = undefined;
      break;
    } catch (err) {
      lastError = err;
      if (attempt < UPLOAD_RETRIES - 1 && isTransientFetchError(err)) {
        await sleep(UPLOAD_RETRY_MS);
        continue;
      }
      if (isTransientFetchError(err)) {
        throw new Error('Не удалось загрузить фото. Файл слишком большой или нет связи с сервером.');
      }
      throw err;
    }
  }

  if (lastError) {
    if (isTransientFetchError(lastError)) {
      throw new Error('Не удалось загрузить фото. Файл слишком большой или нет связи с сервером.');
    }
    throw lastError;
  }
  if (!res) throw new Error('Не удалось загрузить фото');

  if (res.status === 413) {
    throw new Error('Не удалось загрузить фото: файл слишком большой.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data?.success === false) {
    throw new Error(data.message || 'Ошибка загрузки файла');
  }

  const filePath = data.filePath || data.filename || uploadKey;
  return {
    filePath,
    signUrl: getFotosUrl(filePath, token),
  };
};

/**
 * Фото по заказу: ключ cargo_id/recipient_id/filename через uploadFotos.
 */
export const uploadOrderPhoto = async (
  imageFile: string | File,
  params: { cargo_id: string; recipient_id: string }
): Promise<{ filePath: string; signUrl?: string }> => {
  const baseName =
    typeof imageFile === 'string'
      ? `image.${getImageExtension(imageFile)}`
      : imageFile.name || 'image.jpg';
  const safeFilename = uniqueFilename(baseName);
  const key = `${params.cargo_id}/${params.recipient_id}/${safeFilename}`;
  return uploadFileToDocs(imageFile, key);
};

/**
 * Фото транспорта: ключ {userId}/profile/transport/{vehicleId}.{ext}
 */
export const uploadTransportPhoto = async (
  imageFile: string | File,
  vehicleId?: string
): Promise<{ filePath: string; signUrl?: string }> => {
  const userId = loginGetters.getUserId();
  if (!userId) {
    throw new Error('Нет идентификатора пользователя');
  }
  const ext = getImageExtension(imageFile);
  const slug = String(vehicleId || `new_${Date.now()}`)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 48) || `new_${Date.now()}`;
  const key = `${userId}/profile/transport/${slug}.${ext}`;
  return uploadFileToDocs(imageFile, key);
};

/**
 * Фото профиля: ключ {userId}/profile/avatar.{ext}
 */
export const uploadProfilePhoto = async (
  imageFile: string | File
): Promise<{ filePath: string; signUrl?: string }> => {
  const userId = loginGetters.getUserId();
  if (!userId) {
    throw new Error('Нет идентификатора пользователя');
  }
  const ext = getImageExtension(imageFile);
  const key = `${userId}/profile/avatar.${ext}`;
  return uploadFileToDocs(imageFile, key);
};

/**
 * URL для просмотра приватного файла через getFotos.
 */
export const getFotosUrl = (filename: string, token?: string): string => {
  const authToken = token || loginGetters.getToken();
  if (!authToken || !filename) return '';

  const key = filename.startsWith('/') ? filename.slice(1) : filename;
  return `${API_BASE}/api/getFotos?token=${encodeURIComponent(authToken)}&filename=${encodeURIComponent(key)}`;
};

/** Публичный URL / data / blob — как есть; иначе ключ через getFotos. */
export const resolveImageSrc = (pathOrUrl?: string | null): string => {
  if (!pathOrUrl) return '';
  if (
    /^https?:\/\//i.test(pathOrUrl) ||
    pathOrUrl.startsWith('data:') ||
    pathOrUrl.startsWith('blob:')
  ) {
    return pathOrUrl;
  }
  return getFotosUrl(pathOrUrl);
};

/**
 * Проверка / распознавание фото паспорта (лицевая сторона и др.).
 * POST /api/check_passport_photo { token, filename }
 */
export const checkPassportPhoto = async (
  filename: string
): Promise<Record<string, any>> => {
  const token = loginGetters.getToken();
  if (!token) {
    throw new Error('Нет токена авторизации');
  }
  if (!filename) {
    throw new Error('Нет пути к файлу');
  }

  const key = filename.startsWith('/') ? filename.slice(1) : filename;

  const res = await fetch(`${API_BASE}/api/check_passport_photo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, filename: key }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.success === false) {
    throw new Error(data.message || `Ошибка проверки фото: HTTP ${res.status}`);
  }

  return data;
};

export const sendImageViaMinIO                  = async (
  dataUrl: string,
  params: { token: string; recipient: string; cargo: string }
): Promise<{ success: boolean; message?: string }> => {
  const { api } = await import('../Store/api');
  const { filePath } = await uploadOrderPhoto(dataUrl, {
    cargo_id: params.cargo,
    recipient_id: params.recipient,
  });
  const result = await api('api/sendimage', {
    ...params,
    image: filePath,
  });
  if (result?.success === false) {
    throw new Error(result.message || 'Ошибка отправки изображения');
  }
  return result;
};
