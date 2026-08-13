import React, { useState, useEffect }   from 'react';
import { IonButton }                    from '@ionic/react';
import { PartySuggestions }             from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';
import styles                           from '../Profile.module.css';
import { 
        CompanyData, 
        buildOrganizationSave, 
        companyFromPartySuggestion, 
        toSetCompanyPayload 
} 
                                        from '../../../Store/companyStore';
import { DADATA_TOKEN }                 from '../../../utils/dadata';

interface CustomerInfoProps {
    companyData: CompanyData | null;
    onSave: (data: Partial<CompanyData>) => Promise<void>;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({
    companyData,
    onSave
}) => {

    const [formData, setFormData] = useState({
        innOrName:                  '',
        actsOnBasis:                '',
        representative:             '',
        bic:                        '',
        bank:                       '',
        correspondentAccount:       '',
        account:                    ''
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
        await onSave(buildOrganizationSave({
            company: companyData,
            party: partyValue,
            innOrName: formData.innOrName,
            basis: formData.actsOnBasis,
            description: formData.representative,
            bank_bik: formData.bic,
            bank_name: formData.bank,
            bank_account: formData.account,
            bank_corr_account: formData.correspondentAccount,
        }));
    };

    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>Сведения заказчика</h3>
            
            <div className={styles.formFields}>

                <div className={styles.field}>
                    <label className={styles.label}>Введите ИНН или наименование</label>
                    <PartySuggestions
                        token={DADATA_TOKEN}
                        value={partyValue}
                        onChange={(suggestion) => {
                            if (suggestion) {
                                setFormData(prev => ({
                                    ...prev,
                                    innOrName: suggestion.value
                                }));
                                
                                setPartyValue(suggestion);
                                
                                onSave(toSetCompanyPayload({
                                    guid: companyData?.guid,
                                    ...companyFromPartySuggestion(suggestion),
                                    basis: formData.actsOnBasis,
                                    description: formData.representative,
                                    bank_bik: formData.bic,
                                    bank_name: formData.bank,
                                    bank_account: formData.account,
                                    bank_corr_account: formData.correspondentAccount,
                                })).catch(console.error);
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
