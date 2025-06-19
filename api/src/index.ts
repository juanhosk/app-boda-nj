import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes/router'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(router)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something broke!' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
}) 