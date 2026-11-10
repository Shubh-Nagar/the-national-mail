'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading2, Heading3, List, ListOrdered, Quote, Link2, Unlink,
  ImagePlus, MonitorPlay as YoutubeIcon, AlignLeft, AlignCenter, AlignRight, Minus, Undo2, Redo2,
} from 'lucide-react';
import MediaPicker from './MediaPicker';
import { Modal } from './ui';

function Btn({ onClick, active, disabled, label, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`rounded p-1.5 transition-colors disabled:opacity-40 ${active ? 'bg-ink text-white' : 'text-ink-700 hover:bg-mist hover:text-ink-900'}`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />;

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing the story…' }) {
  const [picker, setPicker] = useState(false);
  const [dialog, setDialog] = useState(null); // { kind: 'link' | 'youtube', value }

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
      Youtube.configure({ nocookie: true, modestBranding: true, width: 640, height: 360 }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'tiptap article-body prose prose-mail max-w-none prose-headings:font-serif prose-headings:font-semibold',
        'aria-label': 'Article body',
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.isEmpty ? '' : ed.getHTML()),
  });

  if (!editor) {
    return <div className="min-h-[480px] rounded-lg border border-line bg-white" />;
  }

  const chain = () => editor.chain().focus();

  function applyDialog(e) {
    e.preventDefault();
    const v = dialog.value.trim();
    if (dialog.kind === 'link') {
      if (!v) chain().extendMarkRange('link').unsetLink().run();
      else chain().extendMarkRange('link').setLink({ href: v }).run();
    } else if (dialog.kind === 'youtube' && v) {
      editor.commands.setYoutubeVideo({ src: v });
    }
    setDialog(null);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white focus-within:border-ink/50">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-white/95 px-2 py-1.5 backdrop-blur" role="toolbar" aria-label="Formatting">
        <Btn label="Bold" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
        <Btn label="Italic" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
        <Btn label="Underline" active={editor.isActive('underline')} onClick={() => chain().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></Btn>
        <Btn label="Strikethrough" active={editor.isActive('strike')} onClick={() => chain().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Btn>
        <Sep />
        <Btn label="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
        <Btn label="Subheading" active={editor.isActive('heading', { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
        <Btn label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
        <Btn label="Numbered list" active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
        <Btn label="Pull quote" active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Btn>
        <Btn label="Divider" onClick={() => chain().setHorizontalRule().run()}><Minus className="h-4 w-4" /></Btn>
        <Sep />
        <Btn label="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => chain().setTextAlign('left').run()}><AlignLeft className="h-4 w-4" /></Btn>
        <Btn label="Align centre" active={editor.isActive({ textAlign: 'center' })} onClick={() => chain().setTextAlign('center').run()}><AlignCenter className="h-4 w-4" /></Btn>
        <Btn label="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => chain().setTextAlign('right').run()}><AlignRight className="h-4 w-4" /></Btn>
        <Sep />
        <Btn label="Add link" active={editor.isActive('link')} onClick={() => setDialog({ kind: 'link', value: editor.getAttributes('link').href || '' })}><Link2 className="h-4 w-4" /></Btn>
        <Btn label="Remove link" disabled={!editor.isActive('link')} onClick={() => chain().unsetLink().run()}><Unlink className="h-4 w-4" /></Btn>
        <Btn label="Insert image" onClick={() => setPicker(true)}><ImagePlus className="h-4 w-4" /></Btn>
        <Btn label="Embed YouTube video" onClick={() => setDialog({ kind: 'youtube', value: '' })}><YoutubeIcon className="h-4 w-4" /></Btn>
        <Sep />
        <Btn label="Undo" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}><Undo2 className="h-4 w-4" /></Btn>
        <Btn label="Redo" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}><Redo2 className="h-4 w-4" /></Btn>
      </div>

      <EditorContent editor={editor} />

      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        type="image"
        title="Insert an image into the story"
        onSelect={(m) => chain().setImage({ src: m.url, alt: m.alt || '' }).run()}
      />

      <Modal
        open={!!dialog}
        onClose={() => setDialog(null)}
        size="sm"
        title={dialog?.kind === 'youtube' ? 'Embed a YouTube video' : 'Add a link'}
      >
        {dialog && (
          <form onSubmit={applyDialog} className="space-y-4">
            <div>
              <label htmlFor="rte-url" className="label">{dialog.kind === 'youtube' ? 'YouTube link' : 'Link address'}</label>
              <input
                id="rte-url"
                type="url"
                className="field"
                autoFocus
                placeholder={dialog.kind === 'youtube' ? 'https://www.youtube.com/watch?v=…' : 'https://'}
                value={dialog.value}
                onChange={(e) => setDialog({ ...dialog, value: e.target.value })}
              />
              {dialog.kind === 'link' && <p className="hint">Leave empty and save to remove the link.</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setDialog(null)}>Cancel</button>
              <button type="submit" className="btn-ink">{dialog.kind === 'youtube' ? 'Embed video' : 'Save link'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
