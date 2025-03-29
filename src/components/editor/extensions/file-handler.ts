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

function insertVideo(editor: Editor, url: string, pos: number) {
  editor
    .chain()
    .insertContentAt(pos, {
      type: "video",
      attrs: {
        src: url,
        controls: true,
      },
    })
    .focus()
    .run();
}

const isImage = (file: File) => file.type.startsWith("image/");
const isVideo = (file: File) => file.type.startsWith("video/");

const FileHandlerExtension = FileHandler.configure({
  allowedMimeTypes: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/mov",
    "video/avi",
    "video/wmv",
    "video/flv",
    "video/mpeg",
  ],

  onDrop: async (editor: Editor, files: File[], pos: number) => {
    files.forEach(async (file) => {
      const { url } = await uploadFile(file);

      if (isVideo(file)) return insertVideo(editor, url, pos);
      if (isImage(file)) return insertImage(editor, url, file.name, pos);
    });
  },

  onPaste: async (editor: Editor, files: File[], pasteContent?: string) => {
    files.forEach(async (file) => {
      if (pasteContent) {
        return false;
      }

      const { url } = await uploadFile(file);

      if (isVideo(file))
        return insertVideo(editor, url, editor.state.selection.anchor);
      if (isImage(file))
        return insertImage(
          editor,
          url,
          file.name,
          editor.state.selection.anchor
        );
    });
  },
});

export default FileHandlerExtension;
