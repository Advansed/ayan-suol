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
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
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
  if (typeof imageFile === 'string') {
    const mimeMatch = imageFile.split(',')[0]?.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    return (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  }
  const fromName = imageFile.name.split('.').pop();
  if (fromName) return fromName.toLowerCase().replace('jpeg', 'jpg');
  const mime = imageFile.type || 'image/jpeg';
  return (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
};

const uniqueFilename                            = (original: string): string => {
  const ext = original.split('.').pop() || 'jpg';
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
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
  const file =
    typeof imageFile === 'string'
      ? dataUrlToFile(imageFile, key.split('/').pop() || 'image.jpg')
      : imageFile;

  const form = new FormData();
  form.append('token', token);
  form.append('filename', key);
  form.append('file', file, file.name);

  const res = await fetch(`${API_BASE}/api/uploadFotos`, {
    method: 'POST',
    body: form,
    // Content-Type не ставим — браузер добавит boundary
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data?.success === false) {
    throw new Error(data.message || 'Ошибка загрузки файла');
  }

  const filePath = data.filePath || data.filename || key;
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
