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

export function getStatusFlowIndex(status: WorkStatus): number {
  if (status === WorkStatus.REJECTED) return -1;
  const idx = WORK_STATUS_FLOW.indexOf(status);
  return idx >= 0 ? idx : 0;
}

/** Лента: только новые */
export const FEED_WORK_STATUSES: WorkStatus[] = [WorkStatus.NEW];

/** Мои заказы: отклики + в работе */
export const MY_WORK_STATUSES: WorkStatus[] = [
  WorkStatus.OFFERED,
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

export function filterWorksByMode<T extends { status: WorkStatus }>(
  works: T[],
  mode: WorksListMode
): T[] {
  if (mode === 'feed') {
    return works.filter((w) => FEED_WORK_STATUSES.includes(w.status));
  }
  if (mode === 'mine') {
    return works.filter((w) => MY_WORK_STATUSES.includes(w.status));
  }
  return works;
}
