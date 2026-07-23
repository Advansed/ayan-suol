import React from 'react';
import styles from './RoleToggle.module.css';

type RoleToggleProps = {
  userType: number;
  onChange: (userType: number) => void;
  disabled?: boolean;
};

export const RoleToggle: React.FC<RoleToggleProps> = ({ userType, onChange, disabled }) => {
  return (
    <div className={styles.toggle} role="group" aria-label="Режим работы">
      <button
        type="button"
        className={`${styles.btn} ${userType === 2 ? styles.active : ''}`}
        onClick={() => onChange(2)}
        disabled={disabled || userType === 2}
      >
        Исполнитель
      </button>
      <button
        type="button"
        className={`${styles.btn} ${userType === 1 ? styles.active : ''}`}
        onClick={() => onChange(1)}
        disabled={disabled || userType === 1}
      >
        Заказчик
      </button>
    </div>
  );
};
