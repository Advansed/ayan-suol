import { AgreementData } from './Agreement';

export const mockAgreementData: AgreementData = {
  orderId: '12460',
  agreedPrice: 142000,
  contractId: '12460',
  contractDate: '16.12.2025',
  performer: {
    companyName: 'ООО "Транспортные решения"',
    representative: 'Петров Петр Петрович',
    tin: '7701234567',
    address: 'г. Москва, ул. Транспортная, д. 10, офис 5',
    phone: '+7 (495) 123-45-67',
    email: 'info@transport-solutions.ru'
  },
  customer: {
    companyName: 'ООО "Логистика Плюс"',
    representative: 'Николаев Николай Николаевич',
    tin: '7707654321',
    address: 'г. Казань, пр. Логистический, д. 25, офис 12',
    phone: '+7 (843) 987-65-43',
    email: 'contact@logistics-plus.ru'
  },
  route: {
    from: 'Казань',
    to: 'Москва'
  },
  dates: {
    start: '01.04.2025',
    end: '01.04.2025'
  },
  cargo: {
    weight: 38,
    volume: 20
  },
  payment: {
    total: 142000,
    prepayment: 42600,
    prepaymentPercent: 30,
    remaining: 99400
  },
  performerSignature: {
    name: 'Петров Петр Петрович',
    sign: ''
  },
  customerSignature: {
    name: 'Николаев Николай Николаевич',
    sign: ''
  }
};
