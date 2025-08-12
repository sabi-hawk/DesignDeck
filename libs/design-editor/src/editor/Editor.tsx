import { FontData } from '@lidojs/design-core';
import React, { FC, PropsWithChildren } from 'react';
import { useEditorStore } from '../hooks/useEditorStore';
import { GetFontQuery } from '../types';
import { EditorConfig, EditorContext } from './EditorContext';

export type EditorProps = {
  config: EditorConfig;
  getFonts: (query: GetFontQuery) => Promise<FontData[]>;
  uploadImage: (file: File) => Promise<{ url: string; thumb: string }>;
};

const Editor: FC<PropsWithChildren<EditorProps>> = ({
  getFonts,
  uploadImage,
  config,
  children,
}) => {
  const { getState, actions, query } = useEditorStore();
  return (
    <EditorContext.Provider
      value={{ config, getState, actions, query, getFonts, uploadImage }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default Editor;
