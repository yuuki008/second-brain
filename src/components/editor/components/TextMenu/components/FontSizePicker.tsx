import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'
import { ChevronDown } from 'lucide-react'

const FONT_SIZES = [
  { label: '極小', value: '12px' },
  { label: '小', value: '14px' },
  { label: '中', value: '' },
  { label: '大', value: '18px' },
  { label: '特大', value: '24px' },
]

export type FontSizePickerProps = {
  onChange: (value: string) => void
  value: string
}

export const FontSizePicker = ({ onChange, value }: FontSizePickerProps) => {
  const currentValue = FONT_SIZES.find((size) => size.value === value)
  const currentSizeLabel = currentValue?.label || '中'

  const selectSize = useCallback((size: string) => () => onChange(size), [onChange])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center p-2">
          {currentSizeLabel}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-40" side="bottom" align="start">
        {FONT_SIZES.map((size) => (
          <Button
            key={`${size.label}_${size.value}`}
            variant={value === size.value ? 'default' : 'ghost'}
            onClick={selectSize(size.value)}
            className="flex items-center"
          >
            <span style={{ fontSize: size.value }}>{size.label}</span>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
