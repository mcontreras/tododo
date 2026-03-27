import { useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { RecurrenceConfig, RecurrenceType } from '../../types'
import { useI18n } from '../../store/i18nStore'
import { cn } from '../ui/cn'

interface RecurrencePickerProps {
  value: RecurrenceConfig | null
  onChange: (value: RecurrenceConfig | null) => void
}

// ISO week days: 1=Mon … 7=Sun
const WEEK_DAYS = [
  { iso: 1, labelEn: 'M', labelEs: 'L' },
  { iso: 2, labelEn: 'T', labelEs: 'M' },
  { iso: 3, labelEn: 'W', labelEs: 'X' },
  { iso: 4, labelEn: 'T', labelEs: 'J' },
  { iso: 5, labelEn: 'F', labelEs: 'V' },
  { iso: 6, labelEn: 'S', labelEs: 'S' },
  { iso: 7, labelEn: 'S', labelEs: 'D' },
]

const PRESETS: { labelEn: string; labelEs: string; cfg: RecurrenceConfig }[] = [
  { labelEn: 'Daily',      labelEs: 'Cada día',      cfg: { type: 'daily',   interval: 1 } },
  { labelEn: 'Weekly',     labelEs: 'Semanal',       cfg: { type: 'weekly',  interval: 1 } },
  { labelEn: 'Biweekly',   labelEs: 'Quincenal',     cfg: { type: 'weekly',  interval: 2 } },
  { labelEn: 'Monthly',    labelEs: 'Mensual',        cfg: { type: 'monthly', interval: 1 } },
]

function configsEqual(a: RecurrenceConfig, b: RecurrenceConfig) {
  return a.type === b.type && a.interval === b.interval &&
    JSON.stringify(a.weekDays ?? []) === JSON.stringify(b.weekDays ?? [])
}

export function RecurrencePicker({ value, onChange }: RecurrencePickerProps) {
  const { locale } = useI18n()
  const [open, setOpen] = useState(!!value)

  function enable() {
    setOpen(true)
    onChange({ type: 'weekly', interval: 1 })
  }

  function disable() {
    setOpen(false)
    onChange(null)
  }

  function setType(type: RecurrenceType) {
    onChange({ type, interval: value?.interval ?? 1, weekDays: type === 'weekly' ? (value?.weekDays ?? []) : undefined })
  }

  function setInterval(n: number) {
    if (!value) return
    onChange({ ...value, interval: Math.max(1, n) })
  }

  function toggleDay(iso: number) {
    if (!value) return
    const days = value.weekDays ?? []
    const next = days.includes(iso) ? days.filter(d => d !== iso) : [...days, iso].sort((a, b) => a - b)
    onChange({ ...value, weekDays: next })
  }

  const label = (en: string, es: string) => locale === 'es' ? es : en

  const typeLabels: Record<RecurrenceType, { en: string; es: string; unit: { en: string; es: string } }> = {
    daily:   { en: 'Day',   es: 'Día',   unit: { en: 'day',   es: 'día'   } },
    weekly:  { en: 'Week',  es: 'Semana', unit: { en: 'week',  es: 'semana' } },
    monthly: { en: 'Month', es: 'Mes',   unit: { en: 'month', es: 'mes'   } },
  }

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={enable}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors border border-dashed border-gray-200 hover:border-blue-200 w-full justify-center"
        >
          <RefreshCw size={12} />
          {label('Add recurrence', 'Añadir repetición')}
        </button>
      ) : (
        <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-3 space-y-3 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
              <RefreshCw size={12} />
              {label('Repeats', 'Se repite')}
            </div>
            <button type="button" onClick={disable} className="p-0.5 text-gray-400 hover:text-gray-600 rounded">
              <X size={13} />
            </button>
          </div>

          {/* Presets */}
          <div className="flex gap-1.5 flex-wrap">
            {PRESETS.map((p) => {
              const isActive = value ? configsEqual(value, p.cfg) : false
              return (
                <button
                  key={p.labelEn}
                  type="button"
                  onClick={() => onChange(p.cfg)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                    isActive ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                  )}
                >
                  {label(p.labelEn, p.labelEs)}
                </button>
              )
            })}
          </div>

          {/* Custom interval */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{label('Every', 'Cada')}</span>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setInterval((value?.interval ?? 1) - 1)}
                className="px-2 py-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 text-sm font-medium"
              >−</button>
              <span className="px-2 text-sm font-semibold text-gray-800 min-w-[2ch] text-center">
                {value?.interval ?? 1}
              </span>
              <button
                type="button"
                onClick={() => setInterval((value?.interval ?? 1) + 1)}
                className="px-2 py-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 text-sm font-medium"
              >+</button>
            </div>

            {/* Type pills */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
              {(['daily', 'weekly', 'monthly'] as RecurrenceType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium transition-all',
                    value?.type === t ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                  )}
                >
                  {label(typeLabels[t].en, typeLabels[t].es)}
                </button>
              ))}
            </div>
          </div>

          {/* Day-of-week selector (only for weekly) */}
          {value?.type === 'weekly' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 mr-0.5">{label('On', 'El')}</span>
              {WEEK_DAYS.map(({ iso, labelEn, labelEs }) => {
                const active = value.weekDays?.includes(iso)
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => toggleDay(iso)}
                    className={cn(
                      'w-7 h-7 rounded-full text-xs font-semibold transition-all',
                      active ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300'
                    )}
                  >
                    {label(labelEn, labelEs)}
                  </button>
                )
              })}
            </div>
          )}

          {/* Summary */}
          {value && <RecurrenceSummary config={value} locale={locale} />}
        </div>
      )}
    </div>
  )
}

function RecurrenceSummary({ config, locale }: { config: RecurrenceConfig; locale: string }) {
  const es = locale === 'es'
  const dayNames = es
    ? ['', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']
    : ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  let text = ''
  if (config.type === 'daily') {
    text = config.interval === 1
      ? (es ? 'Cada día' : 'Every day')
      : (es ? `Cada ${config.interval} días` : `Every ${config.interval} days`)
  } else if (config.type === 'monthly') {
    text = config.interval === 1
      ? (es ? 'Cada mes' : 'Every month')
      : (es ? `Cada ${config.interval} meses` : `Every ${config.interval} months`)
  } else {
    const weeks = config.interval === 1
      ? (es ? 'Cada semana' : 'Every week')
      : (es ? `Cada ${config.interval} semanas` : `Every ${config.interval} weeks`)
    if (config.weekDays && config.weekDays.length > 0) {
      const days = config.weekDays.map(d => dayNames[d]).join(', ')
      text = `${weeks} · ${days}`
    } else {
      text = weeks
    }
  }

  return (
    <p className="text-xs text-blue-500 font-medium flex items-center gap-1">
      <RefreshCw size={10} /> {text}
    </p>
  )
}
