import { FontData } from '@lidojs/design-core';
import { createContext } from 'react';
import {
  EditorActions,
  EditorQuery,
  EditorState,
  GetFontQuery,
} from '../types';

export type EditorConfig = {
  assetPath: string;
  frame: {
    defaultImage: {
      width: number;
      height: number;
      url: string;
    };
  };
};
export type EditorContext = {
  getState: () => EditorState;
  query: EditorQuery;
  actions: EditorActions;
  getFonts: (query: GetFontQuery) => Promise<FontData[]>;
  config: EditorConfig;
  uploadImage: (image: File) => Promise<{ url: string; thumb: string }>;
};

export const EditorContext = createContext<EditorContext>({} as EditorContext);
