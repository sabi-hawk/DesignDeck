import React, { FC, useEffect, useState } from 'react';
import { useEditor } from '../hooks';
import AnimationPopup from './AnimationPopup';
import AnimationService, { AnimationFrame } from './AnimationService';

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
      console.log(`📊 Progress update for ${elementId}: ${progress}%`);
      
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

    // Add event listeners
    document.addEventListener('processingComplete', handleProcessingComplete as EventListener);
    document.addEventListener('progressUpdate', handleProgressUpdate as EventListener);
    document.addEventListener('processingFailed', handleProcessingFailed as EventListener);

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

  return (
    <>
      {/* Animation Popup */}
      <AnimationPopup
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
          bottom: isVisible ? 0 : '-180px', // Slide down when visible, up when hidden
          left: '433px', // Start from the very left edge
          right: '0', // End exactly at the right sidebar boundary
          background: '#1a202c',
          borderTop: '2px solid #667eea',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          height: '180px',
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
            padding: '16px',
            height: '148px',
          }}
        >
          {/* Timeline Ruler with Thumbnails */}
          <div
            css={{
              height: '110px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            {/* Timeline Header with Scroll Info */}
            {totalTimelineWidth > 800 && (
              <div
                css={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  height: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: '#a0aec0',
                  zIndex: 1,
                }}
              >
                Timeline: {Math.ceil(totalTimelineDuration / timelineScale)}{' '}
                segments • {animationService.getAnimatedElementIds().length}{' '}
                animated elements • Scroll horizontally to view all
              </div>
            )}

            {/* Alternative: Native Scrollbar with Better Styling */}
            <div
              css={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
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
              {/* Timeline Content with Fixed Width */}
              <div
                css={{
                  width: `${totalTimelineWidth}px`,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                {/* Timeline Segments with Thumbnails */}
                {Array.from(
                  { length: Math.ceil(totalTimelineDuration / timelineScale) },
                  (_, i) => {
                    const startTime = i * timelineScale;
                    const endTime = startTime + timelineScale;
                    const frame = getFrameForSegment(i);
                    const hasFrames = frame !== null;
                    const parentFrameGroupInfo = getParentFrameGroupInfo(i);
                    const isFirstInGroup = isFirstInParentFrameGroup(i);
                    const isLastInGroup = isLastInParentFrameGroup(i);

                    // Debug logging for segments 0 and 1
                    if (i === 0 || i === 1) {
                      console.log(`Segment ${i}:`, {
                        hasFrames,
                        frameColor: frame?.parentFrameBorderColor,
                        parentFrameGroupInfo: parentFrameGroupInfo ? {
                          parentFrameId: parentFrameGroupInfo.parentFrameId,
                          groupFrames: parentFrameGroupInfo.groupFrames.map(f => f.frameIndex),
                          isFirst: parentFrameGroupInfo.isFirst,
                          isLast: parentFrameGroupInfo.isLast,
                          isMiddle: parentFrameGroupInfo.isMiddle
                        } : null,
                        isFirstInGroup,
                        isLastInGroup
                      });
                    }

                    // Debug all frames to see their colors
                    if (hasFrames && frame) {
                      console.log(`Frame ${i} (${frame.elementId}): parentFrameBorderColor = "${frame.parentFrameBorderColor}"`);
                    }

                    return (
                      <div
                        key={i}
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
                            borderLeft: isFirstInGroup ? `2px solid ${frame?.parentFrameBorderColor || '#ff0000'}` : 'none', // Only left border for first element
                            borderTop: `2px solid ${frame?.parentFrameBorderColor || '#ff0000'}`, // Top border for all elements in group
                            borderBottom: `2px solid ${frame?.parentFrameBorderColor || '#ff0000'}`, // Bottom border for all elements in group
                            borderRight: isLastInGroup ? `2px solid ${frame?.parentFrameBorderColor || '#ff0000'}` : 'none', // Only right border for last element
                            borderRadius: isFirstInGroup && isLastInGroup ? '8px' : isFirstInGroup ? '8px 0 0 8px' : isLastInGroup ? '0 8px 8px 0' : '0',
                            marginLeft: isFirstInGroup ? '2px' : '0',
                            marginRight: isLastInGroup ? '2px' : '0',
                            marginTop: '2px', // Add top margin for symmetry
                            marginBottom: '2px', // Add bottom margin for symmetry
                            zIndex: 10,
                            // Temporary debugging - add background colors to see grouping
                            // background: isFirstInGroup ? 'rgba(255, 0, 0, 0.1)' : isLastInGroup ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 0, 255, 0.1)',
                            // Force the right border to be visible for debugging
                            ...(isLastInGroup && {
                              borderRight: `2px solid ${frame?.parentFrameBorderColor || '#ff0000'} !important`,
                            }),
                          }),
                        }}
                      >
                        {/* Time Label */}
                        <span
                          css={{
                            fontSize: '10px',
                            color: '#a0aec0',
                            fontWeight: '500',
                            position: 'absolute',
                            bottom: '4px',
                          }}
                        >
                          {startTime}s
                        </span>

                        {/* Parent Frame Group Label */}
                        {parentFrameGroupInfo && isFirstInGroup && (
                          <div
                            css={{
                              position: 'absolute',
                              top: '-20px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: 'rgba(0, 0, 0, 0.8)',
                              color: 'white',
                              fontSize: '8px',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap',
                              zIndex: 20,
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                              border: `1px solid ${frame?.parentFrameBorderColor || '#ff0000'}`,
                            }}
                          >
                            Frame Group ({parentFrameGroupInfo.groupFrames.length} elements)
                          </div>
                        )}

                        {/* Thumbnail if frames exist */}
                        {hasFrames && (
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
                              cursor: frame?.resultUrl ? 'pointer' : 'default',
                              ':hover': frame?.resultUrl ? {
                                border: '1px solid #667eea',
                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                              } : {},
                            }}
                            onClick={() => {
                              if (frame?.resultUrl) {
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
                              {frame?.imageDataUrl
                                ? `${Math.round(
                                    frame.imageDataUrl.length / 1024
                                  )}KB`
                                : '0KB'}
                            </div>

                                                         {/* Processing Status Overlay */}
                             {(!frame.resultUrl && frame.progress !== -1) && (
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

                        {/* Empty state indicator if no frames */}
                        {!hasFrames && (
                          <div
                            css={{
                              height: '70px',
                              width: '100px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px dashed rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              color: 'rgba(255, 255, 255, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '10px',
                              justifyContent: 'center',
                              padding: '4px',
                              position: 'absolute',
                              textAlign: 'center',
                              top: '25px',
                            }}
                          >
                            No frame
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Timeline Controls */}
          <div
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <button
              css={{
                background: '#667eea',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                ':hover': {
                  background: '#5a67d8',
                },
              }}
              onClick={() =>
                handleStartAnimation('demo-text', 'Text', 'Sample Text Element')
              }
            >
              Animate Text
            </button>
            <button
              css={{
                background: '#10B981',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                ':hover': {
                  background: '#059669',
                },
              }}
              onClick={() =>
                handleStartAnimation(
                  'demo-image',
                  'Image',
                  'Sample Image Element'
                )
              }
            >
              Animate Image
            </button>
            <button
              css={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                ':hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                },
              }}
              onClick={() => {
                const animatedElements =
                  animationService.getAnimatedElementIds();
                animatedElements.forEach((elementId) => {
                  animationService.stopAnimation(elementId);
                });
              }}
            >
              Stop All
            </button>

            {/* Debug Parent Frame Groups */}
            <button
              css={{
                background: 'rgba(255, 0, 0, 0.2)',
                border: '1px solid rgba(255, 0, 0, 0.4)',
                borderRadius: '6px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                ':hover': {
                  background: 'rgba(255, 0, 0, 0.3)',
                },
              }}
              onClick={() => {
                const framesByParent = getFramesByParentFrame();
                console.log('🔍 Parent Frame Groups Debug:');
                console.log(`Found ${framesByParent.size} parent frame groups`);
                
                for (const [parentFrameId, groupFrames] of framesByParent.entries()) {
                  console.log(`Parent Frame ${parentFrameId}:`);
                  groupFrames.forEach(({ frameIndex, frame }) => {
                    console.log(`  - Frame ${frameIndex}: ${frame.elementId} (${frame.isInsideFrame ? 'inside frame' : 'not in frame'})`);
                  });
                }
                
                // Also show all frames
                const framesByIndex = getFramesByIndex();
                console.log('🎯 All Timeline Frames:');
                for (const [frameIndex, frames] of framesByIndex.entries()) {
                  if (frames.length > 0) {
                    const frame = frames[0];
                    const parentFrameGroupInfo = getParentFrameGroupInfo(frameIndex);
                    const isFirst = isFirstInParentFrameGroup(frameIndex);
                    const isLast = isLastInParentFrameGroup(frameIndex);
                    console.log(`  Frame ${frameIndex}: ${frame.elementId} - Parent: ${parentFrameGroupInfo?.parentFrameId || 'none'} - Inside Frame: ${frame.isInsideFrame || false} - First: ${isFirst} - Last: ${isLast}`);
                  }
                }
                
                // Test the grouping logic for specific segments
                console.log('🧪 Testing Grouping Logic:');
                for (let i = 0; i < 5; i++) {
                  const groupInfo = getParentFrameGroupInfo(i);
                  const isFirst = isFirstInParentFrameGroup(i);
                  const isLast = isLastInParentFrameGroup(i);
                  console.log(`  Segment ${i}: Group: ${groupInfo ? 'Yes' : 'No'}, First: ${isFirst}, Last: ${isLast}`);
                }
              }}
            >
              Debug Groups
            </button>

            {/* Debug SimpleFrame Colors */}
            <button
              css={{
                background: 'rgba(0, 255, 0, 0.2)',
                border: '1px solid rgba(0, 255, 0, 0.4)',
                borderRadius: '6px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                ':hover': {
                  background: 'rgba(0, 255, 0, 0.3)',
                },
              }}
              onClick={() => {
                animationService.debugSimpleFrameColors();
              }}
            >
              Debug Colors
            </button>

            {/* Timeline Progress Bar */}
            <div
              css={{
                flex: 1,
                height: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                position: 'relative',
              }}
            >
              <div
                css={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: `${Math.min(
                    ((currentTime % totalTimelineDuration) /
                      totalTimelineDuration) *
                      100,
                    100
                  )}%`,
                  height: '100%',
                  background: '#667eea',
                  borderRadius: '2px',
                }}
              />
            </div>

            {/* Current Time Display */}
            <span
              css={{
                fontSize: '12px',
                color: '#a0aec0',
                fontWeight: '500',
                minWidth: '50px',
              }}
            >
              {Math.floor(currentTime % totalTimelineDuration)}s
            </span>

            {/* Scroll Indicator */}
            {totalTimelineWidth > 800 && (
              <div
                css={{
                  fontSize: '10px',
                  color: '#a0aec0',
                  padding: '4px 8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                Scroll →
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Timeline;
