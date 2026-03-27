import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('password').isLength({ min: 8 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { email, name, password } = req.body

    try {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        res.status(409).json({ error: 'Email already in use' })
        return
      }

      const passwordHash = await bcrypt.hash(password, 12)
      const user = await prisma.user.create({
        data: { email, name, passwordHash },
        select: { id: true, email: true, name: true, avatar: true, createdAt: true },
      })

      // Create default list and kanban columns
      await prisma.list.create({
        data: { userId: user.id, name: 'My Tasks', color: '#3B82F6', icon: 'inbox', position: 0 },
      })
      await prisma.kanbanColumn.createMany({
        data: [
          { userId: user.id, name: 'To Do', color: '#6B7280', position: 0 },
          { userId: user.id, name: 'In Progress', color: '#F59E0B', position: 1 },
          { userId: user.id, name: 'Done', color: '#10B981', position: 2 },
        ],
      })

      const token = signToken({ userId: user.id, email: user.email })
      res.status(201).json({ token, user })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { email, password } = req.body

    try {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }

      const token = signToken({ userId: user.id, email: user.email })
      const { passwordHash: _, ...safeUser } = user
      res.json({ token, user: safeUser })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.patch(
  '/me',
  authenticate,
  [body('name').optional().trim().isLength({ min: 2, max: 100 })],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { name, currentPassword, newPassword } = req.body

    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
      if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
      }

      const updateData: { name?: string; passwordHash?: string } = {}
      if (name) updateData.name = name

      if (currentPassword && newPassword) {
        const valid = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!valid) {
          res.status(400).json({ error: 'Current password is incorrect' })
          return
        }
        updateData.passwordHash = await bcrypt.hash(newPassword, 12)
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: { id: true, email: true, name: true, avatar: true, createdAt: true },
      })

      res.json(updated)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.delete(
  '/me',
  authenticate,
  [body('password').notEmpty()],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { password } = req.body
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
      if (!user) { res.status(404).json({ error: 'User not found' }); return }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) { res.status(400).json({ error: 'Incorrect password' }); return }

      // Cascade deletes everything via onDelete: Cascade in schema
      await prisma.user.delete({ where: { id: user.id } })
      res.status(204).send()
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

export default router
