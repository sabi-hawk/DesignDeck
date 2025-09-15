import React, { FC, useEffect, useState } from 'react';
import { useEditor } from '../hooks';
import { AnimationService, AnimationFrame } from './animation';
import AnimationPopup from './AnimationPopup';

export interface AnimationSettings {
  sketchingDuration: number;
  colorFillDuration: number;
  handStyle: string;
}

interface TimelineProps {
  isVisible: boolean;
  onToggle: () => void;
}

const Timeline: FC<TimelineProps> = ({ isVisible, onToggle }) => {
  const [animationService] = useState(() => AnimationService.getInstance());
  const [currentFrames, setCurrentFrames] = useState<AnimationFrame[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAnimationPopup, setShowAnimationPopup] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [selectedElementType, setSelectedElementType] =
    useState<string>('Element');
  const [selectedElementName, setSelectedElementName] =
    useState<string>('Selected Element');
  const {
    state: { pages },
  } = useEditor();
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

    // Update current time every second for timeline display
    const timeInterval = setInterval(() => {
      setCurrentTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timeInterval);
      // Remove event listeners
      document.removeEventListener('processingComplete', handleProcessingComplete as EventListener);
      document.removeEventListener('progressUpdate', handleProgressUpdate as EventListener);
      document.removeEventListener('processingFailed', handleProcessingFailed as EventListener);
      document.removeEventListener('removeAnimationFromTimeline', handleRemoveAnimationFromTimeline as EventListener);
      document.removeEventListener('renumberTimeline', handleRenumberTimeline as EventListener);
    };
  }, [animationService, pages]); // Add pages to dependency array

  // Get frames organized by frame index for timeline display
  const getFramesByIndex = (): Map<number, AnimationFrame[]> => {
    return animationService.getFramesByIndex();
  };

  // Get frame for a specific timeline segment
  const getFrameForSegment = (segmentIndex: number): AnimationFrame | null => {
    try {
      const framesByIndex = getFramesByIndex();
      const frames = framesByIndex.get(segmentIndex);
      return frames && frames.length > 0 ? frames[0] : null;
    } catch (error) {
      console.error(`Error getting frame for segment ${segmentIndex}:`, error);
      return null;
    }
  };

  // Get all frames organized by parent frame ID for grouping
  const getFramesByParentFrame = (): Map<string, { frameIndex: number; frame: AnimationFrame }[]> => {
    const framesByParent = new Map<string, { frameIndex: number; frame: AnimationFrame }[]>();
    
    const framesByIndex = getFramesByIndex();
    for (const [frameIndex, frames] of framesByIndex.entries()) {
      if (frames.length > 0) {
        const frame = frames[0];
        const parentFrameId = frame.parentFrameId;
        
        if (parentFrameId) {
          if (!framesByParent.has(parentFrameId)) {
            framesByParent.set(parentFrameId, []);
          }
          framesByParent.get(parentFrameId)!.push({ frameIndex, frame });
        }
      }
    }
    
    return framesByParent;
  };

  // Calculate all parent frame groups upfront and create a mapping
  const getParentFrameGroupMapping = (): Map<number, { 
    parentFrameId: string; 
    groupFrames: { frameIndex: number; frame: AnimationFrame }[];
    isFirst: boolean;
    isLast: boolean;
    isMiddle: boolean;
  } | null> => {
    const mapping = new Map<number, any>();
    const framesByParent = getFramesByParentFrame();
    
    // For each parent frame group, determine first/last/middle for each frame
    for (const [parentFrameId, groupFrames] of framesByParent.entries()) {
      // Sort frames by frameIndex to ensure proper order
      const sortedFrames = groupFrames.sort((a, b) => a.frameIndex - b.frameIndex);
      
      for (let i = 0; i < sortedFrames.length; i++) {
        const { frameIndex, frame } = sortedFrames[i];
        const isFirst = i === 0;
        const isLast = i === sortedFrames.length - 1;
        const isMiddle = !isFirst && !isLast;
        
        mapping.set(frameIndex, {
          parentFrameId,
          groupFrames: sortedFrames,
          isFirst,
          isLast,
          isMiddle
        });
      }
    }
    
    return mapping;
  };

  // Get parent frame group info for a specific segment (using the pre-calculated mapping)
  const getParentFrameGroupInfo = (segmentIndex: number): { 
    parentFrameId: string; 
    groupFrames: { frameIndex: number; frame: AnimationFrame }[];
    isFirst: boolean;
    isLast: boolean;
    isMiddle: boolean;
  } | null => {
    const mapping = getParentFrameGroupMapping();
    return mapping.get(segmentIndex) || null;
  };

  // Get scene number for a parent frame group - use stored scene number
  const getSceneNumber = (parentFrameId: string): number => {
    try {
      // Try to get the stored scene number from the frame's properties
      const currentPage = pages[0];
      if (currentPage?.layers?.[parentFrameId]) {
        const frameLayer = currentPage.layers[parentFrameId];
        const storedSceneNumber = (frameLayer.data.props as any)?.sceneNumber;
        if (typeof storedSceneNumber === 'number' && storedSceneNumber > 0) {
          return storedSceneNumber;
        }
      }

      // Fallback to the original position-based calculation
      const framesByParent = getFramesByParentFrame();
      const parentFrameIds = Array.from(framesByParent.keys()).sort();
      return parentFrameIds.indexOf(parentFrameId) + 1;
    } catch (error) {
      console.error('Error getting scene number for timeline:', error);
      return 1;
    }
  };

  // Check if this segment is the first in its parent frame group
  const isFirstInParentFrameGroup = (segmentIndex: number): boolean => {
    const group = getParentFrameGroupInfo(segmentIndex);
    if (!group) return false;
    
    return group.isFirst;
  };

  // Check if this segment is the last in its parent frame group
  const isLastInParentFrameGroup = (segmentIndex: number): boolean => {
    const group = getParentFrameGroupInfo(segmentIndex);
    if (!group) return false;
    
    return group.isLast;
  };

  // Handle animation start
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

  // Handle animation with settings
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

  // Handle stop animation
  const handleStopAnimation = (elementId: string) => {
    animationService.stopAnimation(elementId);
  };

  // Calculate timeline scale and duration based on captured frames
  const timelineScale = 10; // Fixed 10-second intervals
  const totalTimelineDuration = Math.max(
    currentFrames.length * timelineScale,
    100
  ); // Show at least 100 seconds

  // Calculate the width needed for each 10-second segment
  const segmentWidth = 120; // 120px per 10-second segment
  const totalTimelineWidth = Math.max(
    segmentWidth * Math.ceil(totalTimelineDuration / timelineScale),
    800
  ); // Minimum 800px width

  // Get only the segments that have actual frames (no empty segments)
  const getAnimatedSegments = (): { segmentIndex: number; frame: AnimationFrame }[] => {
    const segments: { segmentIndex: number; frame: AnimationFrame }[] = [];
    const framesByIndex = getFramesByIndex();
    
    for (const [frameIndex, frames] of framesByIndex.entries()) {
      if (frames.length > 0) {
        segments.push({
          segmentIndex: frameIndex,
          frame: frames[0]
        });
      }
    }
    
    return segments.sort((a, b) => a.segmentIndex - b.segmentIndex);
  };

  const animatedSegments = getAnimatedSegments();
  const timelineWidth = animatedSegments.length > 0 ? animatedSegments.length * segmentWidth : 800;

  return (
    <>
      {/* Animation Popup */}
      <AnimationPopup
        elementId={selectedElementId}
        elementName={selectedElementName}
        elementType={selectedElementType}
        isVisible={showAnimationPopup}
        onAnimate={handleAnimateWithSettings}
        onClose={() => setShowAnimationPopup(false)}
      />

      {/* Timeline Container - Always present but slides up/down */}
      <div
        css={{
          position: 'fixed',
          bottom: isVisible ? 0 : '-220px', // Slide down when visible, up when hidden
          left: '433px', // Start from the very left edge
          right: '0', // End exactly at the right sidebar boundary
          background: '#1a202c',
          borderTop: '2px solid #667eea',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          height: '220px', // Increased height to accommodate scene labels
          transition: 'bottom 0.3s ease',
          // Ensure it aligns perfectly with the canvas
          margin: '0 auto',
          maxWidth: 'calc(100vw - 146px)',
        }}
      >
        {/* Arrow Button - Positioned at top center of timeline */}
        <div
          css={{
            position: 'absolute',
            top: '-24px', // Position above the timeline
            left: '50%', // Center horizontally
            transform: 'translateX(-50%)', // Center the button itself
            width: '48px',
            height: '24px',
            background: '#667eea',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 -2px 8px rgba(102, 126, 234, 0.3)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            ':hover': {
              background: '#5a67d8',
              transform: 'translateX(-50%) translateY(-2px)',
            },
            transition: 'all 0.2s ease',
          }}
          onClick={onToggle}
        >
          {isVisible ? '▼' : '▲'}
        </div>

        {/* Timeline Header */}
        <div
          css={{
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: '1px solid #4a5568',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <div
            css={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
            }}
          >
            Timeline ({animationService.getAnimatedElementIds().length}{' '}
            animated)
          </div>
        </div>

        {/* Timeline Content */}
        <div
          css={{
            padding: '8px 16px 8px 16px',
            // paddingTop: '16px', // Reset padding top
            height: '188px', // Increased height to match container
          }}
        >
          {/* Timeline Ruler with Thumbnails */}
          <div
            css={{
              height: '130px', // Increased height to accommodate scene labels
              // background: 'rgba(255, 255, 255, 0.05)',
              // border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'visible', // Changed from 'hidden' to 'visible' to show scene labels
              marginBottom: '20px',
              paddingTop: '30px', // Add padding at top for scene labels
            }}
          >
            {/* Alternative: Native Scrollbar with Better Styling */}
            <div
              css={{
                width: '100%',
                height: '100%',
                // overflow: 'auto',
                position: 'relative',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  ':hover': {
                    background: 'rgba(255, 255, 255, 0.5)',
                  },
                },
              }}
            >
              {/* Timeline Content with Dynamic Width */}
              <div
                css={{
                  width: `${timelineWidth}px`,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                {/* Timeline Segments with Thumbnails */}
                {animatedSegments.map(({ segmentIndex, frame }) => {
                  const startTime = segmentIndex * timelineScale;
                  const endTime = startTime + timelineScale;
                  const parentFrameGroupInfo =
                    getParentFrameGroupInfo(segmentIndex);
                  const isFirstInGroup =
                    isFirstInParentFrameGroup(segmentIndex);
                  const isLastInGroup = isLastInParentFrameGroup(segmentIndex);

                  return (
                    <div
                      key={segmentIndex}
                      css={{
                        width: `${segmentWidth}px`,
                        height: '100%',
                        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        flexShrink: 0,
                        // Add red border styling for parent frame groups
                        ...(parentFrameGroupInfo && {
                          border: 'none', // Remove default border
                          borderLeft: isFirstInGroup
                            ? `2px solid ${
                                frame?.parentFrameBorderColor || '#ff0000'
                              }`
                            : 'none', // Only left border for first element
                          borderTop: `2px solid ${
                            frame?.parentFrameBorderColor || '#ff0000'
                          }`, // Top border for all elements in group
                          borderBottom: `2px solid ${
                            frame?.parentFrameBorderColor || '#ff0000'
                          }`, // Bottom border for all elements in group
                          borderRight: isLastInGroup
                            ? `2px solid ${
                                frame?.parentFrameBorderColor || '#ff0000'
                              }`
                            : 'none', // Only right border for last element
                          borderRadius:
                            isFirstInGroup && isLastInGroup
                              ? '8px'
                              : isFirstInGroup
                              ? '8px 0 0 8px'
                              : isLastInGroup
                              ? '0 8px 8px 0'
                              : '0',
                          marginLeft: isFirstInGroup ? '2px' : '0',
                          marginRight: isLastInGroup ? '2px' : '0',
                          marginTop: '2px', // Add top margin for symmetry
                          marginBottom: '2px', // Add bottom margin for symmetry
                          zIndex: 10,
                          // Temporary debugging - add background colors to see grouping
                          // background: isFirstInGroup ? 'rgba(255, 0, 0, 0.1)' : isLastInGroup ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 0, 255, 0.1)',
                          // Force the right border to be visible for debugging
                          ...(isLastInGroup && {
                            borderRight: `2px solid ${
                              frame?.parentFrameBorderColor || '#ff0000'
                            } !important`,
                          }),
                        }),
                      }}
                    >
                      {/* Scene Label - Above Timeline Border */}
                      {parentFrameGroupInfo && isFirstInGroup && (
                        <div
                          css={{
                            position: 'absolute',
                            top: '-25px', // Position above the timeline box but within container bounds
                            left: '4px',
                            background: 'rgba(0, 0, 0, 0.9)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap',
                            zIndex: 30,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                            border: `1px solid ${
                              frame?.parentFrameBorderColor || '#ff0000'
                            }`,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                          }}
                        >
                          Scene{' '}
                          {getSceneNumber(parentFrameGroupInfo.parentFrameId)}
                        </div>
                      )}

                      {/* Animation Order Number - Top Left Corner of each box */}
                      <div
                        css={{
                          position: 'absolute',
                          top: '4px',
                          left: '11px',
                          width: '20px',
                          height: '20px',
                          background: 'rgba(0, 0, 0, 0.9)',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 25,
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                          border: `2px solid ${
                            frame?.parentFrameBorderColor || '#ff0000'
                          }`,
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                        }}
                      >
                        {segmentIndex + 1}
                      </div>

                      {/* Thumbnail if frames exist */}
                      {frame && (
                        <div
                          css={{
                            height: '70px',
                            width: '100px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'absolute',
                            top: '25px',
                            cursor: frame.resultUrl ? 'pointer' : 'default',
                            ':hover': frame.resultUrl
                              ? {
                                  border: '1px solid #667eea',
                                  boxShadow:
                                    '0 2px 8px rgba(102, 126, 234, 0.3)',
                                }
                              : {},
                          }}
                          onClick={() => {
                            if (frame.resultUrl) {
                              window.open(frame.resultUrl, '_blank');
                            }
                          }}
                        >
                          {/* Debug info */}
                          <div
                            css={{
                              position: 'absolute',
                              top: '2px',
                              left: '2px',
                              fontSize: '8px',
                              color: 'white',
                              background: 'rgba(0, 0, 0, 0.7)',
                              padding: '1px 2px',
                              borderRadius: '2px',
                              zIndex: 10,
                            }}
                          >
                            {frame.imageDataUrl
                              ? `${Math.round(
                                  frame.imageDataUrl.length / 1024
                                )}KB`
                              : '0KB'}
                          </div>

                          {/* Processing Status Overlay */}
                          {!frame.resultUrl && frame.progress !== -1 && (
                            <div
                              css={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 15,
                                borderRadius: '4px',
                              }}
                            >
                              {/* Spinning Animation */}
                              <div
                                css={{
                                  width: '20px',
                                  height: '20px',
                                  border: '2px solid rgba(255, 255, 255, 0.3)',
                                  borderTop: '2px solid #667eea',
                                  borderRadius: '50%',
                                  animation: 'spin 1s linear infinite',
                                  marginBottom: '4px',
                                  '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' },
                                  },
                                }}
                              />
                              {/* Processing Text */}
                              <div
                                css={{
                                  color: 'white',
                                  fontSize: '8px',
                                  fontWeight: '500',
                                  textAlign: 'center',
                                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                                }}
                              >
                                Processing...
                              </div>
                            </div>
                          )}

                          {/* Failed Processing Overlay */}
                          {frame.progress === -1 && (
                            <div
                              css={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(220, 38, 38, 0.8)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 15,
                                borderRadius: '4px',
                              }}
                            >
                              {/* Error Icon */}
                              <div
                                css={{
                                  color: 'white',
                                  fontSize: '16px',
                                  marginBottom: '4px',
                                }}
                              >
                                ❌
                              </div>
                              {/* Error Text */}
                              <div
                                css={{
                                  color: 'white',
                                  fontSize: '8px',
                                  fontWeight: '500',
                                  textAlign: 'center',
                                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                                }}
                              >
                                Failed
                              </div>
                            </div>
                          )}

                          {/* Success Overlay */}
                          {frame.resultUrl && (
                            <div
                              css={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(16, 185, 129, 0.8)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 15,
                                borderRadius: '4px',
                              }}
                            >
                              {/* Play Button Icon - Top Left */}
                              <div
                                css={{
                                  position: 'absolute',
                                  top: '4px',
                                  left: '4px',
                                  width: '16px',
                                  height: '16px',
                                  background: 'rgba(0, 0, 0, 0.7)',
                                  borderRadius: '3px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  zIndex: 16,
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                }}
                              >
                                <svg
                                  fill="none"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  width="10"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M8 5V19L19 12L8 5Z" fill="white" />
                                </svg>
                              </div>

                              {/* Success Icon */}
                              <div
                                css={{
                                  color: 'white',
                                  fontSize: '16px',
                                  marginBottom: '4px',
                                }}
                              >
                                ✅
                              </div>
                              {/* Success Text */}
                              <div
                                css={{
                                  color: 'white',
                                  fontSize: '8px',
                                  fontWeight: '500',
                                  textAlign: 'center',
                                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                                }}
                              >
                                Ready
                              </div>
                            </div>
                          )}

                          {/* Try to display the image */}
                          {frame?.imageDataUrl &&
                          frame.imageDataUrl.startsWith('data:image/') ? (
                            <img
                              alt={`Frame at ${startTime}s`}
                              css={{
                                height: '100%',
                                objectFit: 'contain',
                                width: '100%',
                                maxHeight: '100%',
                                maxWidth: '100%',
                                display: 'block',
                              }}
                              src={frame.imageDataUrl}
                              onAbort={() => {
                                // Image loading aborted
                              }}
                              onError={(e) => {
                                console.warn(
                                  `Failed to load image for segment ${startTime}s`
                                );
                              }}
                              onLoad={() => {
                                // Image loaded successfully
                              }}
                            />
                          ) : (
                            <div
                              css={{
                                color: 'white',
                                fontSize: '10px',
                                textAlign: 'center',
                                padding: '4px',
                              }}
                            >
                              Invalid Image Data
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Timeline;
