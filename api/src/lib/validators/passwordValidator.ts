export function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8
}
