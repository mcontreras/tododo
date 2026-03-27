import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lists = await prisma.list.findMany({
      where: { userId: req.user!.userId },
      orderBy: { position: 'asc' },
      include: { _count: { select: { tasks: { where: { completed: false } } } } },
    })
    res.json(lists)
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
    body('icon').optional().isString(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }
    const { name, color, icon } = req.body
    try {
      const maxPos = await prisma.list.aggregate({
        where: { userId: req.user!.userId },
        _max: { position: true },
      })
      const position = (maxPos._max.position ?? -1) + 1
      const list = await prisma.list.create({
        data: { userId: req.user!.userId, name, color: color || '#3B82F6', icon: icon || 'list', position },
      })
      res.status(201).json(list)
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
    body('icon').optional().isString(),
    body('position').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }
    const id = String(req.params.id)
    try {
      const list = await prisma.list.findFirst({ where: { id, userId: req.user!.userId } })
      if (!list) { res.status(404).json({ error: 'List not found' }); return }
      const updated = await prisma.list.update({ where: { id }, data: req.body })
      res.json(updated)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  try {
    const list = await prisma.list.findFirst({ where: { id, userId: req.user!.userId } })
    if (!list) { res.status(404).json({ error: 'List not found' }); return }
    await prisma.list.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
