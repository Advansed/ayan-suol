import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '../../registration/hooks/useNavigation';
import { useValidate } from '../../registration/hooks/useValidate';
import { useSocket } from '../../../../Store/useSocket';
import { useToast } from '../../../Toast';
import { loginActions, useToken } from '../../../../Store/loginStore';
// ======================
// ТИПЫ ВОССТАНОВЛЕНИЯ  
// ======================

export interface RecoveryData {
  phone: string;
  sms: string;
  password: string;
  password1: string;
  token?: string;
}

export interface RecoveryState {
  recoveryData: RecoveryData;
  isLoading: boolean;
  error: string;
}

export interface UseRecoveryReturn extends RecoveryState {
  // Навигация
  recoveryStep: number;
  nextStep: () => void;
  prevStep: () => void;
  
  // Валидация
  errors: Record<string, string>;
  validateField: (field: string, value: any) => string | null;
  clearErrors: () => void;
  
  // Основные действия
  checkPhone: (phone: string) => Promise<void>;
  savePassword: (sms: string, password: string, password1: string) => Promise<void>;
  submitRecoveryStep: () => Promise<void>;
  
  // Утилиты
  updateRecoveryData: (field: string, value: any) => void;
  resetRecovery: () => void;
}

export interface SocketResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// ======================
// УТИЛИТЫ ВОССТАНОВЛЕНИЯ
// ======================

export const Phone = (phone: string): string => {
  if (!phone) return '';
  let str = '+';
  for (let i = 0; i < phone.length; i++) {
    const ch = phone.charCodeAt(i);
    if (ch >= 48 && ch <= 57) str = str + phone.charAt(i);
  }
  return str;
};

// ======================
// ХУК ВОССТАНОВЛЕНИЯ
// ======================

const INITIAL_RECOVERY_STATE: Omit<RecoveryState, 'recoveryStep'> = {
  recoveryData: {
    phone: '',
    sms: '',
    password: '',
    password1: '',
    token: ''
  },
  isLoading: false,
  error: ''
};

