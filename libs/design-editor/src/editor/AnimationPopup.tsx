import React, { FC, useState, useEffect } from 'react';
import { captureElement } from '../ultils/elementCapture';

export interface AnimationSettings {
  sketchingDuration: number;
  colorFillDuration: number;
  handStyle: string;
}

interface AnimationPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onAnimate: (settings: AnimationSettings) => void;
  elementType?: string;
  elementName?: string;
  elementId?: string | null; // Make it optional and allow null
}

const handStyles = [
  { id: '0', name: 'Shaka', icon: '🤙', color: '#8B5CF6' },
  { id: '1', name: 'Pointing', icon: '👆', color: '#10B981' },
  { id: '2', name: 'Fist', icon: '✊', color: '#059669' },
  { id: '3', name: 'Open Palm', icon: '✋', color: '#3B82F6' },
  { id: '4', name: 'Holding', icon: '🤏', color: '#EC4899' },
  { id: '5', name: 'Pen', icon: '✍️', color: '#2563EB' },
  { id: '6', name: 'Beckoning', icon: '👋', color: '#84CC16' },
];

const AnimationPopup: FC<AnimationPopupProps> = ({
  isVisible,
  onClose,
  onAnimate,
  elementType = 'Element',
  elementName = 'Selected Element',
  elementId
}) => {
  
  const [settings, setSettings] = useState<AnimationSettings>({
    sketchingDuration: 5,
    colorFillDuration: 3,
    handStyle: '1'
  });

  const [elementPreview, setElementPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Capture element preview when popup becomes visible
  useEffect(() => {
    if (isVisible && elementId && elementId.trim() !== '') {
      captureElementPreview();
    }
  }, [isVisible, elementId]);

  const captureElementPreview = async () => {
    if (!elementId || elementId.trim() === '') {
      return;
    }
    
    setIsCapturing(true);
    try {
      const preview = await captureElement(elementId, {
        quality: 0.8,
        maxWidth: 300,
        maxHeight: 200
      });
      setElementPreview(preview);
    } catch (error) {
      console.error('❌ Failed to capture element preview:', error);
      setElementPreview(null);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleAnimate = () => {
    onAnimate(settings);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      css={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        css={{
          background: '#1F2937',
          borderRadius: '16px',
          padding: '20px',
          width: '450px',
          maxWidth: '90vw',
          border: '1px solid #374151',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #374151',
          }}
        >
          <div>
            <h2
              css={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 4px 0',
              }}
            >
              Animate {elementType}
            </h2>
            <p
              css={{
                fontSize: '14px',
                color: '#9CA3AF',
                margin: 0,
              }}
            >
              {elementName}
            </p>
          </div>
          <button
            css={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              ':hover': {
                background: '#374151',
                color: 'white',
              },
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Preview Section */}
        <div
          css={{
            background: '#111827',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid #374151',
          }}
        >
          <div
            css={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#D1D5DB',
              marginBottom: '12px',
            }}
          >
            Preview
          </div>
          <div
            css={{
              height: '100px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {isCapturing ? (
              <div
                css={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#9CA3AF',
                }}
              >
                <div
                  css={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #9CA3AF',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <span css={{ fontSize: '12px' }}>Capturing...</span>
              </div>
            ) : elementPreview ? (
              <img
                alt="Element Preview"
                css={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '4px',
                }}
                src={elementPreview}
              />
            ) : (
              <div
                css={{
                  fontSize: '32px',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                }}
              >
                {handStyles.find((h) => h.id === settings.handStyle)?.icon || '👆'}
              </div>
            )}
            
            {/* Hand icon overlay when element preview is shown */}
            {elementPreview && (
              <div
                css={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  fontSize: '24px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  padding: '4px',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                }}
              >
                {handStyles.find((h) => h.id === settings.handStyle)?.icon || '👆'}
              </div>
            )}
          </div>
        </div>

        {/* Duration Settings */}
        <div
          css={{
            marginBottom: '16px',
          }}
        >
          <div
            css={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#D1D5DB',
              marginBottom: '12px',
            }}
          >
            Animation Duration
          </div>

          {/* Sketching Duration */}
          <div
            css={{
              marginBottom: '16px',
            }}
          >
            <div
              css={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label
                css={{
                  fontSize: '13px',
                  color: '#9CA3AF',
                }}
              >
                Sketching Duration
              </label>
              <span
                css={{
                  fontSize: '13px',
                  color: '#D1D5DB',
                  fontWeight: '500',
                }}
              >
                {settings.sketchingDuration}s
              </span>
            </div>
            <input
              css={{
                width: '100%',
                height: '6px',
                background: '#374151',
                borderRadius: '3px',
                outline: 'none',
                cursor: 'pointer',
              }}
              max="10"
              min="1"
              type="range"
              value={settings.sketchingDuration}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sketchingDuration: parseInt(e.target.value),
                }))
              }
            />
          </div>

          {/* Color Fill Duration */}
          <div>
            <div
              css={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label
                css={{
                  fontSize: '13px',
                  color: '#9CA3AF',
                }}
              >
                Color Fill Duration
              </label>
              <span
                css={{
                  fontSize: '13px',
                  color: '#D1D5DB',
                  fontWeight: '500',
                }}
              >
                {settings.colorFillDuration}s
              </span>
            </div>
            <input
              css={{
                width: '100%',
                height: '6px',
                background: '#374151',
                borderRadius: '3px',
                outline: 'none',
                cursor: 'pointer',
              }}
              max="10"
              min="0"
              type="range"
              value={settings.colorFillDuration}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  colorFillDuration: parseInt(e.target.value),
                }))
              }
            />
          </div>
        </div>

        {/* Hand Styles */}
        <div
          css={{
            marginBottom: '20px',
          }}
        >
          <div
            css={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#D1D5DB',
              marginBottom: '12px',
            }}
          >
            Hand Style
          </div>
          <div
            css={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
            }}
          >
            {handStyles.map((style) => (
              <button
                key={style.id}
                css={{
                  background:
                    settings.handStyle === style.id ? style.color : '#374151',
                  border: `2px solid ${
                    settings.handStyle === style.id ? style.color : '#4B5563'
                  }`,
                  borderRadius: '8px',
                  padding: '10px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    background:
                      settings.handStyle === style.id ? style.color : '#4B5563',
                    transform: 'translateY(-1px)',
                  },
                }}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, handStyle: style.id }))
                }
              >
                <div
                  css={{
                    fontSize: '20px',
                    filter:
                      settings.handStyle === style.id
                        ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                        : 'none',
                  }}
                >
                  {style.icon}
                </div>
                <div
                  css={{
                    fontSize: '10px',
                    color: 'white',
                    fontWeight: '500',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  }}
                >
                  {style.name}
                </div>
                <div
                  css={{
                    fontSize: '8px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: '400',
                    textAlign: 'center',
                  }}
                >
                  {style.id}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          css={{
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            css={{
              flex: 1,
              background: '#374151',
              border: '1px solid #4B5563',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#D1D5DB',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                background: '#4B5563',
                color: 'white',
              },
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            css={{
              flex: 1,
              background: '#667eea',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                background: '#5A67D8',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              },
            }}
            onClick={handleAnimate}
          >
            Start Animation
          </button>
        </div>

        {/* CSS for loading spinner */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AnimationPopup;
