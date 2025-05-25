import { IonIcon, IonInput, IonText, IonTextarea } from "@ionic/react";
import { calendarOutline, locationOutline } from "ionicons/icons";

export interface CargoInfo {
    guid: string;
    name: string;
    description: string;
    address: {
        city: string;
        date: string;
        address: string;
    };
    destiny: {
        city: string;
        date: string;
        address: string;
    };
    weight: number;
    volume: number;
    price: number;
    phone: string;
    face: string;
    status: string;
  }
  
// ОБЪЕДИНЕННЫЙ КОМПОНЕНТ CargoBody
export interface CargoBodyProps {
    info: any;
    mode: 'edit' | 'view';
    readonly?: boolean;
}

export function CargoBody({ info, mode, readonly = false }: CargoBodyProps) {
    // Вспомогательная функция для форматирования валюты
    function formatCurrency(amount: number): string {
        return new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'RUB' 
        }).format(amount).replace('₽', '₽ ');
    }

    // РЕЖИМ ПРОСМОТРА (аналог Body1)
    if (mode === 'view') {
        return (
            <>
                <div className="flex fl-space">
                    <div className="flex">
                        <div className="cr-chip">{info.status}</div>
                        <IonText className="ml-1 fs-07">
                            {"ID: " + info?.guid.substring(0, 6)}
                        </IonText>
                    </div>
                    <div>
                        <IonText className="fs-09 cl-prim">
                            <b>{formatCurrency(info.price)}</b>
                        </IonText>
                        <div className="fs-08 cl-black">
                            <b>{info.weight + ' тонн'}</b>
                        </div>
                    </div>
                </div>

                <div className="fs-08 mt-05">
                    <b>{info.name}</b>
                </div>

                <div className="flex fl-space mt-05">
                    <div className="flex">
                        <IonIcon icon={locationOutline} color="danger"/>
                        <div className="fs-08">
                            <div className="ml-1 fs-09 cl-gray">Откуда:</div>
                            <div className="ml-1 fs-09">
                                <b>{info?.address.city}</b>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="fs-08">
                            <div className="ml-1 fs-09 cl-gray">Дата загрузки:</div>
                            <div className="ml-1 fs-09">
                                <b>{info?.address.date.substring(0, 10)}</b>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex fl-space mt-05">
                    <div className="flex">
                        <IonIcon icon={locationOutline} color="success"/>
                        <div className="fs-08">
                            <div className="ml-1 fs-09 cl-gray">Куда:</div>
                            <div className="ml-1 fs-09">
                                <b>{info?.destiny.city}</b>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="fs-08">
                            <div className="ml-1 fs-09 cl-gray">Дата выгрузки:</div>
                            <div className="ml-1 fs-09">
                                <b>{info?.destiny.date.substring(0, 10)}</b>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-1 cr-detali">
                        <b>Детали груза:</b>
                        <div>{info.description}</div>
                    </div>
                </div>
            </>
        );
    }

    // РЕЖИМ РЕДАКТИРОВАНИЯ (аналог Body)
    return (
        <div className="h-80 scroll">
            {/* Основная информация */}
            <div className="cr-card mt-05">
                <div className="fs-09"><b>Основная информация</b></div>
                
                <div>
                    <div className="fs-08 mt-05">Название</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={info?.name}
                            readonly={readonly}
                            onIonInput={(e) => {
                                if (!readonly) info.name = e.detail.value as string;
                            }}
                        />
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Город отправления</div>
                    <div className="flex">
                        <IonIcon icon={locationOutline} className="w-10 h-15" color="danger"/>
                        <div className="c-input flex w-90">
                            <IonInput 
                                className="custom-input"
                                value={info.address.city}
                                readonly={readonly}
                                onIonInput={(e) => {
                                    if (!readonly) info.address.city = e.detail.value as string;
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Город назначение</div>
                    <div className="flex">
                        <IonIcon icon={locationOutline} className="w-10 h-15" color="success"/>
                        <div className="c-input flex w-90">
                            <IonInput 
                                className="custom-input"
                                value={info.destiny.city}
                                readonly={readonly}
                                onIonInput={(e) => {
                                    if (!readonly) info.destiny.city = e.detail.value as string;
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex mt-05">
                    <div className="w-50">
                        <div className="fs-08">Дата загрузки</div>
                        <div className="flex">
                            <div className="c-input ml-05">
                                <IonInput 
                                    className="custom-input fs-08"
                                    value={info.address.date.substring(0, 10)}
                                    type="date"
                                    readonly={readonly}
                                    onIonInput={(e) => {
                                        if (!readonly) info.address.date = e.detail.value as string;
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-50 ml-05">
                        <div className="fs-08">Дата выгрузки</div>
                        <div className="flex">
                            <IonIcon icon={calendarOutline} className="w-2 h-2" color="success"/>
                            <div className="c-input ml-05 mr-1">
                                <IonInput 
                                    className="custom-input fs-08"
                                    value={info.destiny.date.substring(0, 10)}
                                    type="date"
                                    readonly={readonly}
                                    onIonInput={(e) => {
                                        if (!readonly) info.destiny.date = e.detail.value as string;
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Цена (₽)</div>
                    <div className="flex">
                        <div className="c-input flex w-100">
                            <IonInput 
                                className="custom-input"
                                value={info.price}
                                readonly={readonly}
                                onIonInput={(e) => {
                                    if (!readonly) info.price = parseFloat(e.detail.value as string);
                                }}                     
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Информация о грузе */}
            <div className="cr-card mt-05">
                <div className="fs-09"><b>Информация о грузе</b></div>
                
                <div>
                    <div className="fs-08 mt-05">Вес (тонна)</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={info.weight}
                            readonly={readonly}
                            onIonInput={(e) => {
                                if (!readonly) info.weight = parseFloat(e.detail.value as string);
                            }}                     
                        />
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Объем</div>
                    <div className="flex">
                        <div className="c-input flex w-100">
                            <IonInput 
                                className="custom-input"
                                value={info?.volume}
                                readonly={readonly}
                                onIonInput={(e) => {
                                    if (!readonly) info.volume = parseFloat(e.detail.value as string);
                                }}                                                     
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Описание груза</div>
                    <div className="flex">
                        <div className="c-input flex w-100 fs-08">
                            <IonTextarea 
                                value={info?.description}
                                readonly={readonly}
                                onIonInput={(e) => {
                                    if (!readonly) info.description = e.detail.value as string;
                                }}                                                     
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Адрес и контакты */}
            <div className="cr-card mt-05">
                <div className="fs-09"><b>Адрес и контакты</b></div>
                
                <div>
                    <div className="fs-08 mt-05">Адрес погрузки</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={info?.address.address}
                            readonly={readonly}
                            onIonInput={(e) => {
                                if (!readonly) info.address.address = e.detail.value as string;
                            }}                                                     
                        />
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Адрес разгрузки</div>
                    <div className="flex">
                        <div className="c-input flex w-100">
                            <IonInput 
                                className="custom-input"
                                value={info?.destiny.address}
                                readonly={readonly}
                                onIonInput={(e) => {
                                    if (!readonly) info.destiny.address = e.detail.value as string;
                                }}                                                     
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Контактное лицо</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={info?.face}
                            readonly={readonly}
                            onIonInput={(e) => {
                                if (!readonly) info.face = e.detail.value as string;
                            }}                                                                             
                        />
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Телефон</div>
                    <div className="flex">
                        <div className="c-input flex w-100">
                            <IonInput 
                                className="custom-input"
                                value={info?.phone}
                                readonly={readonly}
                                onIonInput={(e) => {
                                    if (!readonly) info.phone = e.detail.value as string;
                                }}                                                     
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Статус заказа */}
            <div className="cr-card mt-05">
                <div className="fs-09"><b>Статус заказа</b></div>
                <div className="flex">
                    <div className="cr-chip">{info?.status}</div>
                    <IonText className="ml-1 fs-07">
                        {"ID: " + info?.guid.substring(0, 8)}
                    </IonText>
                </div>
                <div className="fs-09">
                    Ваш заказ в статусе "Новый", чтобы водители увидели ваш заказ его надо опубликовать
                </div>
            </div>
        </div>
    );
}

