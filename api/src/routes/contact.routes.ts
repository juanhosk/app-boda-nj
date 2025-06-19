import { Router } from 'express'
import { ContactController } from '../controllers/contact.controller'

const router = Router()
const controller = new ContactController()

router.post('/email', controller.registerEmail.bind(controller))
router.post('/page', controller.registerPage.bind(controller))
router.post('/password', controller.setPassword.bind(controller))

export default router
