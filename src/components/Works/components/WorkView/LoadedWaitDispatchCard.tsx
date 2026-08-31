import React from 'react';
import { WorkInfo } from '../../types';
import { WorkActionPanel } from './WorkActionPanel';

interface LoadedWaitDispatchCardProps {
  work: WorkInfo;
}

export const LoadedWaitDispatchCard: React.FC<LoadedWaitDispatchCardProps> = ({ work }) => {
  return (
    <WorkActionPanel
      title="Груз загружен"
      hint="Вы подтвердили окончание загрузки. Ожидайте, пока заказчик отправит транспорт в путь."
      work={work}
    />
  );
};
