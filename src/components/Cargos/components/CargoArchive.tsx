import React from 'react';
import { CargoCard } from './CargoCard';
import useCargoArchive from '../hooks/useCargoArchive';
import './CargoArchive.css';
import { WizardHeader } from '../../Header/WizardHeader';

const CargoArchive = () => {
  const { cargos, refresh } = useCargoArchive();

  const handleCargoClick = (cargo) => {
    // TODO: Добавить навигацию к просмотру заказа
    console.log('Clicked cargo:', cargo);
  };

  return (
    <div className="cr-archive">
      <div className="cr-archive-header">
        <WizardHeader title="Архив" onRefresh={refresh} />
      </div>

      <div className="cr-archive-content">
        <div className="cr-stats">Завершенных заказов: {cargos.length}</div>

        <div className="cr-list">
          {cargos.length === 0 ? (
            <div className="cr-empty">
              <div className="cr-empty-icon">📦</div>
              <div className="cr-empty-text">Нет завершенных заказов</div>
            </div>
          ) : (
            cargos.map(cargo => (
              <CargoCard
                key={cargo.guid}
                cargo={cargo}
                onClick={() => handleCargoClick(cargo)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CargoArchive;
