import { WorkStatus } from './types';

/** Основной жизненный цикл заказа (без «Отказано») */
export const WORK_STATUS_FLOW: WorkStatus[] = [
  WorkStatus.NEW,
  WorkStatus.OFFERED,
  WorkStatus.TO_LOAD,
  WorkStatus.ON_LOAD,
  WorkStatus.LOADING,
  WorkStatus.LOADED,
  WorkStatus.IN_WORK,
  WorkStatus.TO_UNLOAD,
  WorkStatus.UNLOADING,
  WorkStatus.UNLOADED,
  WorkStatus.COMPLETED,
];

/** Короткое название для степпера */
export const WORK_STATUS_SHORT: Record<WorkStatus, string> = {
  [WorkStatus.NEW]: 'Новый',
  [WorkStatus.OFFERED]: 'Торг',
  [WorkStatus.TO_LOAD]: 'На погрузку',
  [WorkStatus.ON_LOAD]: 'На погрузке',
  [WorkStatus.LOADING]: 'Загрузка',
  [WorkStatus.LOADED]: 'Загружено',
  [WorkStatus.IN_WORK]: 'В рейсе',
  [WorkStatus.TO_UNLOAD]: 'Доставлено',
  [WorkStatus.UNLOADING]: 'Разгрузка',
  [WorkStatus.UNLOADED]: 'Разгружено',
  [WorkStatus.COMPLETED]: 'Готово',
  [WorkStatus.REJECTED]: 'Отказ',
};

/** Что делать исполнителю на этом статусе */
export const WORK_CURRENT_ACTION: Record<WorkStatus, string> = {
  [WorkStatus.NEW]: 'Сделайте предложение по цене и транспорту',
  [WorkStatus.OFFERED]: 'Ожидайте ответа заказчика или отмените предложение',
  [WorkStatus.TO_LOAD]: 'Подпишите договор и выезжайте на погрузку',
  [WorkStatus.ON_LOAD]: 'Ожидайте начала погрузки со стороны заказчика',
  [WorkStatus.LOADING]: 'Зафиксируйте погрузку: фото груза и пломбы',
  [WorkStatus.LOADED]: 'Ожидайте разрешения на выезд',
  [WorkStatus.IN_WORK]: 'Доставьте груз и отметьте прибытие на разгрузку',
  [WorkStatus.TO_UNLOAD]: 'Ожидайте начала разгрузки',
  [WorkStatus.UNLOADING]: 'Подтвердите разгрузку фотографиями кузова',
  [WorkStatus.UNLOADED]: 'Ожидайте закрытия заказа заказчиком',
  [WorkStatus.COMPLETED]: 'Заказ успешно завершён',
  [WorkStatus.REJECTED]: 'Предложение отклонено — заказ больше недоступен',
};

const WORK_STATUS_ALIASES: Record<string, WorkStatus> = {
  '10': WorkStatus.NEW,
  '11': WorkStatus.OFFERED,
  '12': WorkStatus.TO_LOAD,
  '13': WorkStatus.ON_LOAD,
  '14': WorkStatus.LOADING,
  '15': WorkStatus.LOADED,
  '16': WorkStatus.IN_WORK,
  '17': WorkStatus.TO_UNLOAD,
  '18': WorkStatus.UNLOADING,
  '19': WorkStatus.UNLOADED,
  '20': WorkStatus.COMPLETED,
  '21': WorkStatus.REJECTED,
  Принято: WorkStatus.TO_LOAD,
  Принят: WorkStatus.TO_LOAD,
  'В пути': WorkStatus.IN_WORK,
  'В Пути': WorkStatus.IN_WORK,
  Прибыл: WorkStatus.TO_UNLOAD,
  Выгружается: WorkStatus.UNLOADING,
  Выгружено: WorkStatus.UNLOADED,
  Завершено: WorkStatus.COMPLETED,
  Завершён: WorkStatus.COMPLETED,
  Завершен: WorkStatus.COMPLETED,
  Отказано: WorkStatus.REJECTED,
};

function foldYo(value: string): string {
  return value.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
}

export function normalizeWorkStatus(status: string | number | WorkStatus | undefined | null): WorkStatus {
  if (status === undefined || status === null || status === '') {
    return WorkStatus.NEW;
  }
  const raw = String(status);
  if (Object.values(WorkStatus).includes(raw as WorkStatus)) {
    return raw as WorkStatus;
  }
  return WORK_STATUS_ALIASES[raw] ?? WORK_STATUS_ALIASES[foldYo(raw)] ?? WorkStatus.NEW;
}

