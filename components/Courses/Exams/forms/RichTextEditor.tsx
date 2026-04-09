"use client";

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExt from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
} from "lucide-react";

/** รูปภาพขนาดสูงสุดที่รับได้ (ฝัง base64) */
const MAX_IMG_BYTES = 500 * 1024; // 500 KB

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // ป้องกัน editor เสีย focus
        onClick();
      }}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
        active
          ? "bg-[#4CA771]/20 text-[#14532D]"
          : "text-[#14532D]/50 hover:bg-black/5 hover:text-[#14532D]"
      }`}
    >
      {children}
    </button>
  );
}

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "พิมพ์คำถาม...",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      Placeholder.configure({ placeholder }),
      ImageExt.configure({ allowBase64: true, inline: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        // class นี้จะถูกใส่ตรงที่ .ProseMirror → ใช้ใน CSS selector .rte-prose
        class:
          "rte-prose outline-none min-h-[100px] px-4 py-3 text-sm text-[#14532D]/90",
      },
    },
    immediatelyRender: false,
  });

  function insertImageFromFile(file: File) {
    if (!editor) return;
    if (file.size > MAX_IMG_BYTES) {
      alert(
        `รูปภาพขนาดใหญ่เกินไป (${(file.size / 1024).toFixed(0)} KB)\n` +
          `กรุณาใช้รูปที่มีขนาดไม่เกิน 500 KB`,
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string | undefined;
      if (src) editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  }

  // แสดง skeleton ขณะ editor ยังโหลดอยู่ (ป้องกัน layout shift)
  if (!editor) {
    return (
      <div className="min-h-[130px] animate-pulse rounded-2xl border border-black/10 bg-[#F6FDF7]" />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 transition-[border-color,box-shadow] focus-within:border-[#4CA771] focus-within:ring-2 focus-within:ring-[#4CA771]/25">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-black/10 bg-[#F6FDF7] px-2 py-1.5">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="ตัวหนา"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="ตัวเอียง"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="ขีดเส้นใต้"
        >
          <Underline className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="mx-1.5 h-4 w-px bg-black/10" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="รายการ"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="รายการลำดับ"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="mx-1.5 h-4 w-px bg-black/10" />

        {/* ── Image upload ── */}
        <ToolbarBtn
          onClick={() => fileRef.current?.click()}
          title="แทรกรูปภาพ (≤ 500 KB)"
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) insertImageFromFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} />
    </div>
  );
}
