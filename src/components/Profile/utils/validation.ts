export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const re = /^[\d\s\-\+\(\)]+$/
  return re.test(phone) && phone.length >= 10
}

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2
}