import { createGesture, IonButton, IonCard, IonChip, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonTextarea } from "@ionic/react";
import { addOutline, arrowBackOutline, attachOutline, chatboxOutline, chevronBackOutline, chevronDown, chevronForward, chevronForwardOutline, closeOutline, cloudDownloadOutline, cloudUploadOutline, createOutline, openOutline, personOutline, trashOutline } from "ionicons/icons";
import React, { createRef, useEffect, useRef, useState } from "react";
import './Classes.css'
import 'react-dadata/dist/react-dadata.css';
import { AddressSuggestions } from "react-dadata";
import { Store } from "./Store";

import { MaskitoOptions, maskitoTransform } from '@maskito/core';
import { useMaskito } from '@maskito/react';
import { Files } from "./Files";


interface State {
    info:   any  // Информация о текущем сервисе
}

interface State1 {
    info:   any,  // Информация о текущем сервисе
    page:   number
}

interface Props { info: any }

export class TCarusel extends React.Component<Props> {
    private ref = createRef<HTMLDivElement>();

    private scrollLeft = () => {
        if (this.ref.current) {
            this.ref.current.scrollLeft = this.ref.current.scrollLeft + this.ref.current.clientWidth;
        }
    };

    private scrollRight = () => {
        if (this.ref.current) {
            this.ref.current.scrollLeft = this.ref.current.scrollLeft - this.ref.current.clientWidth;
        }
    };

    render() {
        const { info } = this.props;

        let elem = <></>;
        
        for (let i = 0; i < info.length; i++) {
            elem = (
                <>
                    {elem}
                    <img src={ info[i].dataUrl } alt="Альтер" className="c-img" />
                </>
            );
        }

        return (
            <>
                <div
                    ref={this.ref}
                    className="c-files"
                >
                    <IonIcon
                        icon={chevronBackOutline}
                        className="c-img-back"
                        color="primary"
                        onClick={this.scrollRight}
                    />
                    <IonIcon
                        icon={chevronForwardOutline}
                        className="c-img-forward"
                        color="primary"
                        onClick={this.scrollLeft}
                    />
                    {elem}
                </div>
            </>
        );
    }
}

export class TCard extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        // Инициализация состояния
        this.state = {
          info:     props.info, 
        };
    }

    Caption = ()=>{ return "Кнопка"}

    Lenta():JSX.Element{
        return (
            this.state.info.status === "Заказан" 
                ? <div className ="corner-ribbon top-right fs-14 corner-yellow">Заказан</div>
            : this.state.info.status === "Принят" 
                ? <div className ="corner-ribbon top-right fs-14 corner-green"> Принят </div>
            : this.state.info.status === "Отказано" 
                ? <div className ="corner-ribbon top-right fs-14 corner-red"> Отказано </div>
            : <></>
        )
    } 

    Body():JSX.Element {
        return (
            <>
                <div className="ml-1 fs-14">
                <b className="cl-prim">{ this.state.info.service.name }</b>
                </div>
                <div className="pl-4 pr-4 ">
                    <TCarusel info = { this.state.info.service.files }/>     
                </div>
                <div className="flex mt-1 ml-1 fl-space mr-2 fs-12">
                    <b>Цена</b>
                    <b className="cl-prim">{ this.state.info.price + " руб" }</b>
                </div>
                <div className="flex mt-1 ml-1 fl-space mr-2 fs-12">
                    <b>Время</b>
                    <b className="cl-prim">{ this.state.info.date }</b>
                </div>
                <div className="ml-2 mt-1 cl-prim">
                    { this.state.info.service.description }
                </div>
            </>

        )
    }

    onClick = () =>{

    }
    onClick1 = ( info ) =>{

    }

    Button():JSX.Element {
        return (
            <IonButton
                className   = "ml-1 mr-1 mt-1"
                expand      = "block"
                mode        = "ios"
                onClick     = { this.onClick }
            >
                { this.Caption() }
            </IonButton>
        )
    }
    
    render():JSX.Element {
        return (
            <IonCard className="c-card"
                // onClick={()=>{ this.onClick1( this.state ) }}
            >
                <div>
                    { this.Lenta() }
                </div>

                <div>
                    { this.Body() }
                </div>
                
                <div>
                    { this.Button() }
                </div>

            </IonCard>        
        );
    }

} 

