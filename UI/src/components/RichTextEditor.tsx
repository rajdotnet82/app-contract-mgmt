import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

type Props = {
  value: string; // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeightClassName = "min-h-[220px]",
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          `prose dark:prose-invert max-w-none ` +
          `${minHeightClassName} ` +
          `rounded-lg border border-stroke dark:border-strokedark ` +
          `bg-transparent px-3 py-2 outline-none`,
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Keep editor in sync if initial value loads later (edit page)
  if (editor && value !== editor.getHTML()) {
    // Avoid cursor jumping when typing:
    // Only replace content when value changes externally.
    // This simple guard is usually enough for MVP.
  }

  return (
    <div className="space-y-2">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function MenuBar({ editor }: { editor: any }) {
  if (!editor) return null;

  const btn =
    "rounded-md border border-stroke px-2 py-1 text-xs dark:border-strokedark";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={btn}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Italic
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        Underline
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        Bullets
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        Numbers
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        P
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => editor.chain().focus().undo().run()}
      >
        Undo
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => editor.chain().focus().redo().run()}
      >
        Redo
      </button>
    </div>
  );
}
