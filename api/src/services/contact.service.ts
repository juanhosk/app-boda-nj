import { prisma } from '../prisma/client'
import jwt from 'jsonwebtoken'
import {
  ContactEmailDto,
  ContactPageDto,
  ContactPasswordDto,
} from '../dto/contact.dto'
import { hashPassword } from '../lib/hash'

const CONTACT_SECRET = process.env.CONTACT_SECRET || 'contact-secret'

export class ContactService {
  // Step 1: Register email and return a temporary token
  async registerEmail({ email }: ContactEmailDto) {
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({
        data: { email, status: 'PENDING', password: '' },
      })
    }

    if (user.status !== 'PENDING') {
      throw new Error('User already registered')
    }

    const token = jwt.sign({ userId: user.id }, CONTACT_SECRET, {
      expiresIn: '1w',
    })
    return { token }
  }

  // Step 2: Register page, locations, and timeline for the user
  async registerPage({
    token,
    title,
    description,
    celebrationDate,
    locations,
    timeline,
  }: ContactPageDto) {
    const payload = jwt.verify(token, CONTACT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user || user.status !== 'PENDING') {
      throw new Error('Invalid or expired token')
    }

    const page = await prisma.page.create({
      data: {
        title,
        description,
        celebrationDate: new Date(celebrationDate),
        userId: user.id,
        locations: {
          create: locations,
        },
        timeline: {
          create: timeline,
        },
      },
      include: { locations: true, timeline: true },
    })
    return page
  }

  // Step 3: Set password and activate user, return login token
  async setPassword({ token, password }: ContactPasswordDto) {
    const payload = jwt.verify(token, CONTACT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user || user.status !== 'PENDING') {
      throw new Error('Invalid or expired token')
    }

    const hash = await hashPassword(password)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, status: 'ACTIVE' },
    })

    // Issue a new login token (JWT)
    const loginToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'jwt-secret',
      { expiresIn: '24h' }
    )
    return { token: loginToken }
  }
}