export class TItem extends React.Component<Props, State> {
    constructor( props:Props ) {
        super(props);
        this.state = {
            info: { ...props.info, open: false },
        };
    }

    Lenta():JSX.Element{
        return (
            this.state.info.status ===      "Новый" 
                ? <div className ="corner-ribbon top-right  corner-yellow">Новый</div>
            : this.state.info.status ===    "Опубликован" 
                ? <div className ="corner-ribbon top-right  corner-green"> Опубликован </div>
            : this.state.info.status ===    "Есть предложения" 
                ? <div className ="corner-ribbon top-right  corner-blue1"> Есть предложения </div>
            : this.state.info.status ===    "Принят" 
                ? <div className ="corner-ribbon top-right corner-blue2"> Есть предложения </div>
            : <></>
        )
    } 

    img = ()=>{
        return ( <>
            {
                this.state.info.files[0] === undefined 
                    ? <>
                        <div className="c-icon1">
                            <img src = { "gruz1.svg" } alt="Альтер" className=""/>     
                        </div>
                    </>
                    : <>
                        <div className="c-icon1">
                            <img src={ this.state.info.files[0].dataUrl } alt="Альтер" className="" />     
                        </div>
                    </>
            }        
        </>
            
        )
    }


    onClick1 = ( info ) => {}
    onClick2 = ( info ) => {}
    onClick3 = ( info ) => {}

    buttons = ()=>{
        return (
            <>
                <div className="flex  mt-1">
                    <div className="c1-button ml-1"
                        onClick = {()=>{ this.onClick1( this.state.info ); }}
                    >
                        <IonIcon icon = { createOutline }  className="w-2 h-2" color = "dark"/>
                        <IonLabel className="fs-09">Изменить</IonLabel>
                    </div>

                    <div className="c1-button ml-2"
                        onClick = {()=>{ this.onClick2( this.state.info ); }}
                    >
                            <IonIcon icon = { trashOutline }  className="w-2 h-2" color = "dark"/>
                        <IonLabel className="fs-09">Удалить</IonLabel>
                    </div>
                    <div className="c1-button ml-2"
                        onClick = {()=>{ this.onClick3( this.state.info ); }}
                    >    
                        <IonIcon icon = { cloudUploadOutline }  className="w-2 h-2" color = "dark"/>
                        <IonLabel className="fs-09">Опубликовать</IonLabel>
                    </div>            
                </div>
            </>
        )
    }


    render() {

        return (
            <IonCard className="c-card-1"
                onClick = {()=>{ 
                    this.setState({ info: {...this.state.info, open:!this.state.info.open } }) 
                } }
            >
                { this.Lenta() }

                <div className="flex">
                    { this.img()}
                    <div className=" fs-12 ml-1">
                        { this.state.info.name  }
                    </div>
                </div>

                <div className="flex mt-1">
                    <div className="w-10">
                        <div className="circle-1"></div>
                    </div>
                    <div className="w-90">{ this.state.info.address.address }</div>
                </div>

                <div className="flex mt-1">
                    <div className="w-10">
                        <div className="circle-2"></div>
                    </div>
                    <div className="w-80">{ this.state.info.destiny.address }</div>
                </div>

                <div className="flex mt-1">

                    <div className="w-30 flex">
                        <img src="donate.svg" alt="donate"  className="w-2 h-2"/>
                        <div className="ml-1">{ this.state.info.price }</div>
                    </div>


                    <div className="w-30 flex">
                        <img src="grid 6.svg" alt="grid 6"  className="w-2 h-2"/>
                        <div className="ml-1">{ this.state.info.dimensions }</div>
                    </div>


                    <div className="w-30 flex">
                        <img src="Weight.svg" alt="grid 6"  className="w-2 h-2"/>
                        <div className="ml-1">{ this.state.info.weight / 1000 + ' тонн' }</div>
                    </div>


                </div>
                {
                    this.state.info.open 
                        ? this.buttons()
                        : <></>
                }
            </IonCard>        
        );
    }
}

export class TIcon extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        // Инициализация состояния
        this.state = {
            info: props.info
        };
    }

    render():JSX.Element {
        return <>
            {
                this.state.info === undefined 
                    ? <>
                        <div className="c-icon w-4 h-4">
                            <IonIcon icon = { personOutline }  className="w-3 h-3" color = "light" />     
                        </div>
                    </>
                    : <>
                        <div className="c-icon w-4 h-4">
                            <img src={ this.state.info.icon } alt="Икон" className="c-img" />     
                        </div>
                    </>
            }        
        </>
    }
}

