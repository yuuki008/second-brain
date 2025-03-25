import { useState, useCallback, useEffect, useMemo } from 'react'
import { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { Trash2 } from 'lucide-react'

import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Toggle } from '@/components/ui/toggle'

export type EditLinkPopoverProps = {
  editor: Editor
}

export const EditLinkPopover = ({ editor }: EditLinkPopoverProps) => {
  const { link, target } = useEditorState({
    editor,
    selector: (ctx) => {
      const attrs = ctx.editor.getAttributes('link')
      return { link: attrs.href, target: attrs.target }
    },
  })

  const [url, setUrl] = useState(link || '')
  const [openInNewTab, setOpenInNewTab] = useState(target === '_blank')

  const isValidUrl = useMemo(() => /^(\S+):(\/\/)?\S+$/.test(url), [url])
  const hasLink = Boolean(link)

  const onSetLink = useCallback(
    (url: string, openInNewTab?: boolean) => {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url, target: openInNewTab ? '_blank' : '' })
        .run()
    },
    [editor],
  )

  const onUnsetLink = useCallback(() => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
  }, [editor])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (isValidUrl) {
        onSetLink(url, openInNewTab)
      }
    },
    [url, isValidUrl, openInNewTab, onSetLink],
  )

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }, [])

  useEffect(() => {
    setUrl(link || '')
    setOpenInNewTab(target === '_blank')
  }, [link, target])

  return (
    <TooltipProvider>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant={hasLink ? 'default' : 'ghost'} aria-label="Set Link">
                <Icon name="Link" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>リンクを追加</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-[22rem]" side="bottom" align="start">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-1 items-center gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 cursor-text">
              <Icon name="Link" className="flex-none text-black dark:text-white" />
              <input
                type="url"
                className="flex-1 bg-transparent outline-none text-black text-sm dark:text-white"
                placeholder="https://example.com"
                value={url}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                  新しいタブで開く
                  <Toggle active={openInNewTab} onChange={setOpenInNewTab} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button type="submit" disabled={!isValidUrl}>
                  適用
                </Button>
                {hasLink && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onUnsetLink}
                    aria-label="URLをクリア"
                    className="p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}
