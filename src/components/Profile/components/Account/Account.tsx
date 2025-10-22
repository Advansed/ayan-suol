import React, { useEffect, useState } from 'react';
import styles from './Account.module.css';
import { WizardHeader } from '../../../DataEditor/components/WizardHeader';
import { AccountProps } from '../../../../Store/accountStore';
import { 
    addOutline, 
    walletOutline, 
    closeOutline, 
    arrowDown,
    arrowUp,
    printOutline
} from 'ionicons/icons';
import { IonIcon, IonSpinner } from '@ionic/react';
import { useAccount } from './useAccount';
import { useLoginStore } from '../../../../Store/loginStore';
import { formatters } from '../../../Cargos';
import Invoice from './Invoice'; // Импортируем компонент счета
import { useToast } from '../../../Toast';
import { useCompanyStore } from '../../../../Store/companyStore';

export const Account: React.FC<AccountProps> = ({ onBack }) => {
  const { 
    transactions, 
    accountData, 
    isLoading, 
    set_payment, 
    get_transactions, 
    get_balanse,
    get_seller,
    set_invoice,
    get_invoice
  } = useAccount();
  
  const [amount,          setAmount]                = useState('');
  const [showTopUpForm,   setShowTopUpForm]         = useState(false);
  const [showInvoiceForm, setShowInvoiceForm]       = useState<any>();
  const [invoiceData,     setInvoiceData]           = useState<any>();
  const [sellerData, setSellerData] = useState<any>(null);

  const toast             = useToast()
  const seller_id         = useLoginStore(state     => state.seller )
  const companyData       = useCompanyStore(state   => state.data)


  const id = useLoginStore(state => state.id)

  useEffect(() => {
    get_balanse()
    get_transactions()
  }, [])

  useEffect(() => {
    console.log(accountData?.balance)
    console.log(accountData?.currency)
  }, [accountData])

  // Загрузка данных продавца
  useEffect(() => {
    const loadSellerData = async () => {
      const result = await get_seller();
      if (result.success) {
        setSellerData(result.data);
      }
    };
    
    if (showInvoiceForm) {
      loadSellerData();
    }
  }, [showInvoiceForm]);

  const handlePayment1 = async () => {
    const res = await set_payment({
      type: 1,
      amount: parseFloat(amount),
      description: "Пополнение лицевого счета " + id
    })
    console.log(res)
    if(res.success){
      window.open(res.data.payment_url);
    }
  }

  const handlePayment2 = async () => {
    const res = await set_payment({
      type: 1,
      amount: parseFloat(amount),
      description: "Пополнение лицевого счета " + id
    })
    console.log(res)

    if(res.success){
      window.open(res.data.sbp_payload);
    }
  }

  // Создание счета
  const handleCreateInvoice = async () => {
    const invoiceData = {
      invoice_date:     new Date().toISOString().split('T')[0],
      seller_id:        seller_id,
      payment_due:      "10 дней",
      payment_purpose:  `Пополнение счета от ${new Date().toLocaleDateString()}`,
      signer:           "Егоров Д.Н.",
      total_amount:     parseFloat(amount),
      vat_amount: 0,
      items: [
        { 
          item_name: "Пополнение баланса", 
          qty: 1, 
          unit: "шт.", 
          price: parseFloat(amount), 
          total: parseFloat(amount) 
        }
      ]
    };

    const result = await set_invoice( invoiceData );
    console.log( result )

    setShowInvoiceForm( result.data )

  };

  const handleOpenInvoice = async(id: string) => {
    
    console.log("get_invoice", id)
    
    const res = await get_invoice( id ); 

    console.log(res)

    if(res.success) setShowInvoiceForm(res.data)
  }

  if (isLoading && !accountData?.balance) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>{"Загрузка данных..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <WizardHeader
        title="Финансовый счет"
        pages=""
        onBack={onBack}
        onClose={onBack}
        onForward={() => {}}
        isLastStep={true}
        canGoBack={true}
        canGoForward={false}
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
            <div className={styles.buttonGroup}>
              <button 
                className={styles.topUpButton}
                onClick={() => setShowTopUpForm(!showTopUpForm)}
              >
                <IonIcon icon={addOutline} className={styles.topUpIcon} />
                {showTopUpForm ? "Отмена" : "Пополнить"}
              </button>
            </div>
          </div>
        </div>

        {/* Форма пополнения счета */}
        {showTopUpForm && (
          <div className={styles.topUpBalanceCard}>
            <div className={styles.topUpBalanceHeader}>
              <h2 className={styles.topUpBalanceTitle}>
                {"Пополнение счета " + (amount !== '' ? "на " + formatters.currency(parseFloat(amount)) : "")}
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

              <div className='flex'>
                <button 
                  type="button" 
                  className={`${styles.topUpSubmitBtn} ${isLoading ? styles.loading : ''}`}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  onClick={handlePayment1}
                >
                  {isLoading ? "Обработка..." : "Карта"}
                </button>
                <button 
                  type="button" 
                  className={"ml-1 " + `${styles.topUpSubmitBtn} ${isLoading ? styles.loading : ''}`}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  onClick={handlePayment2}
                >
                  {isLoading ? "Обработка..." : "СБП"}
                </button>
              </div>
                <button 
                  type="button" 
                  className={ `${styles.topUpSubmitBtn} ${isLoading ? styles.loading : ''}`}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  onClick = { handleCreateInvoice }
                >
                  {isLoading ? "Обработка..." : "Оплата по счету"}
                </button>
            </form>
          </div>
        )}

        {/* Форма создания счета */}

        {
          showInvoiceForm !== undefined && (
            <Invoice
                isOpen            = { showInvoiceForm !== undefined }
                onClose           = { () => setShowInvoiceForm( undefined ) }
                inv               = { showInvoiceForm }
            />
          )
        }

        {/* История транзакций */}
        <div className={styles.transactionsCard}>
          <h2 className={styles.cardTitle}>{"История операций"}</h2>
          <div className={styles.transactionsList}>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className={styles.transaction}
                  onClick = { () => handleOpenInvoice( transaction.id ) }
                >
                  <div className={styles.transactionIcon}>
                    {
                          isLoading ? <IonSpinner name="bubbles"/>
                        : transaction.type === 'inv' ? <IonIcon icon        = { printOutline } className   = { styles.transactionIcon }/>
                        : transaction.type === 'new' ? <IonSpinner name="dots"/>
                        : transaction.type === 'income' ? <IonIcon icon        = { arrowDown } className   = { styles.incomeIcon }/>
                        : <IonIcon icon = { arrowUp } className   = { styles.expenseIcon }/>
                    }
                  </div>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionTitle}>{transaction.title}</div>
                    <div className={styles.transactionDate}>
                      {transaction.date}
                    </div>
                  </div>
                  <div className={`${styles.transactionAmount} ${
                    transaction.type    === "income" ?  styles.positive 
                    : transaction.type  === "new" ?     styles.transactionIcon 
                    : transaction.type  === "inv" ?     styles.transactionIcon 
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