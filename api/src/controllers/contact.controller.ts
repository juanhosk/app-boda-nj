import { Request, Response } from 'express'
import { ContactService } from '../services/contact.service'
import {
  ContactEmailDto,
  ContactPageDto,
  ContactPasswordDto,
} from '../dto/contact.dto'
import {
  isValidEmail,
  isValidPassword,
  isValidLocations,
  isValidTimeline,
} from '../lib/validators'

const contactService = new ContactService()

export class ContactController {
  async registerEmail(req: Request, res: Response) {
    try {
      const { email } = req.body as ContactEmailDto

      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email' })
      }

      const result = await contactService.registerEmail({ email })
      res.json(result)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  async registerPage(req: Request, res: Response) {
    try {
      const { token, title, celebrationDate, locations, timeline } =
        req.body as ContactPageDto

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid token' })
      }

      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid title' })
      }

      if (!celebrationDate || isNaN(Date.parse(celebrationDate))) {
        return res
          .status(400)
          .json({ error: 'Missing or invalid celebrationDate' })
      }

      if (!isValidLocations(locations)) {
        return res.status(400).json({ error: 'Invalid locations' })
      }

      if (!isValidTimeline(timeline)) {
        return res.status(400).json({ error: 'Invalid timeline' })
      }

      const result = await contactService.registerPage(
        req.body as ContactPageDto
      )
      res.json(result)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  async setPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body as ContactPasswordDto

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid token' })
      }

      if (!isValidPassword(password)) {
        return res
          .status(400)
          .json({ error: 'Password must be at least 8 characters' })
      }

      const result = await contactService.setPassword({ token, password })
      res.json(result)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
}
