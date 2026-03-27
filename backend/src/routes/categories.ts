import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user!.userId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { tasks: true } } },
    })
    res.json(categories)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 50 }),
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
      const category = await prisma.category.create({
        data: { userId: req.user!.userId, name, color: color || '#6B7280' },
      })
      res.status(201).json(category)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.patch(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 1, max: 50 }),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }
    const id = String(req.params.id)
    try {
      const cat = await prisma.category.findFirst({ where: { id, userId: req.user!.userId } })
      if (!cat) { res.status(404).json({ error: 'Category not found' }); return }
      const updated = await prisma.category.update({ where: { id }, data: req.body })
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
    const cat = await prisma.category.findFirst({ where: { id, userId: req.user!.userId } })
    if (!cat) { res.status(404).json({ error: 'Category not found' }); return }
    await prisma.category.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
