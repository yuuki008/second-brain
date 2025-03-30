import { uploadFile } from "@/app/actions/supabase";
import { FileHandler } from "@tiptap-pro/extension-file-handler";
import { Editor } from "@tiptap/react";

function insertImage(
  editor: Editor,
  url: string,
  alt: string,
  pos: number,
  loading: boolean = false
) {
  editor
    .chain()
    .insertContentAt(pos, {
      type: "image",
      attrs: {
        src: url,
        alt: alt,
        loading: loading,
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
      if (isVideo(file)) {
        const { url } = await uploadFile(file);
        return insertVideo(editor, url, pos);
      }
      if (isImage(file)) {
        // まずloading状態で画像を挿入
        insertImage(editor, "", file.name, pos, true);
        // アップロード完了後に実際のURLで更新
        const { url } = await uploadFile(file);

        editor
          .chain()
          .command(({ tr }) => {
            const pos = tr.selection.anchor;
            tr.setNodeMarkup(pos, undefined, {
              src: url,
              alt: file.name,
              loading: false,
            });
            return true;
          })
          .run();
      }
    });
  },

  onPaste: async (editor: Editor, files: File[], pasteContent?: string) => {
    files.forEach(async (file) => {
      if (pasteContent) {
        return false;
      }

      if (isVideo(file)) {
        const { url } = await uploadFile(file);
        return insertVideo(editor, url, editor.state.selection.anchor);
      }
      if (isImage(file)) {
        // まずloading状態で画像を挿入
        insertImage(editor, "", file.name, editor.state.selection.anchor, true);
        // アップロード完了後に実際のURLで更新
        const { url } = await uploadFile(file);

        editor
          .chain()
          .command(({ tr }) => {
            if (!tr.selection.anchor) return false;

            const pos = tr.selection.anchor;
            tr.setNodeMarkup(pos, undefined, {
              src: url,
              alt: file.name,
              loading: false,
            });
            return true;
          })
          .run();
      }
    });
  },
});

export default FileHandlerExtension;