export class TService extends React.Component<Props, State1> {

    constructor(props: Props) {
        super(props);
        // Инициализация состояния
        this.state = {
            info: props.info === undefined 
                ? {
                    token:                  Store.getState().login.token,
                    name:                   "",
                    address:            {
                        lat:                "",
                        long:               "",
                        address:            "",
                    },
                    destiny:        {
                        lat:                "",
                        long:               "",
                        address:            "",
                    },
                    dimensions:            {
                        width:             "",
                        height:            "",
                        depth:             "",
                        weight:            "",
                    },
                    phone:                 "",
                    files:                 [],
                }
                : {...props.info, token: Store.getState().login.token },
            page: 0
        };
        console.log( this.state )
    }

    onClick1 = ( info )=>{
    }
    onClick2 = ( info )=>{
    }

    body1 = ()=>{
        return <>
                <div className="mt-1">
                    Наименование
                    <div className="c-input mt-05 ml-1">
                        <IonTextarea 
                            placeholder="Наименование"
                            value={ this.state.info?.name }
                            onIonInput={(e)=>{
                                this.state.info.name = e.detail.value as string;
                            }}
                        />
                    </div>
                </div>
               <div className="mt-1">
                    Откуда забрать            
                    <div className="c-input mt-05 ml-1 pt-1 pb-1">
                        <Address info = { this.state.info.address }/>
                    </div>
                </div>
                <div className="mt-1">
                    Куда доставить            
                    <div className="c-input mt-05 ml-1 pt-1 pb-1">
                        <Address info = { this.state.info.destiny }/>
                    </div>
                </div>
                <div className="flex fl-space">
                    <div className="mt-1 w-50"></div>
                    <div className="mt-1 w-50">
                        <IonButton
                            className="fs-13 "
                            fill="solid"
                            color="warning"
                            expand="block"
                            onClick={()=>{
                                this.setState((prev) => ({ 
                                    info: prev.info,
                                    page: 1
                                }))
                            }}
                        >
                            Далее
                        </IonButton>
                    </div>
                </div>     
        </>
    }

    body2 = ()=>{
        return <>
                 <div className="mt-1"> 
                    Габариты
                    <div className="c-input mt-05 ml-1 pt-1 pb-1">
                    <div className="flex fl-space">
                            <div>Ширина:</div>        
                            <div className="c-input a-right">
                                <IonInput 
                                    placeholder="м (метр)"
                                    value = { this.state.info.dimensions.width }
                                    onIonInput={(e)=>{
                                        this.state.info.dimensions.width = e.detail.value
                                    }}
                                />
                            </div>        
                        </div>
                        <div className="flex fl-space mt-05">
                            <div>Высота:</div>        
                            <div className="c-input a-right">
                                <IonInput 
                                    placeholder="м (метр)"
                                    value = { this.state.info.dimensions.height }
                                    onIonInput={(e)=>{
                                        this.state.info.dimensions.height = e.detail.value
                                    }}
                                />
                            </div>        
                        </div>
                        <div className="flex fl-space mt-05">
                            <div>Глубина:</div>        
                            <div className="c-input a-right">
                                <IonInput 
                                    placeholder="м (метр)"
                                    value = { this.state.info.dimensions.depth }
                                    onIonInput={(e)=>{
                                        this.state.info.dimensions.depth = e.detail.value
                                    }}
                                />
                            </div>        
                        </div>
                        <div className="flex fl-space mt-05">
                            <div>Вес:</div>        
                            <div className="c-input a-right">
                                <IonInput 
                                    placeholder="кг (килограмм)"
                                    value = { this.state.info.dimensions.weight }
                                    onIonInput={(e)=>{
                                        this.state.info.dimensions.weight = e.detail.value
                                    }}
                                />
                            </div>        
                        </div>
                        
                    </div>
                </div>
                <div className="mt-1">
                    Фотки
                    <Files info = { this.state.info.files }/>
                </div> 
                <div className="flex fl-space">
                    <div className="mt-1 w-50">
                        <IonButton
                            className="fs-13 "
                            fill="solid"
                            color="warning"
                            expand="block"
                            onClick={()=>{
                                this.setState((prev) => ({ 
                                    info: prev.info,
                                    page: 0
                                }))
                            }}
                        >
                            Назад
                        </IonButton>
                    </div>
                    <div className="mt-1 w-50">
                        <IonButton
                            className="fs-13 "
                            fill="solid"
                            color="warning"
                            expand="block"
                            onClick={()=>{
                                this.setState((prev) => ({ 
                                    info: prev.info,
                                    page: 2
                                }))
                            }}
                        >
                            Далее
                        </IonButton>
                    </div>
                </div>     
        </>
    }

