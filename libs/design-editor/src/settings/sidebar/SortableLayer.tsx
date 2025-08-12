import { useSortable } from '@dnd-kit/sortable';
import { LayerComponentProps } from '@lidojs/design-core';
import React, { FC, HTMLProps } from 'react';
import { Layer } from '../../types';
import { useDragPlaceholder } from './hooks/useDragPlaceholder';
import LayerContent from './LayerContent';

type Props = Omit<HTMLProps<HTMLDivElement>, 'ref'> & {
  layer: Layer<LayerComponentProps>;
  onOpenOption: (e: React.MouseEvent) => void;
};

const SortableLayer: FC<Props> = ({ layer, onOpenOption, ...props }) => {
  const sortableProps = useSortable({ id: layer.id });

  const { css } = useDragPlaceholder(sortableProps);
  return (
    <LayerContent
      ref={sortableProps.setNodeRef}
      extraCSS={css}
      layer={layer}
      listeners={sortableProps.listeners}
      onOpenOption={onOpenOption}
      {...sortableProps.attributes}
      {...props}
    />
  );
};

export default SortableLayer;
