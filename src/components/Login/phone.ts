import parsePhoneNumberFromString, { AsYouType } from 'libphonenumber-js'

export const LOGIN_PHONE_DEFAULT_COUNTRY = 'RU' as const

export type ParseLoginPhoneResult =
  | { ok: true; e164: string }
  | { ok: false; error: string }

export function parseLoginPhone(
  raw: string,
  defaultCountry: typeof LOGIN_PHONE_DEFAULT_COUNTRY = LOGIN_PHONE_DEFAULT_COUNTRY
): ParseLoginPhoneResult {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) {
    return { ok: false, error: 'Заполните телефон' }
  }
  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry)
  if (parsed?.isValid()) {
    return { ok: true, e164: parsed.number }
  }
  return { ok: false, error: 'Некорректный номер телефона' }
}

/** Для `validateField`: `null` если ок, иначе текст ошибки */
export function validateLoginPhoneRaw(raw: string): string | null {
  const r = parseLoginPhone(raw)
  return r.ok ? null : r.error
}

export function formatLoginPhoneInternational(raw: string): string {
  const parsed = parsePhoneNumberFromString(raw.trim(), LOGIN_PHONE_DEFAULT_COUNTRY)
  if (parsed?.isValid()) {
    return parsed.formatInternational()
  }
  return raw.trim()
}

/**
 * Форматирование при вводе (скобки/пробелы по правилам страны; дефолт RU, после + переключается код страны).
 * Посимвольно — чтобы вставка и смешанный ввод не обрезались на первом «лишнем» символе.
 */
export function formatPhoneInputDisplay(
  raw: string,
  defaultCountry: typeof LOGIN_PHONE_DEFAULT_COUNTRY = LOGIN_PHONE_DEFAULT_COUNTRY
): string {
  if (raw == null || raw === '') return ''
  const ay = new AsYouType(defaultCountry)
  let formatted = ''
  for (const ch of raw) {
    formatted = ay.input(ch)
  }
  return formatted
}
