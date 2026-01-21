import { IonButton, IonContent, IonModal, IonPage } from '@ionic/react';
import './Tab1.css';
import { Cargos }     from '../components/Cargos/';
import { Works } from '../components/Works';
import { useLoginStore, useUserType } from '../Store/loginStore';
import Lottie from 'lottie-react';
import logo_data from './gvr_logo.json'

const Tab1: React.FC = () => {
  const { user_type }  = useUserType()
  
  const {logo, setLogo } = useLogo();
  
  return (
    <IonPage>

      <IonContent className='bg-2'>
        { logo && (
           <div className="">
                <div className="">
                    <Lottie 
                        animationData={ logo_data } 
                        loop  = { false }
                        autoplay  = { true }
                        style={{ 
                            width: '100%',
                            height: '100%',
                            minWidth: '100vw'
                        }}
                        onComplete={() => {
                          console.log("complete")
                          setLogo( false )
                        }}
                    />
                </div>
            </div>
        )}
          { 
            !logo && user_type === 2
              ? <Works />
            : !logo && user_type === 1
              ? <Cargos />
              : <></>

          }

      </IonContent>

    </IonPage>
  );
};

const useLogo = () => {
  const logo      = useLoginStore(state =>  state.logo )
  const setLogo   = useLoginStore(state =>  state.setLogo )

  return { logo, setLogo }
}

export default Tab1;