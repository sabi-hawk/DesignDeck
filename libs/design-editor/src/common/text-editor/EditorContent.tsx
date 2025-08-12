import { useEventCallback } from '@lidojs/design-core';
import { createEditor, selectText, TextEditor } from '@lidojs/text-editor';
import React, { FC, useEffect, useRef } from 'react';
import { useEditor } from '../../hooks';

interface EditorContentProps {
  editor: TextEditor;
}

const EditorContent: FC<EditorContentProps> = ({ editor }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { actions } = useEditor();
  const initEditor = useEventCallback(() => {
    actions.history.new();
    const editingEditor = createEditor({
      content: editor.dom.innerHTML,
      ele: ref.current,
      handleDOMEvents: {
        blur: () => {
          actions.closeTextEditor();
        },
      },
    });
    selectText({
      from: editingEditor.state.doc.content.size,
      to: editingEditor.state.doc.content.size,
    })(editingEditor.state, editingEditor.dispatch);
    editingEditor.focus();
    actions.setOpeningEditor(editingEditor);
  });
  useEffect(() => {
    initEditor();
  }, [initEditor]);
  return <div ref={ref} />;
};
export default React.memo(EditorContent);
