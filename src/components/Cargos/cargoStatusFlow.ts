import { CargoInfo, CargoStatus } from '../../Store/cargoStore';

/**
 * Основной жизненный цикл заявки заказчика.
 * «Проблемы» — внештатный статус, в степпер не входит.
 */
export const CARGO_STATUS_FLOW: CargoStatus[] = [
  CargoStatus.NEW,
  CargoStatus.WAITING,
  CargoStatus.HAS_ORDERS,
  CargoStatus.ACCEPTED,
  CargoStatus.WAIT_LOAD,
  CargoStatus.LOADING,
  CargoStatus.HAS_LOADED,
  CargoStatus.IN_TRANSIT,
  CargoStatus.HAS_DELIVERED,
  CargoStatus.UNLOADING,
  CargoStatus.WAIT_COMPLETE,
  CargoStatus.COMPLETED,
];

/** Короткие подписи для степпера */
export const CARGO_STATUS_SHORT: Record<CargoStatus, string> = {
  [CargoStatus.NEW]: 'Новый',
  [CargoStatus.WAITING]: 'Ожидание',
  [CargoStatus.HAS_ORDERS]: 'Заявки',
  [CargoStatus.ACCEPTED]: 'Принято',
  [CargoStatus.WAIT_LOAD]: 'Ждёт загрузку',
  [CargoStatus.LOADING]: 'Загрузка',
  [CargoStatus.HAS_LOADED]: 'Загружено',
  [CargoStatus.IN_TRANSIT]: 'В пути',
  [CargoStatus.HAS_DELIVERED]: 'Доставлено',
  [CargoStatus.UNLOADING]: 'Разгрузка',
  [CargoStatus.WAIT_COMPLETE]: 'К завершению',
  [CargoStatus.COMPLETED]: 'Готово',
  [CargoStatus.PROBLEMS]: 'Проблемы',
};

/** Что делать заказчику на этом статусе */
export const CARGO_CURRENT_ACTION: Record<CargoStatus, string> = {
  [CargoStatus.NEW]: 'Опубликуйте заказ или настройте доп. услуги',
  [CargoStatus.WAITING]: 'Ожидайте предложений от водителей',
  [CargoStatus.HAS_ORDERS]: 'Просмотрите заявки и выберите водителя',
  [CargoStatus.ACCEPTED]: 'Водитель принят — ожидайте выезда на погрузку',
  [CargoStatus.WAIT_LOAD]: 'Водитель на погрузке — можно начать загрузку',
  [CargoStatus.LOADING]: 'Идёт загрузка',
  [CargoStatus.HAS_LOADED]: 'Разрешите выезд в рейс',
  [CargoStatus.IN_TRANSIT]: 'Груз в пути — следите за доставкой',
  [CargoStatus.HAS_DELIVERED]: 'Груз доставлен — начните разгрузку',
  [CargoStatus.UNLOADING]: 'Идёт разгрузка',
  [CargoStatus.WAIT_COMPLETE]: 'Подтвердите завершение заказа',
  [CargoStatus.COMPLETED]: 'Заказ успешно завершён',
  [CargoStatus.PROBLEMS]: 'По заказу возникли проблемы — разберите ситуацию',
};

/**
 * Синонимы сервера / статусов водителя → статус заявки.
 * Нужны, пока бэкенд может присылать старые формулировки.
 */
const STATUS_ALIASES: Record<string, CargoStatus> = {
  // старые CargoStatus
  Торг: CargoStatus.HAS_ORDERS,
  'В работе': CargoStatus.IN_TRANSIT,
  Доставлено: CargoStatus.HAS_DELIVERED,
  Выполнено: CargoStatus.COMPLETED,
  // DriverStatus / рейс
  Заказано: CargoStatus.HAS_ORDERS,
  Принято: CargoStatus.ACCEPTED,
  'На погрузке': CargoStatus.WAIT_LOAD,
  Загружается: CargoStatus.LOADING,
  Загружено: CargoStatus.HAS_LOADED,
  'В пути': CargoStatus.IN_TRANSIT,
  'В Пути': CargoStatus.IN_TRANSIT,
  Прибыл: CargoStatus.HAS_DELIVERED,
  Разгружается: CargoStatus.UNLOADING,
  Разгружено: CargoStatus.WAIT_COMPLETE,
  Завершено: CargoStatus.COMPLETED,
  Проблемы: CargoStatus.PROBLEMS,
};

export function normalizeCargoStatus(status: string | CargoStatus): CargoStatus {
  if (Object.values(CargoStatus).includes(status as CargoStatus)) {
    return status as CargoStatus;
  }
  return STATUS_ALIASES[String(status)] ?? CargoStatus.NEW;
}

