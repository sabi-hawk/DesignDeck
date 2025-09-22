import { useCallback, useState } from 'react';
import { AnimationService } from '../../animation';

interface DragState {
  isDragging: boolean;
  draggedElementId: string | null;
  draggedSceneIndex: number | null;
  draggedElementIndex: number | null;
  dragOverSceneIndex: number | null;
  dragOverElementIndex: number | null;
}

interface UseTimelineDragDropProps {
  animationService: AnimationService;
  onReorder: (sceneId: string, fromIndex: number, toIndex: number) => void;
}

export const useTimelineDragDrop = ({ animationService, onReorder }: UseTimelineDragDropProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElementId: null,
    draggedSceneIndex: null,
    draggedElementIndex: null,
    dragOverSceneIndex: null,
    dragOverElementIndex: null,
  });

  const handleDragStart = useCallback((
    elementId: string,
    sceneIndex: number,
    elementIndex: number,
    event: React.DragEvent
  ) => {
    console.log('useTimelineDragDrop handleDragStart called:', { elementId, sceneIndex, elementIndex });
    
    setDragState({
      isDragging: true,
      draggedElementId: elementId,
      draggedSceneIndex: sceneIndex,
      draggedElementIndex: elementIndex,
      dragOverSceneIndex: null,
      dragOverElementIndex: null,
    });

    // Don't set a custom drag image - let the browser handle it
    // This often interferes with drag behavior

    // Set drag effect and data
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', elementId);
    event.dataTransfer.setData('application/json', JSON.stringify({
      elementId,
      sceneIndex,
      elementIndex
    }));
  }, []);

  const handleDragOver = useCallback((
    sceneIndex: number,
    elementIndex: number,
    event: React.DragEvent
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    console.log('Drag over:', { sceneIndex, elementIndex, dragState });

    setDragState(prev => ({
      ...prev,
      dragOverSceneIndex: sceneIndex,
      dragOverElementIndex: elementIndex,
    }));
  }, [dragState]);

  const handleDragLeave = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      dragOverSceneIndex: null,
      dragOverElementIndex: null,
    }));
  }, []);

  const handleDrop = useCallback((
    sceneId: string,
    sceneIndex: number,
    elementIndex: number,
    event: React.DragEvent
  ) => {
    event.preventDefault();

    console.log('Drop:', { sceneId, sceneIndex, elementIndex, dragState });

    // Try to get data from the drag event
    const dragData = event.dataTransfer.getData('application/json');
    let draggedElementId = dragState.draggedElementId;
    let draggedSceneIndex = dragState.draggedSceneIndex;
    let draggedElementIndex = dragState.draggedElementIndex;

    if (dragData) {
      try {
        const parsed = JSON.parse(dragData);
        draggedElementId = parsed.elementId;
        draggedSceneIndex = parsed.sceneIndex;
        draggedElementIndex = parsed.elementIndex;
        console.log('Using drag event data:', parsed);
      } catch (error) {
        console.warn('Failed to parse drag data:', error);
      }
    }

    if (
      draggedElementId &&
      draggedSceneIndex !== null &&
      draggedElementIndex !== null
    ) {
      // Only reorder if it's within the same scene
      if (draggedSceneIndex === sceneIndex) {
        console.log('Reordering:', draggedElementIndex, '->', elementIndex);
        onReorder(sceneId, draggedElementIndex, elementIndex);
      } else {
        console.log('Cannot reorder across different scenes');
      }
    }

    setDragState({
      isDragging: false,
      draggedElementId: null,
      draggedSceneIndex: null,
      draggedElementIndex: null,
      dragOverSceneIndex: null,
      dragOverElementIndex: null,
    });
  }, [dragState, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedElementId: null,
      draggedSceneIndex: null,
      draggedElementIndex: null,
      dragOverSceneIndex: null,
      dragOverElementIndex: null,
    });
  }, []);

  const isDragOver = useCallback((sceneIndex: number, elementIndex: number) => {
    return (
      dragState.dragOverSceneIndex === sceneIndex &&
      dragState.dragOverElementIndex === elementIndex
    );
  }, [dragState.dragOverSceneIndex, dragState.dragOverElementIndex]);

  const isBeingDragged = useCallback((sceneIndex: number, elementIndex: number) => {
    return (
      dragState.draggedSceneIndex === sceneIndex &&
      dragState.draggedElementIndex === elementIndex
    );
  }, [dragState.draggedSceneIndex, dragState.draggedElementIndex]);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isDragOver,
    isBeingDragged,
  };
};
