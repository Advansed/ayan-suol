import React, { useState, useEffect } from 'react';
import { IonButton } from '@ionic/react';
import { PartySuggestions } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';
import styles from '../Profile.module.css';
import { CompanyData } from '../../../Store/companyStore';

interface CustomerInfoProps {
    companyData: CompanyData | null;
    onSave: (data: Partial<CompanyData>) => Promise<void>;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({
    companyData,
    onSave
}) => {
    const [formData, setFormData] = useState({
        innOrName:              '',
        actsOnBasis:            '',
        representative:         '',
        bic:                    '',
        bank:                   '',
        correspondentAccount:   '',
        account:                ''
    });

    const [partyValue, setPartyValue] = useState<any>(undefined);

    // Синхронизация с данными компании из store
    useEffect(() => {
        if (companyData) {
            setFormData({
                innOrName:              companyData.inn || companyData.name || '',
                actsOnBasis:            companyData.basis || '',
                representative:         companyData.description || '',
                bic:                    companyData.bank_bik || '',
                bank:                   companyData.bank_name || '',
                correspondentAccount:   companyData.bank_corr_account || '',
                account:                companyData.bank_account || ''
            });
            
            // Устанавливаем значение для PartySuggestions
            if (companyData.name) {
                setPartyValue({ value: companyData.name } as any);
            } else {
                setPartyValue(undefined);
            }
        }
    }, [companyData]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Все поля опциональны - сохраняем только заполненные
        const saveData: Partial<CompanyData> = {};

        if (formData.innOrName.trim()) {
            const innOrNameValue = formData.innOrName.trim();
            const isInn = /^\d+$/.test(innOrNameValue);
            if (isInn) {
                saveData.inn = innOrNameValue;
            } else {
                saveData.name = innOrNameValue;
            }
        }

        if (formData.actsOnBasis.trim()) {
            saveData.basis = formData.actsOnBasis.trim();
        }

        if (formData.representative.trim()) {
            saveData.description = formData.representative.trim();
        }

        if (formData.bic.trim()) {
            saveData.bank_bik = formData.bic.trim();
        }

        if (formData.bank.trim()) {
            saveData.bank_name = formData.bank.trim();
        }

        if (formData.correspondentAccount.trim()) {
            saveData.bank_corr_account = formData.correspondentAccount.trim();
        }

        if (formData.account.trim()) {
            saveData.bank_account = formData.account.trim();
        }

        await onSave(saveData);
    };
    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>Сведения заказчика</h3>
            
            <div className={styles.formFields}>

                <div className={styles.field}>
                    <label className={styles.label}>Введите ИНН или наименование</label>
                    <PartySuggestions
                        token="50bfb3453a528d091723900fdae5ca5a30369832"
                        value={partyValue}
                        onChange={(suggestion) => {
                            if (suggestion) {
                                // Автоматически заполняем поля из данных компании
                                setFormData(prev => ({
                                    ...prev,
                                    innOrName: suggestion.value
                                }));
                                
                                // Сохраняем значение для PartySuggestions
                                setPartyValue(suggestion);
                                
                                // Автоматически сохраняем основные данные компании
                                onSave({
                                    inn:        suggestion.data.inn || undefined,
                                    name:       suggestion.value || undefined,
                                    short_name: suggestion.data.name?.short_with_opf || undefined,
                                    kpp:        suggestion.data.kpp || undefined,
                                    ogrn:       suggestion.data.ogrn || undefined,
                                    address:    suggestion.data.address?.value || undefined
                                }).catch(console.error);
                            } else {
                                setPartyValue(undefined);
                                handleInputChange('innOrName', '');
                            }
                        }}
                        inputProps={{
                            className: styles.input,
                            placeholder: "Введите ИНН или наименование"
                        }}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Действует на основании</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.actsOnBasis}
                        onChange={(e) => handleInputChange('actsOnBasis', e.target.value)}
                        placeholder="Введите основание"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Представитель</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.representative}
                        onChange={(e) => handleInputChange('representative', e.target.value)}
                        placeholder="введите имя вашего представителя"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>БИК</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.bic}
                        onChange={(e) => handleInputChange('bic', e.target.value)}
                        placeholder="123456132541235"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Банк</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.bank}
                        onChange={(e) => handleInputChange('bank', e.target.value)}
                        placeholder="12341234512"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Корсчет</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.correspondentAccount}
                        onChange={(e) => handleInputChange('correspondentAccount', e.target.value)}
                        placeholder="1234512512"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Счет</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.account}
                        onChange={(e) => handleInputChange('account', e.target.value)}
                        placeholder="12312435"
                    />
                </div>
            </div>

            <div style={{ marginTop: '1em' }}>
                <IonButton
                    color="primary"
                    onClick={handleSave}
                    style={{ width: '100%' }}
                >
                    Сохранить сведения заказчика
                </IonButton>
            </div>
        </div>
    );
};
