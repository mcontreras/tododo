import { Router, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { upload, UPLOAD_DIR } from '../middleware/upload'

const router = Router()
router.use(authenticate)

router.post(
  '/tasks/:taskId/attachments',
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    try {
      const task = await prisma.task.findFirst({
        where: { id: req.params.taskId, userId: req.user!.userId },
      })
      if (!task) {
        fs.unlinkSync(req.file.path)
        res.status(404).json({ error: 'Task not found' })
        return
      }

      const attachment = await prisma.attachment.create({
        data: {
          taskId: task.id,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
        },
      })
      res.status(201).json(attachment)
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path)
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.get('/attachments/:id/download', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
      include: { task: { select: { userId: true } } },
    })

    if (!attachment || attachment.task.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Attachment not found' })
      return
    }

    const filePath = path.join(UPLOAD_DIR, attachment.filename)
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found on disk' })
      return
    }

    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`)
    res.setHeader('Content-Type', attachment.mimeType)
    res.sendFile(path.resolve(filePath))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/attachments/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
      include: { task: { select: { userId: true } } },
    })

    if (!attachment || attachment.task.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Attachment not found' })
      return
    }

    const filePath = path.join(UPLOAD_DIR, attachment.filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await prisma.attachment.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
