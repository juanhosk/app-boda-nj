import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes/router'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

app.use('/api', router)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something broke!' })
  }
)

app.listen(port, () => {
  console.log(`🚀 HTTP Server running on http://localhost:${port}`)
  console.log(`📊 Health check: http://localhost:${port}/health`)
})
