import { useState, useCallback } from 'react';

export interface UseValidateReturn {
  errors: Record<string, string>;
  validateField: (field: string, value: any) => string | null;
  validateForm: (formType: string, data: any) => boolean;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
}

// Выносим утилиты валидации из useReg
export const validateRegistrationField = (field: string, value: any): string | null => {
  switch (field) {
    case 'phone':
      if (!value || value.trim() === '') return 'Заполните телефон';
      const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
      return null;
    case 'name':
      if (!value || value.trim() === '') return 'Заполните ФИО';
      return value.length < 2 ? 'Имя должно содержать минимум 2 символа' : null;
    case 'email':
      if (!value || value.trim() === '') return null;
      const emailRegex = /\S+@\S+\.\S+/;
      return emailRegex.test(value) ? null : 'Неверный формат email';
    case 'password':
      if (!value || value.trim() === '') return 'Заполните пароль';
      return value.length < 4 ? 'Пароль должен содержать минимум 4 символа' : null;
    case 'password1':
      if (!value || value.trim() === '') return 'Подтвердите пароль';
      return null;
    case 'userType':
      if (!value) return 'Выберите тип аккаунта';
      return null;
    case 'agreementAccepted':
      if (!value) return 'Необходимо принять пользовательское соглашение';
      return null;
    case 'pincode':
      if (!value || value.trim() === '') return 'Введите код подтверждения';
      return value.length !== 4 ? 'Код должен содержать 4 цифры' : null;
    case 'sms':
      if (!value || value.trim() === '') return 'Введите код из SMS';
      return value.length !== 4 ? 'Код должен содержать 4 цифры' : null;
    default:
      return null;
  }
};

export const validateRegistrationForm = (formType: string, data: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  switch (formType) {
    case 'register':
      const phoneError = validateRegistrationField('phone', data.phone);
      const nameError = validateRegistrationField('name', data.name);
      const emailError = validateRegistrationField('email', data.email);
      const userTypeError = validateRegistrationField('userType', data.userType);
      if (phoneError) errors.phone = phoneError;
      if (nameError) errors.name = nameError;
      if (emailError) errors.email = emailError;
      if (userTypeError) errors.userType = userTypeError;
      break;
      
    case 'password':
      const pwd1Error = validateRegistrationField('password', data.password);
      const pwd2Error = validateRegistrationField('password1', data.password1);
      if (pwd1Error) errors.password = pwd1Error;
      if (pwd2Error) errors.password1 = pwd2Error;
      if (data.password && data.password1 && data.password !== data.password1) {
        errors.password1 = 'Пароли не совпадают';
      }
      break;
      
    case 'agreement':
      const agreementError = validateRegistrationField('agreementAccepted', data.agreementAccepted);
      if (agreementError) errors.agreementAccepted = agreementError;
      break;
      
    case 'recovery_phone':
      const phoneError1 = validateRegistrationField('phone', data.phone);
      if (phoneError1) errors.phone = phoneError1;
      break;
      
    case 'recovery_sms':
      const smsError = validateRegistrationField('sms', data.sms);
      if (smsError) errors.sms = smsError;
      break;
      
  }
  
  return errors;
};

export const useValidate = (): UseValidateReturn => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateField = useCallback((field: string, value: any): string | null => {
    const error = validateRegistrationField(field, value);
    setErrors(prev => ({ ...prev, [field]: error || '' }));
    return error;
  }, []);
  
  const validateForm = useCallback((formType: string, data: any): boolean => {
    const newErrors = validateRegistrationForm(formType, data);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);
  
  const clearErrors = useCallback(() => setErrors({}), []);
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);
  
  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError
  };
};