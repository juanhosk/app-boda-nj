export function isValidEmail(email: string): boolean {
  return typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}
