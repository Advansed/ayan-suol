import React, { useEffect, useMemo, useState } from 'react';
import { IonCheckbox, IonIcon } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import { WizardHeader } from '../../Header/WizardHeader';
import { CustomerInfo } from './CustomerInfo';
import { useProfile } from '../useProfile';
import styles from '../Settings.module.css';
import profileStyles from '../../Profile/Profile.module.css';
import { useAgreements } from '../../ProfileOld/components/Agreements/useAgreements';
import { EscrowAgreement } from '../../ProfileOld/components/Agreements/Escrow';
import type { CompanyData } from '../../../Store/companyStore';

export interface OrganizationEditPageProps {
  onBack: () => void;
}

export const OrganizationEditPage: React.FC<OrganizationEditPageProps> = ({ onBack }) => {
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
    // Если организация заполнена, считаем пользователя автоматически согласившимся
    // и делаем галочку обязательной (без возможности снять).
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

  return (
    <div className={styles.settingsContainer}>
      <WizardHeader title="Организация" onBack={onBack} />
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <IonIcon icon={documentTextOutline} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Договор эскроу</h3>
          </div>

          <div className={profileStyles.consentBlock}>
            <div className={profileStyles.checkboxWrapper}>
              <IonCheckbox
                checked={agreements.userAgreement}
                disabled={isLoading || organizationFilled}
                onIonChange={() => {
                  if (organizationFilled) return;
                  toggleAgreement('userAgreement');
                }}
              />

              <div className={profileStyles.consentCheckboxText}>
                <span className={profileStyles.checkboxLabel}>
                  Согласен(на) с договором эскроу
                </span>
                <button
                  type="button"
                  className={profileStyles.consentTextLink}
                  onClick={() => setIsEscrowOpen(true)}
                >
                  Открыть договор
                </button>
              </div>
            </div>

            {organizationFilled && (
              <p className={profileStyles.hintText}>
                Организация заполнена — согласие автоматически включено и обязательно.
              </p>
            )}
          </div>
        </div>

        <CustomerInfo companyData={companyData} onSave={handleSaveCompany} />
      </div>

      <EscrowAgreement isOpen={isEscrowOpen} onClose={() => setIsEscrowOpen(false)} />
    </div>
  );
};
