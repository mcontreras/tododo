interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

const COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#F59E0B', '#10B981', '#14B8A6',
  '#06B6D4', '#6366F1', '#84CC16', '#6B7280',
]

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
          style={{
            backgroundColor: color,
            boxShadow: value === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
          }}
        />
      ))}
    </div>
  )
}
