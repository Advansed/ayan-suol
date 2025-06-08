import React, { useEffect, useState } from 'react';
import './drCargos.css';
import { Store } from './Store';
import { CargoBody, CargoInfo, CargoBodyProps } from './CargoBody';
import { IonButton, IonLabel } from '@ionic/react';

// Типы для состояния страницы
interface PageState {
  info: CargoInfo;
  type: 'view' | 'edit' | 'create';
}

// Пропсы для основного компонента
interface DrCargosProps {
  // Можно добавить пропсы если нужно
}

// Пропсы для Page1
interface Page1Props {
  setPage: (page: PageState | number) => void;
}

export function DrCargos(props: DrCargosProps) {
  const [page, setPage] = useState<PageState | number>(0);

  const elem = (
    <div className="a-container">
      {page === 0 ? (
        <Page1 setPage={setPage} />
      ) : (
        <></>
      )}
    </div>
  );

  return elem;
}

function Page1(props: Page1Props) {
  const [info, setInfo] = useState<CargoInfo[]>([]);

  useEffect(() => {
    // Функция для обновления списка работ из Store
    const updateWorks = (): void => {
      const works = Store.getState().works;
      // Проверяем что данные являются массивом
      if (Array.isArray(works)) {
        setInfo(works as CargoInfo[]);
      } else {
        setInfo([]);
      }
    };

    // Подписываемся на изменения в Store
    Store.subscribe({ num: 2011, type: "works", func: updateWorks });

    // Получаем начальные данные
    updateWorks();

    // Отписываемся при размонтировании компонента
    return () => {
      Store.unSubscribe(2011);
    };
  }, []);

  let elem: JSX.Element = <></>;

  // Генерируем элементы списка
  for (let i = 0; i < info.length; i++) {
    const cargoItem = info[i];
    
    elem = (
      <>
        {elem}
        <div 
          className='cr-card mt-1'
          onClick={() => {
            props.setPage({ 
              info: cargoItem, 
              type: "view" as const
            });
          }}
        >
          <CargoBody info={cargoItem} mode="view" />
                
          {/* Кнопки управления */}
          <div className="flex">
          <IonButton
                className="w-50 cr-button-2"
                mode="ios"
                fill="clear"
                color="primary"
                onClick={(e) => {
                    e.stopPropagation();
                    //props.setPage({ ...cargoInfo, type: "edit" });
                }}
            >
              <IonLabel className="fs-08">Чат с заказчиком</IonLabel>
            </IonButton>
            <IonButton
                className="w-50 cr-button-2"
                mode="ios"
                color="primary"
                onClick={(e) => {
                    e.stopPropagation();
                    //props.setPage({ ...cargoInfo, type: "edit" });
                }}
            >
              <IonLabel className="fs-08">Предложить</IonLabel>
            </IonButton>
          </div>
        </div>
      </>
    );
  }

  // Финальная разметка
  elem = (
    <>
      <div className="a-center w-90 fs-09 mt-1">
        <b>{"Доступные заказы"}</b>
      </div>
      {elem}
    </>
  );

  return elem;
}