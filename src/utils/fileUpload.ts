/**
 * Загрузка файлов в MinIO через Presigned URL.
 * Путь в bucket: <bucket>/<cargo_id>/<sender_id>/<recipient_id>/filename
 */

import { URL as API_BASE } from '../Store/api';

export interface UploadResult {
  filePath: string;
  /** URL для отображения (если бэкенд возвращает) */
  url?: string;
}

/**
 * Конвертирует dataUrl (base64) в File
 */
export function dataUrlToFile(dataUrl: string, filename = 'image.jpg'): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const ext = mime.split('/')[1] || 'jpg';
  const name = filename.replace(/\.[^.]+$/, '') || `image_${Date.now()}`;
  return new File([u8arr], `${name}.${ext}`, { type: mime });
}

/**
 * Генерирует уникальное имя файла
 */
function uniqueFilename(original: string): string {
  const ext = original.split('.').pop() || 'jpg';
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

/**
 * Загружает файл в MinIO через Presigned URL.
 * @param file - File или Blob
 * @param params - cargo_id, recipient_id, token
 * @returns filePath для передачи в send_message
 */
export async function uploadFileToMinIO(
  file: File | Blob,
  params: {
    cargo_id: string;
    recipient_id: string;
    token: string;
  }
): Promise<UploadResult> {
  const filename = file instanceof File ? file.name : uniqueFilename('image.jpg');
  const safeFilename = uniqueFilename(filename);

  const searchParams = new URLSearchParams({
    filename: safeFilename,
    cargo_id: params.cargo_id,
    token: params.token,
    recipient_id: params.recipient_id,
  });

  const res = await fetch(`${API_BASE}/api/get-upload-url?${searchParams}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const { uploadUrl, filePath, url } = data;

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`Ошибка загрузки в хранилище: ${uploadRes.status}`);
  }

  return { filePath, url };
}

/**
 * Загружает dataUrl в MinIO и отправляет через api/sendimage (filePath).
 * Замена старого api("api/sendimage", { image: base64 }).
 */
export async function sendImageViaMinIO(
  dataUrl: string,
  params: { token: string; recipient: string; cargo: string }
): Promise<{ success: boolean; message?: string }> {
  const { api } = await import('../Store/api');
  const file = dataUrlToFile(dataUrl);
  const { filePath } = await uploadFileToMinIO(file, {
    cargo_id: params.cargo,
    recipient_id: params.recipient,
    token: params.token,
  });
  const result = await api('api/sendimage', {
    ...params,
    image: filePath,
  });
  if (result?.success === false) {
    throw new Error(result.message || 'Ошибка отправки изображения');
  }
  return result;
}
