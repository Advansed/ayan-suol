import React from 'react';
import { WorkInfo } from '../../types';
import { WorkActionPanel } from './WorkActionPanel';

interface OnLoadWaitCardProps {
  work: WorkInfo;
}

export const OnLoadWaitCard: React.FC<OnLoadWaitCardProps> = ({ work }) => {
  return (
    <WorkActionPanel
      title="Ожидайте погрузку"
      hint="Вы приехали на погрузку. Ожидайте, пока заказчик начнёт загрузку."
      work={work}
    />
  );
};
