export const calculatePassportCompletion = (passportData: any): number => {
  if (!passportData) return 0;
  
  const requiredFields = ['series', 'number', 'issueDate', 'issuedBy', 'birthDate', 'birthPlace'];
  const optionalFields = ['regAddress', 'actualAddress', 'passportPhoto', 'passportRegPhoto'];
  
  let filledRequired = 0;
  let filledOptional = 0;
  
  // Проверяем обязательные поля
  requiredFields.forEach(field => {
    if (passportData[field] && passportData[field].toString().trim()) {
      filledRequired++;
    }
  });
  
  // Проверяем дополнительные поля
  optionalFields.forEach(field => {
    if (passportData[field] && passportData[field].toString().trim()) {
      filledOptional++;
    }
  });
  
  // 80% за обязательные поля, 20% за дополнительные
  const requiredPercent = (filledRequired / requiredFields.length) * 80;
  const optionalPercent = (filledOptional / optionalFields.length) * 20;
  
  return Math.round(requiredPercent + optionalPercent);
};

// Расчет completion для транспорта
export const calculateTransportCompletion = (transportData: any): number => {
  if (!transportData) return 0;
  
  const requiredFields = ['name', 'license_plate', 'transport_type', 'load_capacity'];
  const optionalFields = ['manufacture_year', 'experience', 'image', 'vin'];
  
  let filledRequired = 0;
  let filledOptional = 0;
  
  // Проверяем обязательные поля
  requiredFields.forEach(field => {
    const value = transportData[field];
    if (value && (typeof value === 'string' ? value.trim() : value > 0)) {
      filledRequired++;
    }
  });
  
  // Проверяем дополнительные поля  
  optionalFields.forEach(field => {
    const value = transportData[field];
    if (value && (typeof value === 'string' ? value.trim() : value > 0)) {
      filledOptional++;
    }
  });
  
  // 75% за обязательные поля, 25% за дополнительные
  const requiredPercent = (filledRequired / requiredFields.length) * 75;
  const optionalPercent = (filledOptional / optionalFields.length) * 25;
  
  return Math.round(requiredPercent + optionalPercent);
};

// Расчет completion для компании
export const calculateCompanyCompletion = (companyData: any): number => {
  if (!companyData) return 0;
  
  const requiredFields = ['name', 'inn', 'address', 'bank_bik', 'bank_account', 'bank_name', 'bank_corr_account'];
  const optionalFields = ['kpp', 'description', 'phone', 'email', 'short_name'];
  
  let filledRequired = 0;
  let filledOptional = 0;
  
  // Проверяем обязательные поля
  requiredFields.forEach(field => {
    if (companyData[field] && companyData[field].toString().trim()) {
      filledRequired++;
    }
  });
  
  // Проверяем дополнительные поля
  optionalFields.forEach(field => {
    if (companyData[field] && companyData[field].toString().trim()) {
      filledOptional++;
    }
  });
  
  // 85% за обязательные поля, 15% за дополнительные
  const requiredPercent = (filledRequired / requiredFields.length) * 85;
  const optionalPercent = (filledOptional / optionalFields.length) * 15;
  
  return Math.round(requiredPercent + optionalPercent);
};