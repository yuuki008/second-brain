import { Button } from "@/components/ui/button";
import { FontSizePicker } from "./components/FontSizePicker";
import { useTextmenuCommands } from "./hooks/useTextmenuCommands";
import { useTextmenuStates } from "./hooks/useTextmenuStates";
import { useTextmenuContentTypes } from "./hooks/useTextmenuContentTypes";
import { ContentTypePicker } from "./components/ContentTypePicker";
import { EditLinkPopover } from "./components/EditLinkPopover";
import { Icon } from "@/components/ui/icon";
import { OtherOptionPicker } from "./components/OtherOptionPicker";
import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react";
import { memo } from "react";
import { FontFamilyPicker } from "./components/FontFamilyPicker";

const MemoButton = memo(Button);
const MemoFontFamilyPicker = memo(FontFamilyPicker);
const MemoFontSizePicker = memo(FontSizePicker);
const MemoContentTypePicker = memo(ContentTypePicker);

export type TextMenuProps = {
  editor: Editor;
};

export const TextMenu = ({ editor }: TextMenuProps) => {
  const commands = useTextmenuCommands(editor);
  const states = useTextmenuStates(editor);
  const blockOptions = useTextmenuContentTypes(editor);

  return (
    <BubbleMenu
      tippyOptions={{
        popperOptions: {
          placement: "top-start",
          modifiers: [
            {
              name: "preventOverflow",
              options: {
                boundary: "viewport",
                padding: 8,
              },
            },
            {
              name: "flip",
              options: {
                fallbackPlacements: ["bottom-start", "top-end", "bottom-end"],
              },
            },
          ],
        },
        maxWidth: "calc(100vw - 16px)",
      }}
      editor={editor}
      pluginKey="textMenu"
      shouldShow={states.shouldShow}
      updateDelay={100}
    >
      <div className="flex bg-background items-center space-x-1 p-2 border rounded-lg">
        <MemoContentTypePicker options={blockOptions} />
        <MemoFontFamilyPicker
          onChange={commands.onSetFont}
          value={states.currentFont || ""}
        />
        <MemoFontSizePicker
          onChange={commands.onSetFontSize}
          value={states.currentSize || ""}
        />
        {/* セパレーター */}
        <div className="w-[1px] h-6 bg-gray-300" />
        <MemoButton
          variant={states.isBold ? "default" : "ghost"}
          onClick={commands.onBold}
          aria-label="太字"
          className="p-2"
        >
          <Icon name="Bold" />
        </MemoButton>
        <MemoButton
          variant={states.isItalic ? "default" : "ghost"}
          onClick={commands.onItalic}
          aria-label="斜体"
          className="p-2"
        >
          <Icon name="Italic" />
        </MemoButton>
        <MemoButton
          variant={states.isUnderline ? "default" : "ghost"}
          onClick={commands.onUnderline}
          aria-label="下線"
          className="p-2"
        >
          <Icon name="Underline" />
        </MemoButton>
        <MemoButton
          variant={states.isStrike ? "default" : "ghost"}
          onClick={commands.onStrike}
          aria-label="取り消し線"
          className="p-2"
        >
          <Icon name="Strikethrough" />
        </MemoButton>
        <MemoButton
          variant={states.isCode ? "default" : "ghost"}
          onClick={commands.onCode}
          aria-label="コード"
          className="p-2"
        >
          <Icon name="Code" />
        </MemoButton>
        <MemoButton
          variant="ghost"
          onClick={commands.onCodeBlock}
          aria-label="コードブロック"
          className="p-2"
        >
          <Icon name="FileCode" />
        </MemoButton>

        <EditLinkPopover editor={editor} />
        <OtherOptionPicker editor={editor} />
      </div>
    </BubbleMenu>
  );
};
