import { useState } from 'react';
import { AnimationService } from '../../animation';

export interface AnimationSettings {
  sketchingDuration: number;
  colorFillDuration: number;
  handStyle: string;
}

export const useTimelineAnimation = (animationService: AnimationService) => {
  const [showAnimationPopup, setShowAnimationPopup] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<string>('Element');
  const [selectedElementName, setSelectedElementName] = useState<string>('Selected Element');

  const handleStartAnimation = (
    elementId: string,
    elementType: string,
    elementName: string
  ) => {
    setSelectedElementId(elementId);
    setSelectedElementType(elementType);
    setSelectedElementName(elementName);
    setShowAnimationPopup(true);
  };

  const handleAnimateWithSettings = (settings: AnimationSettings) => {
    if (selectedElementId) {
      const success = animationService.startAnimation(
        selectedElementId,
        settings
      );
      if (!success) {
        console.warn(
          `Failed to start animation for element ${selectedElementId}`
        );
      }
    }
  };

  const handleStopAnimation = (elementId: string) => {
    animationService.stopAnimation(elementId);
  };

  return {
    showAnimationPopup,
    selectedElementId,
    selectedElementType,
    selectedElementName,
    setShowAnimationPopup,
    handleStartAnimation,
    handleAnimateWithSettings,
    handleStopAnimation
  };
};
