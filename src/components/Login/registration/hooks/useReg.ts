import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from './useNavigation';
import { useValidate } from './useValidate';
import { useSocket } from '../../../../Store/useSocket';
import { useToast } from '../../../Toast';

// ======================
// ТИПЫ РЕГИСТРАЦИИ  
// ======================

export interface RegistrationData {
  phone: string;
  name: string;
  email?: string;
  userType: '0' | '1' | '2';
  token?: string;
  status?: string;
  check_id?: string;
  call_phone?: string;
}

export interface RegistrationState {
  registrationData: RegistrationData;
  formData: Record<string, any>;
  isLoading: boolean;
  error: string;
}

export interface UseRegReturn extends RegistrationState {
  // Навигация
  registrationStep: number;
  nextStep: () => void;
  prevStep: () => void;
  
  // Валидация
  formErrors: Record<string, string>;
  validateField: (field: string, value: any) => string | null;
  clearErrors: () => void;
  
  // Основные действия
  register: (data: RegistrationData) => Promise<void>;
  submitStep: () => Promise<void>;
  
  // Утилиты
  updateRegistrationData: (field: string, value: any) => void;
  updateFormData: (field: string, value: any) => void;
}

export interface SocketResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface PasswordData {
  token: string;
  password: string;
  password1: string;
  phone?: string;
  userType?: string;
}

// ======================
// УТИЛИТЫ РЕГИСТРАЦИИ
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
// ХУК РЕГИСТРАЦИИ
// ======================

const INITIAL_REG_STATE: Omit<RegistrationState, 'registrationStep'> = {
  registrationData: {
    phone: '',
    name: '',
    email: '',
    userType: '1',
    token: '',
    status: '',
    check_id: '',
    call_phone: ''
  },
  formData: {},
  isLoading: false,
  error: ''
};

