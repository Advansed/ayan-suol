import React, { useEffect, useState }   from 'react';
import styles                           from './Account.module.css';
import { WizardHeader }                 from '../../../DataEditor/components/WizardHeader';
import { AccountProps}                  from '../../../../Store/accountStore';
import { 
    addOutline, 
    walletOutline, 
    closeOutline, 
    arrowDown,
    arrowUp,
    arrowForward}                            from 'ionicons/icons';
import { IonIcon, IonSpinner }                      from '@ionic/react';
import { useAccount }                   from './useAccount';
import { useLoginStore }                from '../../../../Store/loginStore';
import { formatters }                   from '../../../Cargos';


export const Account: React.FC<AccountProps> = ({ onBack }) => {
  const { transactions, accountData, isLoading, set_payment, get_transactions, get_balanse } = useAccount();
  const [amount, setAmount] = useState('');
  const [showTopUpForm, setShowTopUpForm] = useState(false);

  const id = useLoginStore(state => state.id )

  useEffect(()=>{
      get_balanse()

      get_transactions()
  },[])

  useEffect(()=>{
    console.log(accountData?.balance)
    console.log(accountData?.currency)
  },[accountData])

  const handlePayment1 = async () => {
    
      const res = await set_payment({
          type:         1,
          amount:       parseFloat( amount ),
          description:  "Пополнение лицевого счета " + id
      })
      console.log( res )
      if( res.success ){
        window.open( res.data.payment_url );
      }
  }

  const handlePayment2 = async () => {
    
      const res = await set_payment({
          type:         1,
          amount:       parseFloat( amount ),
          description:  "Пополнение лицевого счета " + id
      })
      console.log(res)

      if( res.success ){
        window.open( res.data.sbp_payload );
      }
  }

  if (isLoading && !accountData?.balance) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>{ "Загрузка данных..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* WizardHeader от DataEditor */}
      <WizardHeader
        title         = { "Финансовый счет" }
        pages         = ""
        onBack        = { onBack }
        onClose       = { onBack }
        onForward     = { () => {} } // Не используется
        isLastStep    = { true }
        canGoBack     = { true }
        canGoForward  = { false }
      />

      <div className={styles.content}>
        {/* Компактная карточка баланса */}
        <div className={styles.balanceCard}>
          <div className={styles.balanceContent}>
            <div className={styles.balanceInfo}>
              <div className={styles.balanceIcon}>
                <IonIcon icon={walletOutline} />
              </div>
              <div className={styles.balanceText}>
                <div className={styles.balanceLabel}>Баланс счета</div>
                <div className={styles.balanceAmount}>
                  {accountData?.balance?.toLocaleString('ru-RU', { 
                    style: 'currency', 
                    currency: accountData?.currency,
                    maximumFractionDigits: 0 
                  })}
                </div>
              </div>
            </div>
            <button 
              className={styles.topUpButton}
              onClick={() => setShowTopUpForm(!showTopUpForm)}
            >
              <IonIcon icon={addOutline} className={styles.topUpIcon} />
              {showTopUpForm ? "Отмена" : "Пополнить"}
            </button>
          </div>
        </div>

        {/* Форма пополнения счета */}
        {showTopUpForm && (
          <div className={styles.topUpBalanceCard}>
            <div className={styles.topUpBalanceHeader}>
              <h2 className={styles.topUpBalanceTitle}>
                { "Пополнение счета " + (amount !== '' ? "на " + formatters.currency( parseFloat(amount) ) : "") }
              </h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowTopUpForm(false)}
              >
                <IonIcon icon={closeOutline} />
              </button>
            </div>
            <form className={styles.topUpForm}>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className={styles.topUpInput}
                    min={1}
                    step={1}
                  />
                  <span className={styles.topUpCurrency}>₽</span>
                </div>
              </div>

              <div className='flex '>
                <button 
                  type="submit" 
                  className ={`${styles.topUpSubmitBtn} ${isLoading ? styles.loading : ''}`}
                  disabled  ={!amount || parseFloat(amount) <= 0 || isLoading}
                  onClick   ={ handlePayment1 }
                >
                  {isLoading ? "Обработка..." : "Карта"}
                </button>
                <button 
                  type="submit" 
                  className ={"ml-1 " + `${styles.topUpSubmitBtn} ${isLoading ? styles.loading : ''}`}
                  disabled  ={!amount || parseFloat(amount) <= 0 || isLoading}
                  onClick   ={ handlePayment2 }
                >
                  {isLoading ? "Обработка..." : "СБП"}
                </button>

              </div>
            </form>
          </div>
        )}

        {/* История транзакций */}
        <div className={styles.transactionsCard}>
          <h2 className={styles.cardTitle}>{ "История операций" }</h2>
          <div className={styles.transactionsList}>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className={styles.transaction}>
                  <div className={styles.transactionIcon}>
                    {
                      transaction.type === 'new' && (
                        <IonSpinner name="dots" />
                      )
                    }
                    {
                      transaction.type !== 'new' && (
                        <IonIcon 
                          icon={
                              transaction.type === "income" ? arrowDown 
                              : arrowUp
                          } 
                          className={
                            transaction.type === "income" ? styles.incomeIcon 
                            : styles.expenseIcon
                          }
                        />
                      )
                    }
                  </div>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionTitle}>{transaction.title}</div>
                    <div className={styles.transactionDate}>
                      { transaction.date }
                    </div>
                  </div>
                  <div className={`${styles.transactionAmount} ${
                    transaction.type === "income" ? styles.positive 
                    : transaction.type === "new" ? styles.newIcon 
                    : styles.negative
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      maximumFractionDigits: 0
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📊</div>
                <p>{"Операций пока нет"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
