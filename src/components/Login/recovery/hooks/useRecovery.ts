import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '../../registration/hooks/useNavigation';
import { useValidate } from '../../registration/hooks/useValidate';
import { useSocket } from '../../../../Store/useSocket';
import { useToast } from '../../../Toast';
import { loginActions, useLoginStore } from '../../../../Store/loginStore';
import type { OtpTransport } from '../../otpTransport';
import { normalizeOtpTransport, OTP_TRANSPORT_DEFAULT } from '../../otpTransport';
import { parseLoginPhone } from '../../phone';
import { tokenFromCheckSmsResponse } from '../../tokenFromOtpResponse';

export interface RecoveryLocalState {
  formData: Record<string, any>;
  isLoading: boolean;
  error: string;
}

export interface UseRecoveryReturn extends RecoveryLocalState {
  recoveryStep: number;
  nextStep: () => void;
  prevStep: () => void;
  /** Канал OTP из loginStore (после шага телефона) */
  otpTransport: OtpTransport;
  errors: Record<string, string>;
  validateField: (field: string, value: any) => string | null;
  clearErrors: () => void;
  submitRecoveryStep: () => Promise<void>;
  updateFormData: (field: string, value: any) => void;
  resetRecovery: () => void;
}

export interface SocketResponse {
  success: boolean;
  data?: any;
  message?: string;
}

const INITIAL_STATE: RecoveryLocalState = {
  formData: { transport: OTP_TRANSPORT_DEFAULT },
  isLoading: false,
  error: ''
};

export const useRecovery = (onSwitchToLogin?: () => void): UseRecoveryReturn => {
  const navigation = useNavigation(3);
  const validation = useValidate();
  const [state, setState] = useState<RecoveryLocalState>(INITIAL_STATE);
  const isMountedRef = useRef(true);
  const { socket, emit } = useSocket();
  const toast = useToast();

  const otpTransport = useLoginStore((s) => normalizeOtpTransport(s.transport));

  const updateState = useCallback((updates: Partial<RecoveryLocalState>) => {
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  const updateFormData = useCallback(
    (field: string, value: any) => {
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, [field]: value }
      }));
      validation.clearFieldError(field);
      if (field === 'pincode') validation.clearFieldError('sms');
    },
    [validation]
  );

  const resetRecovery = useCallback(() => {
    setState(INITIAL_STATE);
    validation.clearErrors();
    navigation.reset();
    loginActions.setToken('');
    if (onSwitchToLogin) onSwitchToLogin();
  }, [validation, navigation, onSwitchToLogin]);

  const emitCheckPhone = useCallback(async () => {
    updateState({ isLoading: true, error: '' });
    validation.clearErrors();

    try {
      const parsedPhone = parseLoginPhone(state.formData.phone);
      if (!parsedPhone.ok) {
        updateState({ error: parsedPhone.error, isLoading: false });
        return;
      }

      const transport = normalizeOtpTransport(state.formData.transport);
      loginActions.updateUser({ phone: parsedPhone.e164, transport });

      const success = emit('check_phone', {
        phone: parsedPhone.e164,
        type: 1,
        transport
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
  }, [updateState, validation, emit, state.formData.phone, state.formData.transport]);

  const emitCheckSms = useCallback(async () => {
    updateState({ isLoading: true, error: '' });
    validation.clearErrors();

    try {
      const login = useLoginStore.getState();
      const transport = normalizeOtpTransport(login.transport);
      const success = emit('check_sms', {
        phone: login.phone,
        pincode: state.formData.pincode,
        transport
      });

      if (!success) {
        throw new Error('Нет подключения к серверу');
      }
    } catch (error) {
      console.error('SMS check error:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Ошибка проверки кода',
        isLoading: false
      });
    }
  }, [updateState, validation, emit, state.formData.pincode]);

  const emitSavePassword = useCallback(async () => {
    const token = (useLoginStore.getState().token || '').trim();
    if (!token) {
      toast.error('Нет токена. Запросите код повторно.');
      return;
    }

    const payload = {
      password: state.formData.password || '',
      password1: state.formData.password1 || ''
    };

    if (!validation.validateForm('password', payload)) {
      return;
    }

    updateState({ isLoading: true, error: '' });

    try {
      const success = emit('save_password', {
        token,
        password: payload.password,
        password1: payload.password1
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
  }, [updateState, validation, emit, state.formData.password, state.formData.password1, toast]);

  const submitRecoveryStep = useCallback(async () => {
    switch (navigation.currentStep) {
      case 0:
        if (validation.validateForm('recovery_phone', { phone: state.formData.phone })) {
          await emitCheckPhone();
        }
        break;
      case 1:
        if (
          validation.validateForm('recovery_sms', { sms: state.formData.pincode })
        ) {
          await emitCheckSms();
        }
        break;
      case 2:
        await emitSavePassword();
        break;
    }
  }, [
    navigation.currentStep,
    validation,
    state.formData.phone,
    state.formData.pincode,
    emitCheckPhone,
    emitCheckSms,
    emitSavePassword
  ]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!socket) return;

    const handleCheckPhone = (response: SocketResponse) => {
      if (!isMountedRef.current) return;

      if (response.success) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          formData: {
            ...prev.formData,
            pincode: '',
            password: '',
            password1: ''
          }
        }));
        const via = normalizeOtpTransport(useLoginStore.getState().transport);
        toast.success(
          via === 'telegram'
            ? 'Код отправлен в Telegram'
            : 'SMS с кодом подтверждения отправлено на ваш телефон'
        );
        navigation.nextStep();
      } else {
        updateState({
          isLoading: false,
          error: response.message || 'Ошибка проверки телефона'
        });
        toast.error(response.message || 'Ошибка проверки телефона');
      }
    };

    const handleCheckSms = (response: SocketResponse) => {
      if (!isMountedRef.current) return;

      updateState({ isLoading: false });

      console.log("handleCheckSms", response);
      if (response.success) {
        const token = tokenFromCheckSmsResponse(response.data);
        if (token) {
          loginActions.setToken(token);
        }
        navigation.nextStep();
      } else {
        updateState({ error: response.message || 'Неверный код' });
        toast.error(response.message || 'Неверный код');
      }
    };

    const handleSavePassword = (response: SocketResponse) => {
      if (!isMountedRef.current) return;

      updateState({ isLoading: false });

      if (response.success) {
        toast.success('Пароль успешно изменён!');
        resetRecovery();
      } else {
        updateState({ error: response.message || 'Ошибка сохранения пароля' });
        toast.error(response.message || 'Ошибка сохранения пароля');
      }
    };

    socket.on('check_phone', handleCheckPhone);
    socket.on('check_sms', handleCheckSms);
    socket.on('save_password', handleSavePassword);

    return () => {
      isMountedRef.current = false;
      socket.off('check_phone', handleCheckPhone);
      socket.off('check_sms', handleCheckSms);
      socket.off('save_password', handleSavePassword);
    };
  }, [socket, updateState, navigation, toast, resetRecovery]);

  return {
    ...state,
    recoveryStep: navigation.currentStep,
    nextStep: navigation.nextStep,
    prevStep: navigation.prevStep,
    otpTransport,
    errors: validation.errors,
    validateField: validation.validateField,
    clearErrors: validation.clearErrors,
    submitRecoveryStep,
    updateFormData,
    resetRecovery
  };
};
