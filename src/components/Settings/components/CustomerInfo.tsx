import React, { useState, useEffect } from 'react';
import { IonButton } from '@ionic/react';
import { PartySuggestions } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';
import styles from '../../Profile/Profile.module.css';
import { CompanyData } from '../../../Store/companyStore';

interface CustomerInfoProps {
  companyData: CompanyData | null;
  onSave: (data: Partial<CompanyData>) => Promise<void>;
  /** Без собственной карточки — поля внутри внешней секции */
  embedded?: boolean;
  consentSlot?: React.ReactNode;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({
  companyData,
  onSave,
  embedded = false,
  consentSlot,
}) => {
  const [formData, setFormData] = useState({
    innOrName: '',
    actsOnBasis: '',
    representative: '',
    bic: '',
    bank: '',
    correspondentAccount: '',
    account: '',
  });

  const [partyValue, setPartyValue] = useState<any>(undefined);

  useEffect(() => {
    if (companyData) {
      setFormData({
        innOrName: companyData.inn || companyData.name || '',
        actsOnBasis: companyData.basis || '',
        representative: companyData.description || '',
        bic: companyData.bank_bik || '',
        bank: companyData.bank_name || '',
        correspondentAccount: companyData.bank_corr_account || '',
        account: companyData.bank_account || '',
      });

      if (companyData.name) {
        setPartyValue({ value: companyData.name } as any);
      } else {
        setPartyValue(undefined);
      }
    }
  }, [companyData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
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

  const fields = (
    <>
      {consentSlot}

      <div className={styles.formFields}>
        <div className={styles.field}>
          <label className={styles.label}>ИНН или наименование</label>
          <PartySuggestions
            token={
              import.meta.env.VITE_DADATA_TOKEN ||
              '23de02cd2b41dbb9951f8991a41b808f4398ec6e'
            }
            value={partyValue}
            onChange={(suggestion) => {
              if (suggestion) {
                setFormData((prev) => ({
                  ...prev,
                  innOrName: suggestion.value,
                }));
                setPartyValue(suggestion);
                onSave({
                  inn: suggestion.data.inn || undefined,
                  name: suggestion.value || undefined,
                  short_name: suggestion.data.name?.short_with_opf || undefined,
                  kpp: suggestion.data.kpp || undefined,
                  ogrn: suggestion.data.ogrn || undefined,
                  address: suggestion.data.address?.value || undefined,
                }).catch(console.error);
              } else {
                setPartyValue(undefined);
                handleInputChange('innOrName', '');
              }
            }}
            inputProps={{
              className: styles.input,
              placeholder: 'Поиск по ИНН или названию',
            }}
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>Основание</label>
            <input
              type="text"
              className={styles.input}
              value={formData.actsOnBasis}
              onChange={(e) => handleInputChange('actsOnBasis', e.target.value)}
              placeholder="Устав, доверенность…"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Представитель</label>
            <input
              type="text"
              className={styles.input}
              value={formData.representative}
              onChange={(e) => handleInputChange('representative', e.target.value)}
              placeholder="ФИО"
            />
          </div>
        </div>

        <div className={styles.sectionDivider}>
          <p className={styles.sectionLabel}>Реквизиты банка</p>
          <div className={styles.formFields}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>БИК</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.bic}
                  onChange={(e) => handleInputChange('bic', e.target.value)}
                  placeholder="044525225"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Банк</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.bank}
                  onChange={(e) => handleInputChange('bank', e.target.value)}
                  placeholder="Название банка"
                />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Корсчёт</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.correspondentAccount}
                  onChange={(e) =>
                    handleInputChange('correspondentAccount', e.target.value)
                  }
                  placeholder="30101…"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Расчётный счёт</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.account}
                  onChange={(e) => handleInputChange('account', e.target.value)}
                  placeholder="40702…"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <IonButton color="primary" className={styles.saveBtn} onClick={handleSave}>
        Сохранить организацию
      </IonButton>
    </>
  );

  if (embedded) {
    return fields;
  }

  return <div className={styles.card}>{fields}</div>;
};
