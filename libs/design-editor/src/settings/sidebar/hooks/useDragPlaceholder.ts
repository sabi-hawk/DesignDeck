import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSObject } from '@emotion/react';

export const useDragPlaceholder = (
  sortableProps?: ReturnType<typeof useSortable>
) => {
  const { transition, transform, isDragging } = sortableProps || {};

  const css: CSSObject | undefined = sortableProps
    ? {
        transform: CSS.Transform.toString(transform || null),
        transition: transition,
        zIndex: isDragging ? 1 : 'auto',
        opacity: isDragging ? 0.2 : 1,
        touchAction: 'none',
      }
    : {
        boxShadow: '0px 4px 12px rgb(0 0 0 / 10%)',
      };
  const contentCss: CSSObject | undefined = sortableProps
    ? { opacity: sortableProps.isDragging ? 0 : 1 }
    : undefined;

  return { css, contentCss };
};