/** Сопоставление заказа: guid и cargo могут путаться / отличаться типом (string|number) */
export function workIdsMatch(
  work: { guid?: string; cargo?: string },
  ref: { guid?: string; cargo?: string } | string
): boolean {
  const refGuid = typeof ref === 'string' ? ref : ref.guid;
  const refCargo = typeof ref === 'string' ? undefined : ref.cargo;
  const ids = [work.guid, work.cargo].filter(Boolean).map(String);
  const refs = [refGuid, refCargo].filter(Boolean).map(String);
  return refs.some((r) => ids.includes(r));
}

export function findWorkByRef<T extends { guid?: string; cargo?: string }>(
  works: T[],
  ref: { guid?: string; cargo?: string } | string
): T | undefined {
  return works.find((w) => workIdsMatch(w, ref));
}

export function getStatusFlowIndex(status: WorkStatus | string): number {
  const normalized = normalizeWorkStatus(status);
  if (normalized === WorkStatus.REJECTED) return -1;
  const idx = WORK_STATUS_FLOW.indexOf(normalized);
  return idx >= 0 ? idx : 0;
}

export type OrderProgressSlot =
  | { type: 'status'; status: WorkStatus; role: 'prev' | 'current' | 'next' | 'last' }
  | { type: 'ellipsis' };

/** Предыдущий, текущий, следующий и последний статус; «…» если между следующим и последним есть этапы. */
export function getOrderProgressSlots(status: WorkStatus | string): OrderProgressSlot[] {
  const currentIndex = getStatusFlowIndex(status);
  if (currentIndex < 0) return [];

  const lastIndex = WORK_STATUS_FLOW.length - 1;
  const slots: OrderProgressSlot[] = [];

  if (currentIndex > 0) {
    slots.push({ type: 'status', status: WORK_STATUS_FLOW[currentIndex - 1], role: 'prev' });
  }
  slots.push({ type: 'status', status: WORK_STATUS_FLOW[currentIndex], role: 'current' });

  const nextIndex = currentIndex + 1;
  if (nextIndex > lastIndex) return slots;

  if (nextIndex === lastIndex) {
    slots.push({ type: 'status', status: WORK_STATUS_FLOW[lastIndex], role: 'last' });
    return slots;
  }

  slots.push({ type: 'status', status: WORK_STATUS_FLOW[nextIndex], role: 'next' });
  if (nextIndex < lastIndex - 1) {
    slots.push({ type: 'ellipsis' });
  }
  slots.push({ type: 'status', status: WORK_STATUS_FLOW[lastIndex], role: 'last' });
  return slots;
}

/** Лента: новые, отклики, рейсы и завершённые */
export const FEED_WORK_STATUSES: WorkStatus[] = [
  WorkStatus.NEW,
  WorkStatus.OFFERED,
  WorkStatus.TO_LOAD,
  WorkStatus.ON_LOAD,
  WorkStatus.LOADING,
  WorkStatus.LOADED,
  WorkStatus.IN_WORK,
  WorkStatus.TO_UNLOAD,
  WorkStatus.UNLOADING,
  WorkStatus.UNLOADED,
  WorkStatus.COMPLETED,
];

/** Активные перевозки после подписи (TO_LOAD+signed и дальше по рейсу) */
export const MY_WORK_STATUSES: WorkStatus[] = [
  WorkStatus.TO_LOAD,
  WorkStatus.ON_LOAD,
  WorkStatus.LOADING,
  WorkStatus.LOADED,
  WorkStatus.IN_WORK,
  WorkStatus.TO_UNLOAD,
  WorkStatus.UNLOADING,
  WorkStatus.UNLOADED,
];

export type WorksListMode = 'feed' | 'mine' | 'all';

export function filterWorksByMode<T extends { status: WorkStatus; signed?: boolean }>(
  works: T[],
  mode: WorksListMode
): T[] {
  if (mode === 'feed') {
    return works.filter((w) => {
      const status = normalizeWorkStatus(w.status);
      return FEED_WORK_STATUSES.includes(status);
    });
  }
  if (mode === 'mine') {
    return works.filter((w) => {
      const status = normalizeWorkStatus(w.status);
      if (!MY_WORK_STATUSES.includes(status)) return false;
      if (status === WorkStatus.TO_LOAD) return Boolean(w.signed);
      return true;
    });
  }
  return works;
}
