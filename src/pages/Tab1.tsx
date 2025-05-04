import { IonButton, IonModal, IonPage } from '@ionic/react';
import './Tab1.css';
import { Cargos } from '../components/Cargos';
import { Store } from '../components/Store';
import { DrCargos  } from '../components/drCargos';
import { useState } from 'react';

const Tab1: React.FC = () => {
  const [ message, setMessage ] = useState("")

  Store.subscribe({ num: 501, type: "error", func: ()=>{
    console.log( Store.getState().error )
    setMessage( Store.getState().error )
  }})
  
  const swap = Store.getState().swap;

  const transportInfo = {
    isNew: true,
    id: '12460',
    price: '120 000',
    title: 'Перевозка промышленного оборудования',
    fromLocation: 'Казань',
    toLocation: 'Уфа',
    loadDate: '01.04.2025',
    loadTime: '10:00-15:00',
    unloadDate: '03.04.2025',
    unloadTime: '10:00-15:00',
    cargoDetails: 'Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом. Стандартная перевозка негабаритных грузов.'
  };


  return (
    <IonPage>
      {
        swap
          ? <DrCargos />
          : <Cargos />
      }

      <IonModal 
        isOpen={message !== "" } 
        onDidDismiss={() => setMessage("")}
        className="error-modal"
      >
        <div className="error-modal-container">
          <div className="error-modal-content">
            <div className="error-modal-title">Ошибка</div>
            <div className="error-modal-message">{ message}</div>
            <IonButton 
              className="error-modal-button" 
              expand="block" 
              onClick={() => setMessage("")}
            >
              Закрыть
            </IonButton>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default Tab1;
