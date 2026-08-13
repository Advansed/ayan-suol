import React, { useEffect, useMemo, useState } from 'react';
import { IonCheckbox, IonIcon } from '@ionic/react';
import { businessOutline } from 'ionicons/icons';
import { CustomerInfo } from './CustomerInfo';
import { useProfile } from '../useProfile';
import styles from '../../Profile/Profile.module.css';
import { useAgreements } from '../../ProfileOld/components/Agreements/useAgreements';
import { EscrowAgreement } from '../../ProfileOld/components/Agreements/Escrow';
import type { CompanyData } from '../../../Store/companyStore';

export const OrganizationEditPage: React.FC = () => {
  const { companyData, updateCompany } = useProfile();
  const { agreements, toggleAgreement, isLoading } = useAgreements();
  const [isEscrowOpen, setIsEscrowOpen] = useState(false);

  const isOrganizationFilled = (data: Partial<CompanyData> | null | undefined) => {
    if (!data) return false;
    return Boolean(
      data.inn ||
        data.name ||
        data.basis ||
        data.description ||
        data.bank_bik ||
        data.bank_name ||
        data.bank_account ||
        data.bank_corr_account ||
        data.address ||
        data.postal_address
    );
  };

  const organizationFilled = useMemo(() => isOrganizationFilled(companyData), [companyData]);

  useEffect(() => {
    if (organizationFilled && !agreements.userAgreement && !isLoading) {
      toggleAgreement('userAgreement');
    }
  }, [agreements.userAgreement, isLoading, organizationFilled, toggleAgreement]);

  const handleSaveCompany = async (data: Partial<CompanyData>) => {
    const nextCompany = { ...(companyData || {}), ...data };
    const nextFilled = isOrganizationFilled(nextCompany);

    if (nextFilled && !agreements.userAgreement) {
      toggleAgreement('userAgreement');
    }

    await updateCompany(data);
  };

  const escrowConsent = (
    <div className={`${styles.consentBlock} ${styles.consentBlockTop}`}>
      <div className={styles.checkboxWrapper}>
        <IonCheckbox
          checked={agreements.userAgreement}
          disabled={isLoading || organizationFilled}
          onIonChange={() => {
            if (organizationFilled) return;
            toggleAgreement('userAgreement');
          }}
        />
        <div className={styles.consentCheckboxText}>
          <span className={styles.checkboxLabel}>Согласие с договором эскроу</span>
          <button
            type="button"
            className={styles.consentTextLink}
            onClick={() => setIsEscrowOpen(true)}
          >
            Открыть договор
          </button>
        </div>
      </div>
      {organizationFilled && (
        <p className={styles.hintText}>
          После заполнения организации согласие включается автоматически.
        </p>
      )}
    </div>
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardIcon} aria-hidden>
          <IonIcon icon={businessOutline} />
        </div>
        <div>
          <h3 className={styles.cardTitle}>Организация</h3>
          <p className={styles.cardSub}>Реквизиты компании и договор эскроу</p>
        </div>
      </div>

      <CustomerInfo
        embedded
        companyData={companyData}
        onSave={handleSaveCompany}
        consentSlot={escrowConsent}
      />

      <EscrowAgreement isOpen={isEscrowOpen} onClose={() => setIsEscrowOpen(false)} />
    </div>
  );
};
