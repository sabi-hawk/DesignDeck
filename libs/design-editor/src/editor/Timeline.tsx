import React, { FC, useEffect, useState } from 'react';
import AnimationService, { AnimationFrame } from './AnimationService';

interface TimelineProps {
  isVisible: boolean;
  onToggle: () => void;
}

const Timeline: FC<TimelineProps> = ({ isVisible, onToggle }) => {
  const [animationService] = useState(() => AnimationService.getInstance());
  const [currentFrames, setCurrentFrames] = useState<AnimationFrame[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Set up callback for when frames are captured
    animationService.setOnFrameCaptured((frame) => {
      setCurrentFrames(prev => [...prev, frame]);
    });

    // Update current time every second for timeline display
    const timeInterval = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [animationService]);

  // Get frames for current time intervals (every 10 seconds)
  const getFramesForTimeRange = (startTime: number, endTime: number): AnimationFrame[] => {
    // Map frames to segments based on their capture order
    // Each frame represents a 10-second interval, so frame index 0 = 0-10s, frame index 1 = 10-20s, etc.
    const segmentIndex = startTime / timelineScale;
    const frameIndex = Math.floor(segmentIndex);
    
    // Debug logging
    console.log(`Segment ${startTime}s-${endTime}s: Looking for frame at index ${frameIndex}, total frames: ${currentFrames.length}`);
    
    // Return the frame at this index if it exists
    if (frameIndex < currentFrames.length) {
      const frame = currentFrames[frameIndex];
      console.log(`Found frame for segment ${startTime}s:`, frame);
      return [frame];
    }
    
    console.log(`No frame found for segment ${startTime}s`);
    return [];
  };

  // Calculate timeline scale and duration based on captured frames
  const timelineScale = 10; // Fixed 10-second intervals
  const totalTimelineDuration = Math.max(currentFrames.length * timelineScale, 100); // Show at least 100 seconds
  
  // Calculate the width needed for each 10-second segment
  const segmentWidth = 120; // 120px per 10-second segment
  const totalTimelineWidth = Math.max(segmentWidth * Math.ceil(totalTimelineDuration / timelineScale), 800); // Minimum 800px width

  return (
    <>
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
              Timeline
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
                  Timeline: {Math.ceil(totalTimelineDuration / timelineScale)} segments ({currentFrames.length} frames captured) • Scroll horizontally to view all
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
                    const frames = getFramesForTimeRange(startTime, endTime);
                    const hasFrames = frames.length > 0;
                    
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
                              {frames[0].imageDataUrl ? 'Has Image' : 'No Image'}
                            </div>
                            
                            {/* Debug image data length */}
                            <div
                              css={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                fontSize: '8px',
                                color: 'white',
                                background: 'rgba(0, 0, 0, 0.7)',
                                padding: '1px 2px',
                                borderRadius: '2px',
                                zIndex: 10,
                              }}
                            >
                              {frames[0].imageDataUrl ? `${Math.round(frames[0].imageDataUrl.length / 1024)}KB` : '0KB'}
                            </div>
                            
                            {/* Debug data format */}
                            <div
                              css={{
                                position: 'absolute',
                                bottom: '2px',
                                left: '2px',
                                fontSize: '8px',
                                color: 'white',
                                background: 'rgba(0, 0, 0, 0.7)',
                                padding: '1px 2px',
                                borderRadius: '2px',
                                zIndex: 10,
                                maxWidth: '90px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {frames[0].imageDataUrl ? 
                                (frames[0].imageDataUrl.startsWith('data:image/') ? 'Valid Data URL' : 'Not Data URL') : 
                                'No Data'
                              }
                            </div>
                            
                            {/* Try to display the image */}
                            {frames[0].imageDataUrl && frames[0].imageDataUrl.startsWith('data:image/') ? (
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
                                src={frames[0].imageDataUrl}
                                onError={(e) => {
                                  console.error(`Failed to load image for segment ${startTime}s:`, e);
                                  console.log('Image data length:', frames[0].imageDataUrl?.length);
                                  console.log('Image data preview:', frames[0].imageDataUrl?.substring(0, 100));
                                  console.log('Image element:', e.target);
                                }}
                                onLoad={() => {
                                  console.log(`Successfully loaded image for segment ${startTime}s`);
                                  console.log('Image data length:', frames[0].imageDataUrl?.length);
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
              >
                Play
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
              >
                Stop
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