export const useReg = (): UseRegReturn => {
  const navigation = useNavigation(4);
  const validation = useValidate();
  
  const [state, setState] = useState<Omit<RegistrationState, 'registrationStep'>>(INITIAL_REG_STATE);
  const isMountedRef = useRef(true);
  const { socket, emit } = useSocket();
  const toast = useToast();

  // ======================
  // УТИЛИТЫ СОСТОЯНИЯ
  // ======================

  const updateState = useCallback((updates: Partial<RegistrationState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const updateFormData = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
    // Очищаем ошибку поля при изменении значения
    validation.clearFieldError(field);
  }, [validation]);

  const updateRegistrationData = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      registrationData: { ...prev.registrationData, [field]: value }
    }));
  }, []);

  // ======================
  // ОСНОВНЫЕ ДЕЙСТВИЯ
  // ======================

  const register = useCallback(async (userData: RegistrationData) => {
    updateState({ isLoading: true, error: '' });
    validation.clearErrors();

    try {
      const phone = Phone(userData.phone);
      if (phone.length !== 12) {
        updateState({ error: 'Заполните телефон', isLoading: false });
        return;
      }
      if (userData.name.length === 0) {
        updateState({ error: 'Заполните ФИО', isLoading: false });
        return;
      }

      console.log("userData", userData);
      const success = emit('check_registration', {
        code: phone,
        name: userData.name.trim(),
        email: userData.email?.trim() || '',
        userType: userData.userType
      });

      if (!success) {
        throw new Error('Нет подключения к серверу');
      }

    } catch (error) {
      console.error('Registration error:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Ошибка регистрации', 
        isLoading: false 
      });
    }
  }, [updateState, validation, emit]);

  const checkSMS = useCallback(async (data: { token?: string; pincode?: string }) => {
    updateState({ isLoading: true, error: '' });
    validation.clearErrors();

    try {
      console.log("check_sms");
      const success = emit('check_sms', {
        token: data.token,
        pincode: data.pincode
      });

      if (!success) {
        throw new Error('Нет подключения к серверу');
      }

    } catch (error) {
      console.error('SMS check error:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Ошибка проверки SMS', 
        isLoading: false 
      });
    }
  }, [updateState, validation, emit]);

  // ======================
  // НАВИГАЦИЯ ПО ШАГАМ
  // ======================

  const submitStep = useCallback(async () => {
    console.log("regData", state.registrationData);
    
    switch (navigation.currentStep) {
      case 0:
        // Проверяем соглашение на шаге выбора роли
        if (!validation.validateForm('agreement', state.formData)) {
          return;
        }
        navigation.nextStep();
        break;
        
      case 1:
        // Проверяем данные регистрации
        if (validation.validateForm('register', state.formData)) {
          await register({
            ...state.formData,
            userType: state.registrationData.userType
          } as RegistrationData);
        }
        break;
        
      case 2:
        await checkSMS({
          token: state.registrationData.token,
          pincode: state.formData.pincode
        });
        break;
        
      case 3:
        const passwordData: PasswordData = {
          token: state.registrationData.token || '',
          password: state.formData.password || '',
          password1: state.formData.password1 || '',
          userType: state.registrationData.userType
        };

        if (validation.validateForm('password', passwordData)) {
          emit('save_password', passwordData);
        }
        break;
    }
  }, [navigation, validation, state, register, checkSMS, emit]);

  // ======================
  // SOCKET ОБРАБОТЧИКИ
  // ======================

  useEffect(() => {
    isMountedRef.current = true;

    if (!socket) return;

    const handleRegistration = (response: SocketResponse) => {
      if (!isMountedRef.current) return;

      updateState({ isLoading: false });

      console.log('check_registration on...', response);

      if (response.success) {
        updateRegistrationData('token', response.data.token);
        updateRegistrationData('status', response.data.status);
        updateRegistrationData('check_id', response.data.check_id);
        updateRegistrationData('call_phone', response.data.call_phone);
        navigation.nextStep();
      } else {
        updateState({ error: response.message || 'Ошибка регистрации' });
        toast.error(response.message || "Ошибка регистрации");
      }
    };

    const handleSMSCheck = (response: SocketResponse) => {
      if (!isMountedRef.current) return;

      updateState({ isLoading: false });

      console.log(response);

      if (response.success) {
        console.log("success");
        navigation.nextStep();
      } else {
        console.log("unsuccess");
        updateState({ error: response.message || 'Неверный код' });
      }
    };

    const handleSavePassword = (response: SocketResponse) => {
      if (!isMountedRef.current) return;

      updateState({ isLoading: false });

      if (response.success) {
        console.log("Registration completed successfully");
        updateState({ error: '' });
        navigation.reset();
        // Store.dispatch({ type: "auth", data: true })
        // Store.dispatch({ type: "login", data: response.data })
      } else {
        updateState({ error: response.message || 'Ошибка сохранения пароля' });
      }
    };

    // Подписываемся на события
    socket.on('check_registration', handleRegistration);
    socket.on('check_sms', handleSMSCheck);
    socket.on('save_password', handleSavePassword);

    return () => {
      isMountedRef.current = false;
      
      if (socket) {
        socket.off('check_registration', handleRegistration);
        socket.off('check_sms', handleSMSCheck);
        socket.off('save_password', handleSavePassword);
      }
    };
  }, [socket, updateState, updateRegistrationData, navigation, toast]);

  // ======================
  // ВОЗВРАТ ИНТЕРФЕЙСА
  // ======================

  return {
    // Состояние
    ...state,
    
    // Навигация
    registrationStep: navigation.currentStep,
    nextStep: navigation.nextStep,
    prevStep: navigation.prevStep,
    
    // Валидация
    formErrors: validation.errors,
    validateField: validation.validateField,
    clearErrors: validation.clearErrors,
    
    // Основные действия
    register,
    submitStep,
    
    // Утилиты
    updateRegistrationData,
    updateFormData
  };
};