import React, { useState, useEffect } from 'react';
import { IonButton } from '@ionic/react';
import styles from '../../Profile/Profile.module.css';
import { CompanyData, toSetCompanyPayload } from '../../../Store/companyStore';

interface CustomerInfoProps {
  companyData: CompanyData | null;
  onSave: (data: Partial<CompanyData>) => Promise<void>;
  /** Без собственной карточки — поля внутри внешней секции */
  embedded?: boolean;
  consentSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({
  companyData,
  onSave,
  embedded = false,
  consentSlot,
  footerSlot,
}) => {
  const [formData, setFormData] = useState({
    inn: '',
    name: '',
    short_name: '',
    kpp: '',
    ogrn: '',
    address: '',
    actsOnBasis: '',
    representative: '',
    bic: '',
    bank: '',
    correspondentAccount: '',
    account: '',
  });

  useEffect(() => {
    if (!companyData) return;
    setFormData({
      inn: companyData.inn || '',
      name: companyData.name || '',
      short_name: companyData.short_name || '',
      kpp: companyData.kpp || '',
      ogrn: companyData.ogrn || '',
      address: companyData.address || '',
      actsOnBasis: companyData.basis || '',
      representative: companyData.description || '',
      bic: companyData.bank_bik || '',
      bank: companyData.bank_name || '',
      correspondentAccount: companyData.bank_corr_account || '',
      account: companyData.bank_account || '',
    });
  }, [companyData]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await onSave(
      toSetCompanyPayload({
        guid: companyData?.guid,
        inn: formData.inn,
        name: formData.name,
        short_name: formData.short_name,
        kpp: formData.kpp,
        ogrn: formData.ogrn,
        address: formData.address,
        postal_address: companyData?.postal_address,
        phone: companyData?.phone,
        email: companyData?.email,
        basis: formData.actsOnBasis,
        description: formData.representative,
        bank_bik: formData.bic,
        bank_name: formData.bank,
        bank_account: formData.account,
        bank_corr_account: formData.correspondentAccount,
      })
    );
  };

  const fields = (
    <>
      {consentSlot}

      <div className={styles.formFields}>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>ИНН</label>
            <input
              type="text"
              inputMode="numeric"
              className={styles.input}
              value={formData.inn}
              onChange={(e) => handleInputChange('inn', e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="10 или 12 цифр"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>КПП</label>
            <input
              type="text"
              inputMode="numeric"
              className={styles.input}
              value={formData.kpp}
              onChange={(e) => handleInputChange('kpp', e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="9 цифр"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Наименование</label>
          <input
            type="text"
            className={styles.input}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="ООО «Компания»"
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>Краткое наименование</label>
            <input
              type="text"
              className={styles.input}
              value={formData.short_name}
              onChange={(e) => handleInputChange('short_name', e.target.value)}
              placeholder="ООО «Компания»"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>ОГРН</label>
            <input
              type="text"
              inputMode="numeric"
              className={styles.input}
              value={formData.ogrn}
              onChange={(e) => handleInputChange('ogrn', e.target.value.replace(/\D/g, '').slice(0, 15))}
              placeholder="13 или 15 цифр"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Юридический адрес</label>
          <input
            type="text"
            className={styles.input}
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Город, улица, дом"
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

      <div className={styles.cardFooter}>
        {footerSlot}
        <IonButton color="primary" className={styles.saveBtn} onClick={handleSave}>
          Сохранить организацию
        </IonButton>
      </div>
    </>
  );

  if (embedded) {
    return <div className={styles.embeddedBody}>{fields}</div>;
  }

  return <div className={styles.card}>{fields}</div>;
};
