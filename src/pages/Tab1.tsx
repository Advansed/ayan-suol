import { IonButton, IonContent, IonModal, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import './Tab1.css';
import { Cargos } from '../components/Cargos';
import { exec, Store } from '../components/Store';
import { DrCargos  } from '../components/drCargos';
import { useState } from 'react';

const Tab1: React.FC = () => {
  const [ message, setMessage ] = useState("")

  Store.subscribe({ num: 501, type: "error", func: ()=>{
    console.log( Store.getState().error )
    setMessage( Store.getState().error )
  }})
  
  const swap = Store.getState().swap;

  const handleRefresh = async (event: CustomEvent) => {
    // Здесь ваша логика обновления, например, запрос к API
    setTimeout(() => {
      console.log("refresh")
      const params = { token: Store.getState().login.token }

      exec("getCargos", params, "cargos")
      event.detail.complete();
    }, 1500);
  };
  


  return (
    <IonPage>
      <IonContent>
          <IonRefresher
              slot="fixed" 
              pullMin ={ 120 }              
              onIonRefresh={handleRefresh}
          >
              <IonRefresherContent
                pullingIcon="arrow-down-outline"
                pullingText="Потяните вниз для обновления"
                refreshingSpinner="crescent"
                refreshingText="Обновление..."
              />
          </IonRefresher>   
          {
              swap
                ? <DrCargos />
                : <Cargos />
          }
      </IonContent>

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
