export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidPassword(value) {
  return typeof value === 'string' && value.length >= 8
}

export function isValidUsername(value) {
  return /^[a-zA-Z0-9_.]{3,20}$/.test(value)
}