export const useRecovery = ( onSwitchToLogin ): UseRecoveryReturn => {
  const navigation = useNavigation(2); // Только 2 шага
  const validation = useValidate();
  
  const [state, setState] = useState<Omit<RecoveryState, 'recoveryStep'>>(INITIAL_RECOVERY_STATE);
  const isMountedRef = useRef(true);
  const { socket, emit } = useSocket();
  const toast = useToast();

  const token = useToken()

  useEffect(()=>{
    console.log('token', token) 
  },[token])
  // ======================
  // УТИЛИТЫ СОСТОЯНИЯ
  // ======================

  const updateState = useCallback((updates: Partial<RecoveryState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const updateRecoveryData = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      recoveryData: { ...prev.recoveryData, [field]: value }
    }));
    // Очищаем ошибку поля при изменении значения
    validation.clearFieldError(field);
  }, [validation]);

  const resetRecovery = useCallback(() => {
    setState(INITIAL_RECOVERY_STATE);
    validation.clearErrors();
    navigation.reset();

    if(onSwitchToLogin)
        onSwitchToLogin()
  }, [validation, navigation]);

  // ======================
  // ОСНОВНЫЕ ДЕЙСТВИЯ
  // ======================

  const checkPhone = useCallback(async (phone: string) => {
    updateState({ isLoading: true, error: '' });
    validation.clearErrors();

    try {
      const formattedPhone = Phone(phone);
      if (formattedPhone.length !== 12) {
        updateState({ error: 'Заполните телефон', isLoading: false });
        return;
      }

      console.log("Checking phone for recovery:", formattedPhone);
      const success = emit('check_phone', {
        phone: formattedPhone,
        type: 1 // Тип 1 для восстановления пароля
      });

      if (!success) {
        throw new Error('Нет подключения к серверу');
      }

    } catch (error) {
      console.error('Phone check error:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Ошибка проверки телефона', 
        isLoading: false 
      });
    }
  }, [updateState, validation, emit]);

  const savePassword = useCallback(async (sms: string, password: string, password1: string) => {
    updateState({ isLoading: true, error: '' });
    validation.clearErrors();

    try {
      if (!sms || sms.length !== 4) {
        updateState({ error: 'Введите 4-значный код из SMS', isLoading: false });
        return;
      }

      if (!password || !password1) {
        updateState({ error: 'Заполните оба поля пароля', isLoading: false });
        return;
      }

      if (password !== password1) {
        updateState({ error: 'Пароли не совпадают', isLoading: false });
        return;
      }

      console.log("Saving new password with token:", state.recoveryData.token);
      const success = emit('save_password', {
        token:      token || '',
        sms:        sms,
        password:   password,
        password1:  password1
      });

      if (!success) {
        throw new Error('Нет подключения к серверу');
      }

    } catch (error) {
      console.error('Save password error:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Ошибка сохранения пароля', 
        isLoading: false 
      });
    }
  }, [updateState, validation, emit, state.recoveryData.token]);

  // ======================
  // НАВИГАЦИЯ ПО ШАГАМ
  // ======================

  const submitRecoveryStep = useCallback(async () => {
    console.log("Recovery data:", state.recoveryData);
    
    switch (navigation.currentStep) {
      case 0:
        // Шаг 1: Проверка телефона
        if (validation.validateForm('recovery_phone', { phone: state.recoveryData.phone })) {
          await checkPhone(state.recoveryData.phone);
        }
        break;
        
      case 1:
        // Шаг 2: Сохранение нового пароля
        if (validation.validateForm('password', { 
          password: state.recoveryData.password, 
          password1: state.recoveryData.password1 
        })) {
          await savePassword(
            state.recoveryData.sms,
            state.recoveryData.password,
            state.recoveryData.password1
          );
        }
        break;
    }
  }, [navigation, validation, state.recoveryData, checkPhone, savePassword]);

  // ======================
  // SOCKET ОБРАБОТЧИКИ
  // ======================

  useEffect(() => {
    isMountedRef.current = true;

    if (!socket) return;

    const handleCheckPhone = (response: SocketResponse) => {
      if (!isMountedRef.current) return;

      updateState({ isLoading: false });

      console.log('check_phone response:', response);

      if (response.success) {
        // Сохраняем токен и переходим к следующему шагу
        updateRecoveryData('token', response.data.token);
        
        loginActions.setToken( response.data.token )

        toast.success("SMS с кодом подтверждения отправлено на ваш телефон");
        navigation.nextStep();
      } else {
        updateState({ error: response.message || 'Ошибка проверки телефона' });
        toast.error(response.message || "Ошибка проверки телефона");
      }
    };

    const handleSavePassword = (response: SocketResponse) => {
      if (!isMountedRef.current) return;

      updateState({ isLoading: false });

      console.log('save_password response:', response);

      if (response.success) {
        // Успешное восстановление пароля
        toast.success("Пароль успешно изменен!");
        // Сбрасываем форму
        resetRecovery();
        // Здесь можно добавить автоматический переход на авторизацию
        // или вызвать callback для перехода
      } else {
        updateState({ error: response.message || 'Ошибка сохранения пароля' });
        toast.error(response.message || "Ошибка сохранения пароля");
      }
    };

    // Подписываемся на события
    socket.on('check_phone', handleCheckPhone);
    socket.on('save_password', handleSavePassword);

    return () => {
      isMountedRef.current = false;
      
      if (socket) {
        socket.off('check_phone', handleCheckPhone);
        socket.off('save_password', handleSavePassword);
      }
    };
  }, [socket, updateState, updateRecoveryData, navigation, toast, resetRecovery]);

  // ======================
  // ВОЗВРАТ ИНТЕРФЕЙСА
  // ======================

  return {
    // Состояние
    ...state,
    
    // Навигация
    recoveryStep: navigation.currentStep,
    nextStep: navigation.nextStep,
    prevStep: navigation.prevStep,
    
    // Валидация
    errors: validation.errors,
    validateField: validation.validateField,
    clearErrors: validation.clearErrors,
    
    // Основные действия
    checkPhone,
    savePassword,
    submitRecoveryStep,
    
    // Утилиты
    updateRecoveryData,
    resetRecovery
  };
};