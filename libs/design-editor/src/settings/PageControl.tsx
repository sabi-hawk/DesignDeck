import CheckIcon from '@duyank/icons/regular/Check';
import React, { useRef, useState } from 'react';
import Popover from '../common/popover/Popover';
import Slider from '../common/slider/Slider';
import { useEditor } from '../hooks';
import SettingButton from './SettingButton';

const PageControl = () => {
  const labelScaleOptionRef = useRef<HTMLDivElement>(null);
  const [openScaleOptions, setOpenScaleOptions] = useState(false);
  const { actions, scale } = useEditor((state) => ({
    scale: state.scale,
  }));

  // Helper function to calculate zoom parameters
  const getZoomParams = () => {
    // Define fixed zoom levels
    // 100% = scale that shows frame area (1920x1080) with padding nicely
    // This is our reference scale - we'll calculate it based on a standard viewport
    const frameWidth = 1920;
    const frameHeight = 1080;
    const padding = 200;
    const targetWidth = frameWidth + padding * 2; // 2320
    const targetHeight = frameHeight + padding * 2; // 1480

    // Define 100% zoom as the scale that fits the frame area in a standard viewport
    // Using a reference viewport size to make 100% consistent
    const referenceViewportWidth = 1400; // Standard desktop width for frame area
    const referenceViewportHeight = 900; // Standard desktop height for frame area

    const maxScale = Math.min(
      referenceViewportWidth / targetWidth,
      referenceViewportHeight / targetHeight
    ); // This will be our 100% zoom level

    const minScale = 0.01; // 0% zoom (very zoomed out)

    return { minScale, maxScale };
  };

  const handleChangeScale = (value: number) => {
    // Convert new 0-100% range to actual scale values
    // 0% = minimum zoom (show most of canvas) - corresponds to old 10%
    // 100% = frame area zoom (1920x1080 + padding fits viewport)
    const { minScale, maxScale } = getZoomParams();
    const actualScale = minScale + (value / 100) * (maxScale - minScale);
    actions.setScale(actualScale);
  };

  const getCurrentPercentage = () => {
    const { minScale, maxScale } = getZoomParams();
    return ((scale - minScale) / (maxScale - minScale)) * 100;
  };
  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontWeight: 700,
      }}
    >
      <div css={{ flexGrow: 1 }}>Canvas (10,000 x 10,000)</div>
      <div
        css={{
          flexShrink: 0,
          display: 'grid',
          gridAutoFlow: 'column',
          gridColumnGap: 8,
          alignItems: 'center',
        }}
      >
        <div css={{ width: 200, paddingRight: 8 }}>
          <Slider
            hideInput={true}
            hideLabel={true}
            max={100}
            min={0}
            value={getCurrentPercentage()}
            onChange={handleChangeScale}
          />
        </div>
        <SettingButton
          ref={labelScaleOptionRef}
          onClick={() => setOpenScaleOptions(true)}
        >
          <div css={{ width: 48, textAlign: 'center' }}>
            {Math.round(getCurrentPercentage())}%
          </div>
        </SettingButton>
        <Popover
          anchorEl={labelScaleOptionRef.current}
          open={openScaleOptions}
          placement={'top-end'}
          onClose={() => setOpenScaleOptions(false)}
        >
          <div css={{ padding: '8px 0' }}>
            {[100, 75, 50, 25, 10].map((s) => (
              <div
                key={s}
                css={{
                  padding: '0 8px',
                  display: 'flex',
                  height: 40,
                  minWidth: 100,
                  alignItems: 'center',
                  cursor: 'pointer',
                  ':hover': {
                    backgroundColor: 'rgba(64,87,109,.07)',
                  },
                }}
                onClick={() => {
                  const { minScale, maxScale } = getZoomParams();
                  const actualScale =
                    minScale + (s / 100) * (maxScale - minScale);
                  actions.setScale(actualScale);
                  setOpenScaleOptions(false);
                }}
              >
                <span
                  css={{ padding: '0 8px', whiteSpace: 'nowrap', flexGrow: 1 }}
                >
                  {s}%
                </span>
                {Math.abs(getCurrentPercentage() - s) < 1 && <CheckIcon />}
              </div>
            ))}
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default PageControl;
