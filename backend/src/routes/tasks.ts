import { Router, Response } from 'express'
import { body, query, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { Priority, Prisma } from '@prisma/client'
import { nextOccurrence, RecurrenceConfig } from '../lib/recurrence'

const router = Router()
router.use(authenticate)

const taskInclude = {
  categories: { include: { category: true } },
  attachments: true,
  list: { select: { id: true, name: true, color: true } },
  column: { select: { id: true, name: true, color: true } },
}

router.get(
  '/',
  [
    query('listId').optional().isString(),
    query('columnId').optional().isString(),
    query('completed').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }

    const { listId, columnId, completed } = req.query
    try {
      const where: Prisma.TaskWhereInput = { userId: req.user!.userId }
      if (listId) where.listId = String(listId)
      if (columnId) where.columnId = String(columnId)
      if (completed !== undefined) where.completed = completed === 'true'

      const tasks = await prisma.task.findMany({
        where,
        orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        include: taskInclude,
      })
      res.json(tasks)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
      include: taskInclude,
    })
    if (!task) { res.status(404).json({ error: 'Task not found' }); return }
    res.json(task)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1, max: 500 }),
    body('listId').optional().isString(),
    body('columnId').optional().isString(),
    body('description').optional().isString(),
    body('url').optional().isURL(),
    body('dueDate').optional().isISO8601(),
    body('priority').optional().isIn(Object.values(Priority)),
    body('categoryIds').optional().isArray(),
    body('recurrence').optional(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }

    const { title, listId, columnId, description, url, dueDate, priority, categoryIds, recurrence } = req.body
    try {
      // If no columnId, assign to first column
      let resolvedColumnId = columnId || null
      if (!resolvedColumnId) {
        const firstCol = await prisma.kanbanColumn.findFirst({
          where: { userId: req.user!.userId },
          orderBy: { position: 'asc' },
        })
        resolvedColumnId = firstCol?.id || null
      }

      const maxPos = await prisma.task.aggregate({
        where: { userId: req.user!.userId, listId: listId || null },
        _max: { position: true },
      })
      const position = (maxPos._max.position ?? -1) + 1

      const task = await prisma.task.create({
        data: {
          userId: req.user!.userId,
          listId: listId || null,
          columnId: resolvedColumnId,
          title,
          description,
          url,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority: priority || 'NONE',
          recurrence: recurrence ?? Prisma.JsonNull,
          position,
          categories: categoryIds?.length
            ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
            : undefined,
        },
        include: taskInclude,
      })
      res.status(201).json(task)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.patch(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 1, max: 500 }),
    body('description').optional(),
    body('url').optional({ nullable: true }),
    body('dueDate').optional({ nullable: true }).isISO8601(),
    body('priority').optional().isIn(Object.values(Priority)),
    body('completed').optional().isBoolean(),
    body('listId').optional({ nullable: true }).isString(),
    body('columnId').optional({ nullable: true }).isString(),
    body('position').optional().isInt({ min: 0 }),
    body('categoryIds').optional().isArray(),
    body('recurrence').optional(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }

    const id = String(req.params.id)
    try {
      const task = await prisma.task.findFirst({
        where: { id, userId: req.user!.userId },
      })
      if (!task) { res.status(404).json({ error: 'Task not found' }); return }

      const { categoryIds, completed, dueDate, ...rest } = req.body
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = { ...rest }

      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null

      if (completed !== undefined) {
        updateData.completed = completed
        updateData.completedAt = completed ? new Date() : null
        // Auto-move to Done/first column on complete
        if (completed && !rest.columnId) {
          const doneCol = await prisma.kanbanColumn.findFirst({
            where: { userId: req.user!.userId },
            orderBy: { position: 'desc' },
          })
          if (doneCol) updateData.columnId = doneCol.id
        }
      }

      if (categoryIds !== undefined) {
        await prisma.taskCategory.deleteMany({ where: { taskId: task.id } })
        if (categoryIds.length > 0) {
          await prisma.taskCategory.createMany({
            data: categoryIds.map((id: string) => ({ taskId: task.id, categoryId: id })),
          })
        }
        delete updateData.categoryIds
      }

      const updated = await prisma.task.update({
        where: { id },
        data: updateData as Prisma.TaskUpdateInput,
        include: taskInclude,
      })

      // If a recurring task was just completed, spawn the next occurrence
      let nextTask = null
      if (completed === true && task.recurrence && task.dueDate) {
        const config = task.recurrence as unknown as RecurrenceConfig
        const nextDue = nextOccurrence(task.dueDate, config)

        // Determine first column for the new task
        const firstCol = await prisma.kanbanColumn.findFirst({
          where: { userId: req.user!.userId },
          orderBy: { position: 'asc' },
        })

        // Copy categories
        const existingCats = await prisma.taskCategory.findMany({ where: { taskId: task.id } })

        nextTask = await prisma.task.create({
          data: {
            userId: task.userId,
            listId: task.listId,
            columnId: firstCol?.id ?? null,
            title: task.title,
            description: task.description,
            url: task.url,
            priority: task.priority,
            recurrence: task.recurrence as Prisma.InputJsonValue,
            dueDate: nextDue,
            position: 0,
            categories: existingCats.length
              ? { create: existingCats.map((tc) => ({ categoryId: tc.categoryId })) }
              : undefined,
          },
          include: taskInclude,
        })
      }

      res.json({ task: updated, nextTask })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  try {
    const task = await prisma.task.findFirst({ where: { id, userId: req.user!.userId } })
    if (!task) { res.status(404).json({ error: 'Task not found' }); return }
    await prisma.task.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/reorder', async (req: AuthRequest, res: Response): Promise<void> => {
  const { ids } = req.body
  if (!Array.isArray(ids)) { res.status(400).json({ error: 'ids must be an array' }); return }
  try {
    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.task.updateMany({ where: { id, userId: req.user!.userId }, data: { position: index } })
      )
    )
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
