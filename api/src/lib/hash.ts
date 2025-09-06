import bcrypt from 'bcryptjs'

const PEPPER = process.env.PASSWORD_PEPPER || ''
const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS) || 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password + PEPPER, SALT_ROUNDS)
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password + PEPPER, hash)
}
