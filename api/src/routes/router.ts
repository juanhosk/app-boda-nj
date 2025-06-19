import { Router } from 'express'
import contactRoutes from './contact.routes'

const router = Router()

// Contact routes
router.use('/contact', contactRoutes)

// Public api

export default router
