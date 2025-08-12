import {
  BoxData,
  BoxSize,
  CursorPosition,
  Delta,
  FontData,
  LayerId,
  LayerType,
  SerializedLayers,
} from '@lidojs/design-core';
import { TextEditor } from '@lidojs/text-editor';
import { ActionMethods } from '../editor/actions';
import { QueryMethods } from '../editor/query';
import { HorizontalGuideline, VerticalGuideline } from './common';
import { Page } from './page';
import { Direction, LinePosition } from './resize';

export type ImageEditorData = {
  layerId: LayerId;
  pageIndex: number;
  position: Delta;
  rotate: number;
  boxSize: BoxSize;
  image?: {
    url: string;
    position: Delta;
    rotate: number;
    boxSize: BoxSize;
    flipVertical?: boolean;
    flipHorizontal?: boolean;
  } | null;
};
export type SidebarType =
  | 'TEXT_EFFECT'
  | 'FONT_FAMILY'
  | 'LAYER_MANAGEMENT'
  | 'CHOOSING_COLOR'
  | 'IMAGE_MANIPULATION'
  | 'IFRAME_CONFIGURATION';

export interface EditorState {
  scale: number;
  selectedLayers: Record<number, LayerId[]>;
  hoveredLayer: Record<number, LayerId | null>;
  openMenu: {
    clientX: number;
    clientY: number;
  } | null;
  imageEditor?: ImageEditorData;
  textEditor?: {
    pageIndex: number;
    layerId: LayerId;
    editor: TextEditor | null;
  };
  controlBox?: BoxData;
  guideline: {
    horizontal: HorizontalGuideline[];
    vertical: VerticalGuideline[];
  };
  activePage: number;
  pages: Page[];
  sidebar: SidebarType | null;
  sidebarParams: Record<string, unknown>;
  fontList: FontData[];
  resizeData: {
    status: boolean;
    layerIds?: LayerId[];
    direction?: Direction;
    rotate?: number;
    boxSize?: BoxSize;
    cursor?: CursorPosition;
  };
  selectData: {
    status: boolean;
  };
  dragNDrop: {
    status: boolean;
    layerType: LayerType;
    data: { rootId: LayerId; layers: SerializedLayers };
    position: Delta;
  };
  dragData: {
    status: boolean;
    layerIds?: LayerId[];
    position?: Delta;
    cursor?: CursorPosition;
  };
  rotateData: {
    status: boolean;
    rotate?: number;
    cursor?: CursorPosition;
  };
}

export type CoreEditorActions = ReturnType<typeof ActionMethods>;

export type HistoryActions = {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  new: () => void;
  ignore: () => CoreEditorActions;
  merge: () => CoreEditorActions;
  throttle: (rate: number) => CoreEditorActions;
  back: () => void;
};

export type CoreEditorQuery = ReturnType<typeof QueryMethods>;

export interface EditorQuery extends CoreEditorQuery {
  history: {
    canUndo: () => boolean;
    canRedo: () => boolean;
  };
}

export type EditorActions = CoreEditorActions & {
  history: HistoryActions;
};
