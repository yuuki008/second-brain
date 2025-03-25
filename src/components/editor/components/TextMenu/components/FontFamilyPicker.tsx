import { Button } from '@/components/ui/button'
import { useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const FONT_FAMILY_GROUPS = [
  {
    label: 'サンセリフ',
    options: [
      { label: 'Inter', value: '' },
      { label: 'Arial', value: 'Arial' },
      { label: 'Helvetica', value: 'Helvetica' },
    ],
  },
  {
    label: 'セリフ',
    options: [
      { label: 'Times New Roman', value: 'Times' },
      { label: 'Garamond', value: 'Garamond' },
      { label: 'Georgia', value: 'Georgia' },
    ],
  },
  {
    label: 'モノスペース',
    options: [
      { label: 'Courier', value: 'Courier' },
      { label: 'Courier New', value: 'Courier New' },
    ],
  },
]

const FONT_FAMILIES = FONT_FAMILY_GROUPS.flatMap((group) => group.options)

export type FontFamilyPickerProps = {
  onChange: (value: string) => void
  value: string
}

export const FontFamilyPicker = ({ onChange, value }: FontFamilyPickerProps) => {
  const currentValue = FONT_FAMILIES.find((font) => font.value === value)
  const currentFontLabel = currentValue?.label || 'Inter'

  const selectFont = useCallback((font: string) => () => onChange(font), [onChange])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center p-2">
          {currentFontLabel}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-40" side="bottom" align="start">
        {FONT_FAMILY_GROUPS.map((group) => (
          <div className="mt-2.5 first:mt-0 flex flex-col" key={group.label}>
            <div key={group.label} className="mt-2 mb-1 text-sm first:mt-0 text-gray-500 font-semibold">
              {group.label}
            </div>
            {group.options.map((font) => (
              <Button
                variant={value === font.value ? 'default' : 'ghost'}
                key={`${font.label}_${font.value}`}
                onClick={selectFont(font.value)}
                className={'w-full justify-start space-x-1 px-1'}
              >
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </Button>
            ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
