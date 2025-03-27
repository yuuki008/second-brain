import Image from "next/image";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";

interface EmojiItem {
  name: string;
  emoji: string;
  fallbackImage?: string;
}

interface EmojiListProps {
  items: EmojiItem[];
  command: (item: { name: string }) => void;
}

interface EmojiListRef {
  onKeyDown: (event: { event: KeyboardEvent }) => boolean;
}

export const EmojiList = forwardRef<EmojiListRef, EmojiListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command({ name: item.name });
        }
      },
      [items, command]
    );

    const upHandler = useCallback(() => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
    }, [items.length, selectedIndex]);

    const downHandler = useCallback(() => {
      setSelectedIndex((selectedIndex + 1) % items.length);
    }, [items.length, selectedIndex]);

    const enterHandler = useCallback(() => {
      selectItem(selectedIndex);
    }, [selectedIndex, selectItem]);

    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(
      ref,
      () => {
        return {
          onKeyDown: (x: { event: KeyboardEvent }) => {
            if (x.event.key === "ArrowUp") {
              upHandler();
              return true;
            }

            if (x.event.key === "ArrowDown") {
              downHandler();
              return true;
            }

            if (x.event.key === "Enter") {
              enterHandler();
              return true;
            }

            return false;
          },
        };
      },
      [upHandler, downHandler, enterHandler]
    );

    return (
      <div className="dropdown-menu">
        {items.map((item, index) => (
          <button
            className={index === selectedIndex ? "is-selected" : ""}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.fallbackImage ? (
              <Image
                src={item.fallbackImage}
                alt={item.name}
                width={20}
                height={20}
                className="align-middle"
              />
            ) : (
              item.emoji
            )}
            :{item.name}:
          </button>
        ))}
      </div>
    );
  }
);

EmojiList.displayName = "EmojiList";