export function getCargoStatusFlowIndex(status: string | CargoStatus): number {
  const normalized = normalizeCargoStatus(status);
  if (normalized === CargoStatus.PROBLEMS) return -1;
  const idx = CARGO_STATUS_FLOW.indexOf(normalized);
  return idx >= 0 ? idx : 0;
}

export type CargoProgressSlot =
  | { type: 'status'; status: CargoStatus; role: 'prev' | 'current' | 'next' | 'last' }
  | { type: 'ellipsis' };

/** Предыдущий, текущий, следующий и последний статус; «…» если между следующим и последним есть этапы. */
export function getCargoProgressSlots(status: string | CargoStatus): CargoProgressSlot[] {
  const currentIndex = getCargoStatusFlowIndex(status);
  if (currentIndex < 0) return [];

  const lastIndex = CARGO_STATUS_FLOW.length - 1;
  const slots: CargoProgressSlot[] = [];

  if (currentIndex > 0) {
    slots.push({ type: 'status', status: CARGO_STATUS_FLOW[currentIndex - 1], role: 'prev' });
  }
  slots.push({ type: 'status', status: CARGO_STATUS_FLOW[currentIndex], role: 'current' });

  const nextIndex = currentIndex + 1;
  if (nextIndex > lastIndex) return slots;

  if (nextIndex === lastIndex) {
    slots.push({ type: 'status', status: CARGO_STATUS_FLOW[lastIndex], role: 'last' });
    return slots;
  }

  slots.push({ type: 'status', status: CARGO_STATUS_FLOW[nextIndex], role: 'next' });
  if (nextIndex < lastIndex - 1) {
    slots.push({ type: 'ellipsis' });
  }
  slots.push({ type: 'status', status: CARGO_STATUS_FLOW[lastIndex], role: 'last' });
  return slots;
}

/** Самый «продвинутый» статус: cargo.status или статусы заявок */
export function resolveCargoProgressStatus(cargo: CargoInfo): CargoStatus {
  const candidates: Array<string | CargoStatus> = [cargo.status];
  for (const invoice of cargo.invoices ?? []) {
    if (invoice.status) candidates.push(invoice.status);
  }

  let best = normalizeCargoStatus(candidates[0] ?? CargoStatus.NEW);
  if (best === CargoStatus.PROBLEMS) return best;

  let bestIdx = getCargoStatusFlowIndex(best);

  for (const status of candidates) {
    const normalized = normalizeCargoStatus(status);
    if (normalized === CargoStatus.PROBLEMS) return CargoStatus.PROBLEMS;
    const idx = getCargoStatusFlowIndex(normalized);
    if (idx > bestIdx) {
      best = normalized;
      bestIdx = idx;
    }
  }

  return best;
}

export function getCargoActionHint(status: string | CargoStatus): string {
  const normalized = normalizeCargoStatus(status);
  return CARGO_CURRENT_ACTION[normalized] || 'Открыть действия по заказу';
}

/** Заявка уже на этапе исполнения (после выбора водителя) */
export function isCargoInExecution(status: string | CargoStatus): boolean {
  const normalized = normalizeCargoStatus(status);
  if (normalized === CargoStatus.PROBLEMS) return true;
  return getCargoStatusFlowIndex(normalized) >= CARGO_STATUS_FLOW.indexOf(CargoStatus.ACCEPTED);
}

export function isCargoCompleted(status: string | CargoStatus): boolean {
  return normalizeCargoStatus(status) === CargoStatus.COMPLETED;
}

export function isCargoProblems(status: string | CargoStatus): boolean {
  return normalizeCargoStatus(status) === CargoStatus.PROBLEMS;
}

export type CargoFeedKind = 'new' | 'bids' | 'work' | 'done' | 'alert';

export function cargoFeedKind(status: string | CargoStatus): CargoFeedKind {
  const normalized = normalizeCargoStatus(status);
  if (normalized === CargoStatus.NEW || normalized === CargoStatus.WAITING) return 'new';
  if (normalized === CargoStatus.HAS_ORDERS) return 'bids';
  if (normalized === CargoStatus.COMPLETED) return 'done';
  if (normalized === CargoStatus.PROBLEMS) return 'alert';
  return 'work';
}

export function cargoFeedLabel(status: string | CargoStatus): string {
  const kind = cargoFeedKind(status);
  if (kind === 'new') return 'Новый';
  if (kind === 'bids') return 'Торги';
  if (kind === 'done') return 'Завершён';
  if (kind === 'alert') return 'Проблемы';
  return 'В работе';
}