    body3 = ()=>{
        return <>
            <div className="mt-1">
                Контактный телефон
                <div className="c-input mt-05 ml-1 pt-1 pb-1">
                    <Maskito 
                        placeholder= "+7 (XXX) XXX-XXXX"
                        mask = { ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/] }
                        value = { this.state.info.phone }
                        onIonInput = {(e)=>{
                            this.state.info.phone = e.detail.value;
                        }}
                    />
                </div>
            </div>
            <div className="flex fl-space">
                <div className="mt-1 w-50">
                    <IonButton
                        className="fs-13 "
                        fill="solid"
                        color="success"
                        expand="block"
                        onClick={()=>{
                            this.onClick1( this.state.info )
                        }}
                    >
                        Сохранить
                    </IonButton>
                </div>
                <div className="mt-1 w-50">
                    <IonButton
                        className="fs-13 "
                        fill="solid"
                        color="danger"
                        expand="block"
                        onClick={()=>{
                            this.onClick2( this.state.info )
                        }}
                    >
                        Отмена
                    </IonButton>
                </div>
            </div>     
        </>
    }

    render():JSX.Element {

        return (
            <IonCard className="c-card">
                {
                    this.state.page === 0 
                       ? this.body1()
                    : this.state.page === 1
                       ? this.body2()
                    : this.body3()
                }
                
            </IonCard>
        );

    }

} 

export class TList extends React.Component<Props, State>  {
    constructor(props) {
        super(props);
        this.state = {
            info: props.info
        };
    }

    render(): JSX.Element {
        return <>

        </>
    }
}

export class TPanel extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            info: props.info
        };
    }

    onClick1 = (info) =>{
        this.state.info.onClick1( info )
    }

    onClick2 = (info) =>{
        this.state.info.onClick2( info )
    }

    render(): JSX.Element {
        return <>
            <div className="c-panel">
                <div className="c-icon">
                    <IonIcon icon = { arrowBackOutline } className="w-15 h-15" color="light"
                        onClick={()=> this.onClick1( this.state.info )}
                    />
                </div>

                <IonLabel className="ml-1 cl-prim fs-12"> <b>{ this.state.info.title }</b> </IonLabel>
                
                <div className="c-icon">
                    <IonIcon icon = { addOutline } className="w-15 h-15" color="light"
                        onClick={()=> this.onClick2( this.state.info )}
                    />
                </div>
            </div>
        </>
    }
}

export function Address(props:{ info }){
    const [ value, setValue ] = useState<any>( {
        value: props.info.address
    } )
    const elem = <>
        <AddressSuggestions token="50bfb3453a528d091723900fdae5ca5a30369832" 
            filterLocations={[{ city: 'Якутск' }]}
            value={ value } 
            onChange={(e)=>{
                setValue( e )
                props.info.address = e?.value            
                props.info.lat      = e?.data.geo_lat
                props.info.long     = e?.data.geo_lon
            }} 
        />
        {/* <div className="flex mt-05 ml-1">
            <div className="fs-09"> { 'lat: ' + props.info.lat } </div>
            <div className="ml-2 fs-09">{'long: ' + props.info.long }</div>
        </div> */}
        
    </>

    return elem

}

