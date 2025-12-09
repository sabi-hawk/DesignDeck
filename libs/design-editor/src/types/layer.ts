import {
  BoxSize,
  Delta,
  LayerComponentProps,
  LayerId,
  LayerType,
} from '@lidojs/design-core';
import { TextEditor } from '@lidojs/text-editor';
import { FunctionComponent, ReactElement } from 'react';
import { DeepPartial } from './common';
import { EditorActions, EditorState } from './editor';

export type ContextMenuItem = {
  value: string;
  label: string | ReactElement;
  execute: (data: {
    pageIndex: number;
    layerId: LayerId;
    state: EditorState;
    actions: EditorActions;
  }) => void;
};

export type LayerInfo = {
  name: string;
  type: LayerType;
  contextMenu?: ContextMenuItem[];
};

export interface LayerComponent<P extends LayerComponentProps>
  extends FunctionComponent<P> {
  info: LayerInfo;
}

export type LayerActions = {
  setProp: <P extends LayerComponentProps>(props: DeepPartial<P>) => void;
  select: () => void;
  hover: (v?: null) => void;
  setTextEditor: (editor: TextEditor) => void;
  openTextEditor: () => void;
  openImageEditor: (data: {
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
    };
    video?: {
      url: string;
      position: Delta;
      rotate: number;
      boxSize: BoxSize;
      flipVertical?: boolean;
      flipHorizontal?: boolean;
    };
  }) => void;
};

export type LayerData<P extends LayerComponentProps> = LayerInfo & {
  comp: LayerComponent<P>;
  props: P;
  locked: boolean;
  parent: LayerId | null;
  child: LayerId[];
  editor?: TextEditor;
};
export type Layer<P extends LayerComponentProps> = {
  id: LayerId;
  data: LayerData<P>;
  _originalId?: any;
};

export type LayerDataRef = Record<
  LayerId,
  Pick<LayerComponentProps, 'position' | 'boxSize' | 'rotate' | 'scale'> & {
    centerX?: number;
    centerY?: number;
    type: LayerType;
  }
>;

export type Layers = Record<LayerId, Layer<LayerComponentProps>>;
