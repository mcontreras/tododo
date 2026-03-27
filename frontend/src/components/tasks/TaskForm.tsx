import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi, CreateTaskData } from '../../api/tasks'
import { categoriesApi } from '../../api/categories'
import { listsApi } from '../../api/lists'
import { useUIStore } from '../../store/uiStore'
import { useI18n } from '../../store/i18nStore'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { RecurrencePicker } from './RecurrencePicker'
import { Category, RecurrenceConfig } from '../../types'
import { cn } from '../ui/cn'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  listId: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  dueDate: z.string().optional(),
  priority: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).default('NONE'),
  categoryIds: z.array(z.string()).default([]),
})

type FormData = z.infer<typeof schema>

interface TaskFormProps {
  open: boolean
  onClose: () => void
}

const PRIORITIES = [
  { value: 'NONE', label: 'None',   color: '#9CA3AF' },
  { value: 'LOW',  label: 'Low',    color: '#3B82F6' },
  { value: 'MEDIUM', label: 'Medium', color: '#F59E0B' },
  { value: 'HIGH', label: 'High',   color: '#EF4444' },
]

export function TaskForm({ open, onClose }: TaskFormProps) {
  const { selectedListId } = useUIStore()
  const { t } = useI18n()
  const qc = useQueryClient()
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | null>(null)

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll })
  const { data: lists = [] } = useQuery({ queryKey: ['lists'], queryFn: listsApi.getAll })

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'NONE', categoryIds: [], listId: selectedListId || '' },
  })

  const mutation = useMutation({
    mutationFn: (data: CreateTaskData) => tasksApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      reset()
      setRecurrence(null)
      onClose()
    },
  })

  function onSubmit(data: FormData) {
    mutation.mutate({
      ...data,
      listId: data.listId || undefined,
      url: data.url || undefined,
      dueDate: data.dueDate || undefined,
      recurrence: recurrence ?? undefined,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={t('new_task')} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <Input label={t('title')} placeholder={t('title_placeholder')} error={errors.title?.message} {...register('title')} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t('list')}</label>
            <select className="input" {...register('listId')}>
              <option value="">{t('no_list')}</option>
              {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('due_date')}</label>
            <input type="datetime-local" className="input" {...register('dueDate')} />
          </div>
        </div>

        <div>
          <label className="label">{t('priority')}</label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <div className="flex gap-2">
                {PRIORITIES.map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={cn(
                      'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border-2 transition-all',
                      field.value === value ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                    style={field.value === value ? { backgroundColor: color, borderColor: color } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* Recurrence */}
        <div>
          <label className="label">Repeat</label>
          <RecurrencePicker value={recurrence} onChange={setRecurrence} />
        </div>

        {categories.length > 0 && (
          <div>
            <label className="label">{t('categories')}</label>
            <Controller
              control={control}
              name="categoryIds"
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat: Category) => {
                    const selected = field.value.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            selected ? field.value.filter((id) => id !== cat.id) : [...field.value, cat.id]
                          )
                        }
                        className="badge cursor-pointer transition-all"
                        style={
                          selected
                            ? { backgroundColor: cat.color, color: 'white', border: `1px solid ${cat.color}` }
                            : { backgroundColor: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }
                        }
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>
        )}

        <div>
          <label className="label">{t('url')}</label>
          <Input placeholder={t('url_placeholder')} error={errors.url?.message} {...register('url')} />
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} className="flex-1" type="button">{t('cancel')}</Button>
          <Button variant="primary" type="submit" loading={mutation.isPending} className="flex-1">
            {t('create_task')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
