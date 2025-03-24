import { JSX } from "react";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
};

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        `ContentEditable__root relative block h-full min-h-72 overflow-auto focus:outline-none`
      }
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            `pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis text-muted-foreground`
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
