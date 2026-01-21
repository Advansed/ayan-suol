// components/UserTypeToggleWithIcons.tsx
import React from 'react';
import { User, Car } from 'lucide-react';
import { useLoginStore } from '../../../../Store/loginStore';
import './UserToggle.css';

const UserToggle: React.FC = () => {
  const { user_type, setType } = useLoginStore();

  const options = [
    { value: 1, label: 'Заказчик', icon: <User size={20} />, description: 'Ищу перевозчика' },
    { value: 2, label: 'Водитель', icon: <Car size={20} />, description: 'Предлагаю услуги' }
  ];

  return (
    <div className="user-toggle">

      <div className="user-toggle__grid">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setType(option.value as 1 | 2)}
            className={
              'user-toggle__button' +
              (user_type === option.value ? ' user-toggle__button--active' : '')
            }
          >
            <div
              className={
                'user-toggle__icon' +
                (user_type === option.value ? ' user-toggle__icon--active' : '')
              }
            >
              {option.icon}
            </div>

            <span
              className={
                'user-toggle__title' +
                (user_type === option.value ? ' user-toggle__title--active' : '')
              }
            >
              {option.label}
            </span>

            <span className="user-toggle__description">
              {option.description}
            </span>

            {user_type === option.value && (
              <div className="user-toggle__dot" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserToggle;
