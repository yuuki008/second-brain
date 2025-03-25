import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ContentTypePickerOption = {
  label: string;
  id: string;
  type: "option";
  disabled: () => boolean;
  isActive: () => boolean;
  onClick: () => void;
  icon: keyof typeof icons;
};

export type ContentTypePickerCategory = {
  label: string;
  id: string;
  type: "category";
};

export type ContentPickerOptions = Array<
  ContentTypePickerOption | ContentTypePickerCategory
>;

export type ContentTypePickerProps = {
  options: ContentPickerOptions;
};

const isOption = (
  option: ContentTypePickerOption | ContentTypePickerCategory
): option is ContentTypePickerOption => option.type === "option";

const isCategory = (
  option: ContentTypePickerOption | ContentTypePickerCategory
): option is ContentTypePickerCategory => option.type === "category";

export const ContentTypePicker = ({ options }: ContentTypePickerProps) => {
  const activeItem = useMemo(
    () =>
      options.find((option) => option.type === "option" && option.isActive()),
    [options]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          aria-label={activeItem?.label || "コンテンツタイプ選択"}
          className="flex items-center p-2"
        >
          <Icon
            name={
              (activeItem?.type === "option" && activeItem.icon) || "Pilcrow"
            }
          />
          <Icon name="ChevronDown" className="w-2 h-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2" side="bottom" align="start">
        {options.map((option) => {
          if (isOption(option)) {
            return (
              <Button
                variant={option.isActive() ? "default" : "ghost"}
                key={option.id}
                onClick={option.onClick}
                disabled={option.disabled()}
                className={"w-full justify-start space-x-1 px-1"}
              >
                <Icon name={option.icon} className="w-4 h-4" />
                <span>{option.label}</span>
              </Button>
            );
          } else if (isCategory(option)) {
            return (
              <div
                key={option.id}
                className="mt-2 mb-1 text-sm first:mt-0 text-gray-500 font-semibold"
              >
                {option.label}
              </div>
            );
          }
        })}
      </PopoverContent>
    </Popover>
  );
};
