import React, { useState, useCallback, useEffect } from 'react';
import { IonIcon, IonInput, IonTextarea, IonLoading } from '@ionic/react';
import { arrowBackOutline, saveOutline } from 'ionicons/icons';
import { Store, useStoreField } from './Store';
import socketService from './Sockets';

interface OrgsProps {
    setPage: (page: any) => void;
}

interface OrganizationInfo {
    name?:          string;
    inn?:           string;
    kpp?:           string;
    address?:       string;
    description?:   string;
}

export function Orgs({ setPage }: OrgsProps) {
    // Using your custom useStoreField hook for direct field access
    const orgsFromStore: any = useStoreField('orgs', 12345);
    const loginData: any = useStoreField('login', 12346);
    
    // Local state for form data and loading
    const [orgInfo, setOrgInfo] = useState<OrganizationInfo>(orgsFromStore || {});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Update local state when store changes
    useEffect(() => {
        setOrgInfo(orgsFromStore[0] || {});
        console.log( "useeffect 12345" )
        console.log( orgsFromStore[0] )
    }, [orgsFromStore]);

    // Save function using socketService
    const orgSave = useCallback(async () => {
        setIsLoading(true);
        setIsSaved(false);
        
        try {
            const saveData = {
                ...orgInfo,
                token: loginData?.token,
            };
            
            // Use socketService to emit organization data
            socketService.emit('set_orgs', saveData);
            console.log('Organization info saved via socket:', saveData);
            
            setIsSaved(true);
            
            // Hide success message after 2 seconds
            setTimeout(() => {
                setIsSaved(false);
            }, 2000);
            
        } catch (error) {
            console.error('Error saving organization info:', error);
        } finally {
            setIsLoading(false);
        }
    }, [orgInfo, loginData?.token]);

    // Helper function to update organization info
    const updateOrgInfo = useCallback((field: keyof OrganizationInfo, value: string) => {
        setOrgInfo(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    return (
        <div>
            <IonLoading isOpen={isLoading} message="Сохранение..." />
            
            <div className="flex ml-05 mt-05">
                <IonIcon 
                    icon={arrowBackOutline} 
                    className="w-15 h-15" 
                    onClick={() => setPage(0)}
                />
                <div className="a-center w-90 fs-09">
                    <b>Информация о компании</b>
                </div>
            </div>

            {isSaved && (
                <div className="cr-card mt-05 bg-2" style={{backgroundColor: '#e8f5e8', color: '#2e7d32'}}>
                    <div className="fs-09 a-center">
                        <b>✓ Данные успешно сохранены</b>
                    </div>
                </div>
            )}

            <div className="mt-1 ml-1 mr-1 fs-09">
                
                <div className="mt-05">
                    <div>ИНН</div>
                    <div className="c-input">
                        <IonInput
                            placeholder="ИНН"
                            value={orgInfo?.inn || ''}
                            onIonInput={(e) => {
                                updateOrgInfo('inn', e.detail.value as string);
                            }}
                        />
                    </div>
                </div>
                
                <div className="mt-1">
                    <div>Наименование </div>
                    <div className="c-input">
                        <IonInput
                            placeholder="Наименование компании"
                            value={orgInfo?.name || ''}
                            onIonInput={(e) => {
                                updateOrgInfo('name', e.detail.value as string);
                            }}
                        />
                    </div>
                </div>

                <div className="mt-05">
                    <div>КПП</div>
                    <div className="c-input">
                        <IonInput
                            placeholder="КПП"
                            value={orgInfo?.kpp || ''}
                            onIonInput={(e) => {
                                updateOrgInfo('kpp', e.detail.value as string);
                            }}
                        />
                    </div>
                </div>

                <div className="mt-05">
                    <div>Адрес</div>
                    <div className="c-input">
                        <IonInput
                            placeholder="Адрес"
                            value={orgInfo?.address || ''}
                            onIonInput={(e) => {
                                updateOrgInfo('address', e.detail.value as string);
                            }}
                        />
                    </div>
                </div>

                <div className="mt-05">
                    <div>Описание</div>
                    <div className="c-input">
                        <IonTextarea
                            placeholder="Описание"
                            value={orgInfo?.description || ''}
                            onIonInput={(e) => {
                                updateOrgInfo('description', e.detail.value as string);
                            }}
                        />
                    </div>
                </div>

                <div className="mt-05">
                    <div>Documents</div>
                </div>

                {/* Кнопка сохранения */}
                <div className="mt-1 mb-2">
                    <div 
                        className="cr-card flex fl-center bg-2" 
                        onClick={orgSave}
                        style={{
                            backgroundColor: '#086CA2',
                            color: 'white',
                            cursor: 'pointer',
                            opacity: isLoading ? 0.6 : 1
                        }}
                    >
                        <IonIcon icon={saveOutline} className="w-15 h-15 mr-05" />
                        <b className="fs-09">
                            {isLoading ? 'Сохранение...' : 'Сохранить данные'}
                        </b>
                    </div>
                </div>
            </div>
        </div>
    );
}