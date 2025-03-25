import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Editor } from '@tiptap/react'
import { memo } from 'react'
import { useTextmenuCommands } from '../hooks/useTextmenuCommands'
import { useTextmenuStates } from '../hooks/useTextmenuStates'
import { Icon } from '@/components/ui/icon'

const MemoButton = memo(Button)

export const OtherOptionPicker = ({ editor }: { editor: Editor }) => {
  const commands = useTextmenuCommands(editor)
  const states = useTextmenuStates(editor)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <MemoButton variant="ghost" aria-label="その他のオプション" className="p-2">
          <Icon name="EllipsisVertical" />
        </MemoButton>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="flex flex-col space-y-1 p-2 bg-white shadow rounded"
      >
        <MemoButton
          variant={states.isSubscript ? 'default' : 'ghost'}
          onClick={commands.onSubscript}
          aria-label="下付き文字"
          className="w-full justify-start"
        >
          <Icon name="Subscript" /> 下付き文字
        </MemoButton>
        <MemoButton
          variant={states.isSuperscript ? 'default' : 'ghost'}
          onClick={commands.onSuperscript}
          aria-label="上付き文字"
          className="w-full justify-start"
        >
          <Icon name="Superscript" /> 上付き文字
        </MemoButton>
        {/* セパレーター */}
        <div className="w-full h-px bg-gray-300 my-1" />
        <MemoButton
          variant={states.isAlignLeft ? 'default' : 'ghost'}
          onClick={commands.onAlignLeft}
          aria-label="左揃え"
          className="w-full justify-start"
        >
          <Icon name="AlignLeft" /> 左揃え
        </MemoButton>
        <MemoButton
          variant={states.isAlignCenter ? 'default' : 'ghost'}
          onClick={commands.onAlignCenter}
          aria-label="中央揃え"
          className="w-full justify-start"
        >
          <Icon name="AlignCenter" /> 中央揃え
        </MemoButton>
        <MemoButton
          variant={states.isAlignRight ? 'default' : 'ghost'}
          onClick={commands.onAlignRight}
          aria-label="右揃え"
          className="w-full justify-start"
        >
          <Icon name="AlignRight" /> 右揃え
        </MemoButton>
        <MemoButton
          variant={states.isAlignJustify ? 'default' : 'ghost'}
          onClick={commands.onAlignJustify}
          aria-label="両端揃え"
          className="w-full justify-start"
        >
          <Icon name="AlignJustify" /> 両端揃え
        </MemoButton>
      </PopoverContent>
    </Popover>
  )
}