export function Tags(props:{ info }) {
    const [ modal, setModal ] = useState(false)
    const [ value, setValue ] = useState("")
    const [ upd, setUpd ] = useState( 0 )

    const targetRef = useRef<HTMLDivElement | null>(null);

    useEffect(()=>{
        setValue("")
        
    }, [modal])
    
    function TChip(props:{ info, ind }){


        const boxRef = useRef<HTMLDivElement | null>(null);


        useEffect(() => {
    
            if (boxRef.current) {
                const gesture = createGesture({
                    el: boxRef.current,
                    gestureName: 'draggable',
                    threshold: 0,
                    onStart: () => {
                        // Начало жеста
                        console.log('Drag started');
                    },
                    onMove: (ev) => {
                        // Перемещение элемента
                        boxRef.current!.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
                    },
                    onEnd: (ev) => {
                        // Окончание жеста

                        console.log( ev )

                        const boxRect = boxRef.current!.getBoundingClientRect();
                        const targetRect = targetRef.current!.getBoundingClientRect();
              
                        if (
                          ev.currentX >= targetRect.left &&
                          ev.currentX <= targetRect.right &&
                          ev.currentY >= targetRect.top &&
                          ev.currentY <= targetRect.bottom
                        ) {
                            props.info.splice( props.ind, 1 );
                            setUpd( upd + 1 )
                            console.log('onDrop произошло над целевым элементом');
                        } else {
                          console.log('onDrop произошло за пределами целевого элемента');
                          boxRef.current!.style.transform = 'translate(0, 0)';
                        }                        },
                });
            
                gesture.enable();
            }
        }, []);

        return <>
            <div
                ref = { boxRef }
            >
                <IonChip>{ props.info[ props.ind ]  }</IonChip>
            </div>            
        </> 
    }

    let tags = <></>
    for (let i = 0; i < props.info.tags?.length; i++){
        tags = <>
            { tags }
            <TChip info = { props.info.tags } ind = { i }/>
        </>
    }

    tags = <>
        <div className="ml-1 mt-05 flex fl-space">
            <div className="w-90 p-tags ">
                { tags }
            </div>
            <div className="w-10 l1-icons">
                <div className="l1-icon-1">
                    <div>
                        <IonIcon icon = { addOutline} color = "light"
                            onClick={()=>{ setModal( true )}}
                        />     
                    </div>
                </div>
                <div className="l1-icon-2 mt-1">
                    <div
                        ref = { targetRef }
                    >
                        <IonIcon icon = { trashOutline } color = "light"
                        />     
                    </div>
                </div>
            </div>
        </div>
        <IonModal
            className="c-modal"
            onDidDismiss={ ()=>{ setModal( false) }}
            isOpen = { modal }
        >   
            <div className="p-input pb-1">
                <div className="p-inp">
                    <IonInput
                        placeholder="Тег"
                        value={ value }
                        onIonInput={( e )=>{ setValue( e.detail.value as string ) }}
                    >
                    </IonInput>
                </div>
                <div className="flex">
                    <IonButton
                        className="w-50"
                       expand="block"
                        color={"primary"}
                        onClick={()=>{
                            setModal(false)
                            props.info.tags.push( value )
                            console.log( props.info.tags  )
                        }}
                    >
                        Добавить
                    </IonButton>
                    <IonButton
                        className="w-50"
                        expand="block"
                        color={ "dark"}
                        onClick={()=>{
                            setModal(false)
                        }}
                    >
                        Отмена
                    </IonButton>
                </div>
            </div>

        </IonModal>
    </>
    return tags

}

export function Maskito(props:{ value, onIonInput, mask, placeholder  }) {
  
    const phoneMaskOptions: MaskitoOptions = {
      mask:  props.mask //['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
    };
    const phoneMask = useMaskito({ options: phoneMaskOptions });
  
    //If you need to set an initial value, you can use maskitoTransform to ensure the value is valid
    const [myPhoneNumber, setMyPhoneNumber] = useState("");
  
    return (
        <IonInput
            ref={async (phoneInput) => {
              if (phoneInput) {
                const input = await phoneInput.getInputElement();
                phoneMask(input)
              }
            }}
            value={ props.value }
            onIonInput={(e) => {
                props.onIonInput(e)
            }}
            placeholder =  { props.placeholder } //"+7 (xxx) xxx-xxxx"
            label="Телефон" labelPlacement="stacked"
        />

    );
}

export function Phone(phone): string {
    if(phone === undefined) return ""
    if(phone === null) return ""
    let str = "+"
    for(let i = 0;i < phone.length;i++){
      const ch = phone.charCodeAt(i)
      if( ch >= 48 && ch <= 57) str = str + phone.charAt(i)
    }
    return str
}