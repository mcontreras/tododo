import { ReactNode } from 'react'
import { cn } from './cn'

interface BadgeProps {
  children: ReactNode
  color?: string
  className?: string
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn('badge', className)}
      style={
        color
          ? {
              backgroundColor: `${color}20`,
              color,
              border: `1px solid ${color}40`,
            }
          : undefined
      }
    >
      {children}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'
}

const priorityConfig = {
  NONE: { label: '', color: '' },
  LOW: { label: 'Low', color: '#3B82F6' },
  MEDIUM: { label: 'Medium', color: '#F59E0B' },
  HIGH: { label: 'High', color: '#EF4444' },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  if (!config.label) return null
  return <Badge color={config.color}>{config.label}</Badge>
}
