import React, { FC, useEffect, useState } from 'react';
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
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<string>('Element');
  const [selectedElementName, setSelectedElementName] = useState<string>('Selected Element');

  useEffect(() => {
    // Load any existing frames from the service
    const existingFrames = animationService.getAllFrames();
    if (existingFrames.length > 0) {
      setCurrentFrames(existingFrames);
      console.log('Loaded existing frames:', existingFrames.length);
      console.log('First frame data:', existingFrames[0]);
      console.log('First frame imageDataUrl length:', existingFrames[0]?.imageDataUrl?.length);
      console.log('First frame imageDataUrl preview:', existingFrames[0]?.imageDataUrl?.substring(0, 100));
    }

    // Set up callbacks for animation events
    animationService.setOnFrameCaptured((frame) => {
      setCurrentFrames(prev => [...prev, frame]);
    });

    animationService.setOnElementAnimationStarted((elementId, frameIndex) => {
      console.log(`🎬 Animation started for element ${elementId} at frame ${frameIndex}`);
    });

    animationService.setOnElementAnimationStopped((elementId) => {
      console.log(`⏹️ Animation stopped for element ${elementId}`);
    });

    // Update current time every second for timeline display
    const timeInterval = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [animationService]);

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

  // Handle animation start
  const handleStartAnimation = (elementId: string, elementType: string, elementName: string) => {
    setSelectedElementId(elementId);
    setSelectedElementType(elementType);
    setSelectedElementName(elementName);
    setShowAnimationPopup(true);
  };

  // Handle animation with settings
  const handleAnimateWithSettings = (settings: AnimationSettings) => {
    if (selectedElementId) {
      console.log(`🎬 Starting animation for ${selectedElementType} "${selectedElementName}" with settings:`, settings);
      const success = animationService.startAnimation(selectedElementId, settings);
      if (success) {
        console.log(`✅ Animation started successfully for element ${selectedElementId}`);
      } else {
        console.log(`❌ Failed to start animation for element ${selectedElementId}`);
      }
    }
  };

  // Handle stop animation
  const handleStopAnimation = (elementId: string) => {
    animationService.stopAnimation(elementId);
  };

  // Calculate timeline scale and duration based on captured frames
  const timelineScale = 10; // Fixed 10-second intervals
  const totalTimelineDuration = Math.max(currentFrames.length * timelineScale, 100); // Show at least 100 seconds
  
  // Calculate the width needed for each 10-second segment
  const segmentWidth = 120; // 120px per 10-second segment
  const totalTimelineWidth = Math.max(segmentWidth * Math.ceil(totalTimelineDuration / timelineScale), 800); // Minimum 800px width

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

      {/* Persistent Arrow Button - Shows when timeline is hidden */}
      {!isVisible && (
        <div
          css={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '48px',
            height: '48px',
            background: '#667eea',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            zIndex: 999,
            color: 'white',
            fontSize: '20px',
            ':hover': {
              background: '#5a67d8',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
          onClick={onToggle}
        >
          ↑
        </div>
      )}

      {/* Timeline Component - Only shows when visible */}
      {isVisible && (
        <div
          css={{
            position: 'fixed',
            bottom: 0,
            left: '433px', // Start from the very left edge
            right: '0', // End exactly at the right sidebar boundary
            background: '#1a202c',
            borderTop: '2px solid #667eea',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            height: '180px',
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease',
            // Ensure it aligns perfectly with the canvas
            margin: '0 auto',
            maxWidth: 'calc(100vw - 146px)',
          }}
        >
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
              Timeline ({animationService.getAnimatedElementIds().length} animated)
            </div>
            <button
              css={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '4px 8px',
                color: 'white',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                ':hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                },
                transition: 'all 0.2s ease',
              }}
              onClick={onToggle}
            >
              Hide
            </button>
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
                  Timeline: {Math.ceil(totalTimelineDuration / timelineScale)} segments • {animationService.getAnimatedElementIds().length} animated elements • Scroll horizontally to view all
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
                  {Array.from({ length: Math.ceil(totalTimelineDuration / timelineScale) }, (_, i) => {
                    const startTime = i * timelineScale;
                    const endTime = startTime + timelineScale;
                    const frame = getFrameForSegment(i);
                    const hasFrames = frame !== null;
                    
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

                        {/* Element Info */}
                        {hasFrames && frame && (
                          <div
                            css={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              fontSize: '8px',
                              color: 'white',
                              background: 'rgba(0, 0, 0, 0.8)',
                              padding: '2px 4px',
                              borderRadius: '2px',
                              maxWidth: '90px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {frame.elementId}
                          </div>
                        )}

                        {/* Stop Button for Individual Elements */}
                        {hasFrames && frame && (
                          <button
                            css={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '16px',
                              height: '16px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              color: 'white',
                              fontSize: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              ':hover': {
                                background: 'rgba(239, 68, 68, 1)',
                                transform: 'scale(1.1)',
                              },
                            }}
                            title={`Stop animation for ${frame.elementId}`}
                            onClick={() => handleStopAnimation(frame.elementId)}
                          >
                            ×
                          </button>
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
                                  console.warn(
                                    `Image loading aborted for segment ${startTime}s`
                                  );
                                }}
                                onError={(e) => {
                                  console.error(
                                    `Failed to load image for segment ${startTime}s:`,
                                    e
                                  );
                                  console.log(
                                    'Image data length:',
                                    frame.imageDataUrl?.length
                                  );
                                  console.log(
                                    'Image data preview:',
                                    frame.imageDataUrl?.substring(0, 100)
                                  );
                                  console.log('Image element:', e.target);
                                  console.log('Full frame data:', frame);
                                }}
                                onLoad={() => {
                                  console.log(
                                    `Successfully loaded image for segment ${startTime}s`
                                  );
                                  console.log(
                                    'Image data length:',
                                    frame.imageDataUrl?.length
                                  );
                                  console.log(
                                    'Image data preview:',
                                    frame.imageDataUrl?.substring(0, 50)
                                  );
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
                  })}
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
                onClick={() => handleStartAnimation('demo-text', 'Text', 'Sample Text Element')}
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
                onClick={() => handleStartAnimation('demo-image', 'Image', 'Sample Image Element')}
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
                  const animatedElements = animationService.getAnimatedElementIds();
                  animatedElements.forEach(elementId => {
                    animationService.stopAnimation(elementId);
                  });
                  console.log(`🛑 Stopped all animations (${animatedElements.length} elements)`);
                }}
              >
                Stop All
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
                    width: `${Math.min((currentTime % totalTimelineDuration) / totalTimelineDuration * 100, 100)}%`,
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
      )}
    </>
  );
};

export default Timeline; 