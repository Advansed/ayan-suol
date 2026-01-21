import React, { useState, useEffect, useRef } from 'react';

interface PaymentData {
  success:          boolean;
  payment_id:       string;
  payment_url:      string;
  sbp_deep_link?:   string;
  sbp_payload?:     string;
  order_id:         string;
  status:           string;
  type?:            string; // Добавляем тип для определения SBP
}

interface TBankPaymentProps {
  paymentData: PaymentData;
  onClose:            ( ) => void;
  onPaymentSuccess?:  ( data: any) => void;
  onPaymentFail?:     ( data: any) => void;
}

const TBankPayment: React.FC<TBankPaymentProps> = ({ 
  paymentData, 
  onClose,
  onPaymentSuccess,
  onPaymentFail 
}) => {
  const [ isLoading, setIsLoading ] = useState(true);
  const [ iframeKey, setIframeKey ] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Определяем URL для iframe в зависимости от типа платежа
  const getPaymentUrl = (): string => {
    if (paymentData.type === 'sbp' && paymentData.sbp_payload ) {
      
      console.log('🔗 Используем SBP deep link:', paymentData.sbp_payload);
      
      return paymentData.sbp_payload;
      
    }
    console.log('🌐 Используем стандартный payment_url:', paymentData.payment_url);
    return paymentData.payment_url;
  };

  const paymentUrl = getPaymentUrl();

  // Обработчик сообщений от iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Проверяем источник сообщения для безопасности
      try {
        if (event.origin !== new URL(paymentUrl).origin) {
          return;
        }
      } catch (error) {
        console.log('⚠️ Не удалось проверить origin сообщения');
      }

      console.log('📨 Сообщение от iframe:', event.data);

      // Обрабатываем различные типы сообщений
      if (event.data.type === 'payment_close') {
        console.log('🔵 Кнопка "Закрыть" нажата в iframe');
        handleClose();
      } else if (event.data.type === 'payment_success') {
        console.log('✅ Платеж успешно завершен');
        onPaymentSuccess?.(event.data);
        handleClose();
      } else if (event.data.type === 'payment_failed') {
        console.log('❌ Платеж не удался');
        onPaymentFail?.(event.data);
      } else if (event.data === 'close' || event.data === 'payment_close') {
        // Простые строковые сообщения
        console.log('🔵 Получено сообщение о закрытии');
        handleClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [paymentUrl, onClose, onPaymentSuccess, onPaymentFail]);

  // Периодическая проверка состояния iframe
  useEffect(() => {
    const checkIframeContent = () => {
      if (!iframeRef.current) return;

      try {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc) {
          // Ищем кнопки закрытия по разным селекторам
          const closeButtons = iframeDoc.querySelectorAll([
            'button[class*="close"]',
            'button[class*="cancel"]',
            'button[class*="exit"]',
            '.close-btn',
            '.cancel-btn',
            '.exit-btn',
            '[aria-label*="close"]',
            '[aria-label*="cancel"]'
          ].join(','));

          closeButtons.forEach(button => {
            if (!button.hasAttribute('data-tbank-listener')) {
              button.setAttribute('data-tbank-listener', 'true');
              button.addEventListener('click', () => {
                console.log('🔄 Кнопка закрытия найдена и нажата');
                handleClose();
              });
            }
          });

          // Проверяем URL iframe на наличие параметров успеха/ошибки
          const iframeUrl = iframe.contentWindow?.location.href;
          if (iframeUrl) {
            if (iframeUrl.includes('success=true') || iframeUrl.includes('status=success')) {
              console.log('✅ Обнаружен успешный платеж по URL');
              onPaymentSuccess?.({ url: iframeUrl });
              handleClose();
            } else if (iframeUrl.includes('success=false') || iframeUrl.includes('status=failed')) {
              console.log('❌ Обнаружен неудачный платеж по URL');
              onPaymentFail?.({ url: iframeUrl });
            }
          }
        }
      } catch (error) {
        // Игнорируем ошибки CORS
      }
    };

    const interval = setInterval(checkIframeContent, 1000);
    return () => clearInterval(interval);
  }, [onPaymentSuccess, onPaymentFail]);

  const handleClose = () => {
    console.log('🔴 Закрытие платежного окна');
    onClose();
  };

  const handleRetry = () => {
    console.log('🔄 Перезагрузка iframe');
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  // Получаем заголовок в зависимости от типа платежа
  const getPaymentTitle = (): string => {
    if (paymentData.type === 'sbp') {
      return 'Оплата через СБП';
    }
    return 'Оплата через Т-Банк';
  };

  if (!paymentUrl) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h3>Не удалось загрузить платежную страницу</h3>
        <button onClick={handleClose}>Закрыть</button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Шапка */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#333' }}>{getPaymentTitle()}</h3>
          <small style={{ color: '#666' }}>ID: {paymentData.payment_id}</small>
          {paymentData.type === 'sbp' && (
            <div style={{ color: '#2196F3', fontSize: '12px', marginTop: '2px' }}>
              💰 Система быстрых платежей
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleRetry}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Обновить
          </button>
          <button 
            onClick={handleClose}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Закрыть
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 10
          }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>
              {paymentData.type === 'sbp' ? 'Загрузка страницы СБП...' : 'Загрузка платежной страницы...'}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Пожалуйста, подождите</div>
          </div>
        )}
        
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={paymentUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
          onLoad={() => {
            console.log('✅ Iframe загружен');
            setIsLoading(false);
            
            // Пытаемся отправить сообщение в iframe для настройки связи
            setTimeout(() => {
              if (iframeRef.current) {
                try {
                  iframeRef.current.contentWindow?.postMessage({
                    type: 'parent_ready',
                    message: 'Родительская страница готова'
                  }, '*');
                } catch (error) {
                  console.log('⚠️ Не удалось отправить сообщение в iframe');
                }
              }
            }, 1000);
          }}
          onError={() => {
            console.error('❌ Ошибка загрузки iframe');
            setIsLoading(false);
          }}
          title={getPaymentTitle()}
          allow="payment *"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"
        />
      </div>

      {/* Информационная панель */}
      <div style={{
        padding: '10px 15px',
        borderTop: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        fontSize: '12px',
        color: '#666'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Статус: {isLoading ? 'Загрузка...' : 'Готов'}</span>
          <span>Не закрывайте страницу до завершения оплаты</span>
        </div>
        {paymentData.type === 'sbp' && (
          <div style={{ marginTop: '5px', color: '#2196F3' }}>
            💡 Оплата через Систему быстрых платежей
          </div>
        )}
      </div>
    </div>
  );
};

export default TBankPayment;