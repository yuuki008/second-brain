import { uploadFile } from "@/app/actions/supabase";
import { FileHandler } from "@tiptap-pro/extension-file-handler";
import { Editor } from "@tiptap/react";

function insertImage(editor: Editor, url: string, alt: string, pos: number) {
  editor
    .chain()
    .insertContentAt(pos, {
      type: "image",
      attrs: {
        src: url,
        alt: alt,
      },
    })
    .focus()
    .run();
}

const FileHandlerExtension = FileHandler.configure({
  allowedMimeTypes: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
  ],

  onDrop: async (editor: Editor, files: File[], pos: number) => {
    files.forEach(async (file) => {
      const { url } = await uploadFile(file);
      insertImage(editor, url, file.name, pos);
    });
  },

  onPaste: async (editor: Editor, files: File[], pasteContent?: string) => {
    files.forEach(async (file) => {
      if (pasteContent) {
        return false;
      }

      const { url } = await uploadFile(file);
      insertImage(editor, url, file.name, editor.state.selection.anchor);
    });
  },
});

export default FileHandlerExtension;
