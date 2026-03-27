import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import authRoutes from './routes/auth'
import listRoutes from './routes/lists'
import categoryRoutes from './routes/categories'
import taskRoutes from './routes/tasks'
import columnRoutes from './routes/columns'
import attachmentRoutes from './routes/attachments'
import { UPLOAD_DIR } from './middleware/upload'

const app = express()
const PORT = parseInt(process.env.PORT || '4000', 10)

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || true, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/lists', listRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/columns', columnRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api', attachmentRoutes)

// Serve uploaded files (protected by download route)
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)))

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tododo backend running on port ${PORT}`)
})

export default app
