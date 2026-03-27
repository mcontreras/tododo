import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const columns = await prisma.kanbanColumn.findMany({
      where: { userId: req.user!.userId },
      orderBy: { position: 'asc' },
      include: { _count: { select: { tasks: { where: { completed: false } } } } },
    })
    res.json(columns)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }
    const { name, color } = req.body
    try {
      const maxPos = await prisma.kanbanColumn.aggregate({
        where: { userId: req.user!.userId },
        _max: { position: true },
      })
      const position = (maxPos._max.position ?? -1) + 1
      const column = await prisma.kanbanColumn.create({
        data: { userId: req.user!.userId, name, color: color || '#6B7280', position },
      })
      res.status(201).json(column)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.patch(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
    body('position').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }
    try {
      const col = await prisma.kanbanColumn.findFirst({
        where: { id: req.params.id, userId: req.user!.userId },
      })
      if (!col) { res.status(404).json({ error: 'Column not found' }); return }
      const updated = await prisma.kanbanColumn.update({ where: { id: req.params.id }, data: req.body })
      res.json(updated)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const col = await prisma.kanbanColumn.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    })
    if (!col) { res.status(404).json({ error: 'Column not found' }); return }

    // Move tasks in this column to null
    await prisma.task.updateMany({ where: { columnId: req.params.id }, data: { columnId: null } })
    await prisma.kanbanColumn.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
