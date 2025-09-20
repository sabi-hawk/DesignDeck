import { useEffect, useState } from 'react';
import { AnimationService, AnimationFrame } from '../../animation';

export const useTimelineData = (pages: any[]) => {
  const [animationService] = useState(() => AnimationService.getInstance());
  const [currentFrames, setCurrentFrames] = useState<AnimationFrame[]>([]);

  useEffect(() => {
    // Update AnimationService with current pages data
    animationService.updatePagesData(pages);

    // Load any existing frames from the service
    const existingFrames = animationService.getAllFrames();
    if (existingFrames.length > 0) {
      setCurrentFrames(existingFrames);
    }

    // Set up callbacks for animation events
    animationService.setOnFrameCaptured((frame) => {
      setCurrentFrames((prev) => [...prev, frame]);
    });

    animationService.setOnElementAnimationStarted((elementId, frameIndex) => {
      // Animation started
    });

    animationService.setOnElementAnimationStopped((elementId) => {
      // Animation stopped
    });

    // Listen for processing events
    const handleProcessingComplete = (event: CustomEvent) => {
      const { elementId, frameId, resultUrl } = event.detail;
      console.log(`🎉 Processing complete for ${elementId}: ${resultUrl}`);
      
      // Update the frame with the result URL
      setCurrentFrames((prev) => 
        prev.map((frame) => 
          frame.id === frameId 
            ? { ...frame, resultUrl, progress: 100 }
            : frame
        )
      );
    };

    const handleProgressUpdate = (event: CustomEvent) => {
      const { elementId, frameId, progress } = event.detail;
      
      // Update the frame with the progress
      setCurrentFrames((prev) => 
        prev.map((frame) => 
          frame.id === frameId 
            ? { ...frame, progress }
            : frame
        )
      );
    };

    const handleProcessingFailed = (event: CustomEvent) => {
      const { elementId, frameId } = event.detail;
      console.log(`❌ Processing failed for ${elementId}`);
      
      // Mark the frame as failed
      setCurrentFrames((prev) => 
        prev.map((frame) => 
          frame.id === frameId 
            ? { ...frame, progress: -1 } // -1 indicates failure
            : frame
        )
      );
    };

    const handleRemoveAnimationFromTimeline = (event: CustomEvent) => {
      const { elementId } = event.detail;
      console.log(`🗑️ Removing animation from timeline for element ${elementId}`);
      
      // Remove all frames for this element from the timeline
      setCurrentFrames((prev) => 
        prev.filter((frame) => frame.elementId !== elementId)
      );
    };

    const handleRenumberTimeline = (event: CustomEvent) => {
      const { elementId } = event.detail;
      
      // Refresh timeline data from AnimationService using getFramesByIndex for consistency
      const framesByIndex = animationService.getFramesByIndex();
      const updatedFrames: AnimationFrame[] = [];
      
      // Convert framesByIndex back to a flat array for setCurrentFrames
      for (const frames of framesByIndex.values()) {
        updatedFrames.push(...frames);
      }
      
      setCurrentFrames(updatedFrames);
    };

    // Add event listeners
    document.addEventListener('processingComplete', handleProcessingComplete as EventListener);
    document.addEventListener('progressUpdate', handleProgressUpdate as EventListener);
    document.addEventListener('processingFailed', handleProcessingFailed as EventListener);
    document.addEventListener('removeAnimationFromTimeline', handleRemoveAnimationFromTimeline as EventListener);
    document.addEventListener('renumberTimeline', handleRenumberTimeline as EventListener);

    return () => {
      // Remove event listeners
      document.removeEventListener('processingComplete', handleProcessingComplete as EventListener);
      document.removeEventListener('progressUpdate', handleProgressUpdate as EventListener);
      document.removeEventListener('processingFailed', handleProcessingFailed as EventListener);
      document.removeEventListener('removeAnimationFromTimeline', handleRemoveAnimationFromTimeline as EventListener);
      document.removeEventListener('renumberTimeline', handleRenumberTimeline as EventListener);
    };
  }, [animationService, pages]);

  return {
    animationService,
    currentFrames,
    setCurrentFrames
  };
};
