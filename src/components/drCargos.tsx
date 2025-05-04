import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { locationOutline, navigateOutline } from 'ionicons/icons';
import './drCargos.css'


export function DrCargos() {
  const elem = <>
      <List />
  </>

  return elem;
}

function List(){
  const [ info, setInfo ] = useState<any>([])

  useEffect(()=>{
    
  },[])

  let elem = <></>

  for( let i = 0; i < info.length;i++){
    elem = <>
      { elem }
      <Item info = { info[i] }/>
    </>
  }
  return elem 
}

export function Item(props: { info: any }) {
  const { info } = props;
  
  return (
<div className="transport-card fs-09">
    {/* Header with ID and Price */}
    <div className="card-header">
      <div className="id-container">
        {info.isNew && (
          <span className="new-badge">Новый</span>
        )}
        <span className="id-text">ID: {info.id}</span>
      </div>
      <div className="price">{info.price} ₽</div>
    </div>
    
    {/* Title */}
    <div className="card-title">
      <h3>{info.title}</h3>
    </div>
    
    {/* Locations */}
    <div className="locations-container">
      <div className="location-row">
        <div className="location-icon">
          <IonIcon icon={locationOutline} />
        </div>
        <div className="location-info">
          <div className="location-label">Откуда</div>
          <div className="location-name">{info.fromLocation}</div>
        </div>
        <div className="date-info">
          <div className="date-label">Дата загрузки</div>
          <div className="date-value">{info.loadDate} <span className="time">{info.loadTime}</span></div>
        </div>
      </div>
      
      <div className="location-row">
        <div className="location-icon destination">
          <IonIcon icon={navigateOutline} />
        </div>
        <div className="location-info">
          <div className="location-label">Куда</div>
          <div className="location-name">{info.toLocation}</div>
        </div>
        <div className="date-info">
          <div className="date-label">Дата выгрузки</div>
          <div className="date-value">{info.unloadDate} <span className="time">{info.unloadTime}</span></div>
        </div>
      </div>
    </div>
    
    {/* Cargo details */}
    <div className="cargo-details">
      <div className="cargo-label">Детали груза:</div>
      <div className="cargo-text">{info.cargoDetails}</div>
    </div>
  </div>    
  );
}

