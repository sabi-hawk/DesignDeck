import LockKeyIcon from '@duyank/icons/regular/LockKey';
import LockKeyOpenIcon from '@duyank/icons/regular/LockKeyOpen';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Popover from '../common/popover/Popover';
import AnimationService from '../editor/AnimationService';
import { useEditor, useSelectedLayers } from '../hooks';
import { RootLayerProps } from '../layers';
import { isRootLayer } from '../ultils/layer/layers';
import SettingButton from './SettingButton';
import LayerSidebar from './sidebar/LayerSidebar';

const CommonSettings = () => {
  const transparencyButtonRef = useRef<HTMLDivElement>(null);
  const resizeButtonRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const [openTransparencySetting, setOpenTransparencySetting] = useState(false);
  const [openResizeSetting, setOpenResizeSetting] = useState(false);
  const [lockSiteAspect, setLockSizeAspect] = useState(false);
  const { selectedLayers, selectedLayerIds } = useSelectedLayers();
  const { actions, activePage, sidebar, pageSize, isPageLocked, animatedLayers } = useEditor(
    (state, query) => ({
      activePage: state.activePage,
      sidebar: state.sidebar,
      pageSize: query.getPageSize(),
      isPageLocked:
        state.pages[state.activePage] &&
        state.pages[state.activePage].layers.ROOT.data.locked,
      animatedLayers: state.animatedLayers[state.activePage] || [],
    })
  );
  const [size, setSize] = useState(pageSize);
  const [animationService] = useState(() => AnimationService.getInstance());
  const [currentAnimatedElement, setCurrentAnimatedElement] = useState<string | null>(null);

  useEffect(() => {
    setSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    // Get the currently animated element
    setCurrentAnimatedElement(animationService.getCurrentAnimatedElement());
  }, [animationService]);

  const { transparency } = useMemo(() => {
    return Object.entries(selectedLayers).reduce(
      (acc, [, layer]) => {
        if (isRootLayer(layer)) {
          acc.transparency = Math.max(
            acc.transparency,
            typeof layer.data.props.image?.transparency !== 'undefined'
              ? layer.data.props.image.transparency
              : 1
          );
        } else {
          acc.transparency = Math.max(
            acc.transparency,
            typeof layer.data.props.transparency !== 'undefined'
              ? layer.data.props.transparency
              : 1
          );
        }
        return acc;
      },
      { transparency: 0 }
    );
  }, [selectedLayers]);

  const isLocked = !!selectedLayers.find((l) => l.data.locked);
  const toggleLock = () => {
    if (isLocked) {
      actions.unlock(activePage, selectedLayerIds);
    } else {
      actions.lock(activePage, selectedLayerIds);
    }
  };

  // Check if any of the selected layers are animated
  const hasAnimatedElements = selectedLayerIds.some(id => 
    animatedLayers.includes(id)
  );

  // Check if we can animate the selected elements
  const canAnimate = selectedLayerIds.length > 0 && 
    (!currentAnimatedElement || selectedLayerIds.includes(currentAnimatedElement));

  // Check if we're trying to animate a different element when one is already animated
  const isTryingToAnimateDifferent = selectedLayerIds.length > 0 && 
    currentAnimatedElement && 
    !selectedLayerIds.includes(currentAnimatedElement);

  const handleAnimateClick = () => {
    if (selectedLayerIds.length > 0) {
      if (hasAnimatedElements) {
        // Unmark as animated
        actions.unmarkLayerAsAnimated(activePage, selectedLayerIds);
        selectedLayerIds.forEach(id => animationService.stopAnimation(id));
        setCurrentAnimatedElement(null);
      } else {
        // Check if we can animate (only one element at a time)
        if (currentAnimatedElement && !selectedLayerIds.includes(currentAnimatedElement)) {
          // Show message that only one element can be animated at a time
          alert('Only one element can be animated at a time. Please stop the current animation first.');
          return;
        }

        // Mark as animated
        actions.markLayerAsAnimated(activePage, selectedLayerIds);
        
        // Start animation for the first selected element
        const elementToAnimate = selectedLayerIds[0];
        if (animationService.startAnimation(elementToAnimate)) {
          setCurrentAnimatedElement(elementToAnimate);
          if ((window as any).showTimeline) {
            (window as any).showTimeline();
          }
        } else {
          // If animation couldn't start, unmark it
          actions.unmarkLayerAsAnimated(activePage, selectedLayerIds);
          alert('Only one element can be animated at a time.');
        }
      }
    }
  };

  const getAnimateButtonText = () => {
    if (selectedLayerIds.length === 0) {
      return 'Animate Element';
    }
    
    if (isTryingToAnimateDifferent) {
      return 'Only One Element Allowed';
    }
    
    if (hasAnimatedElements) {
      return 'Animated';
    }
    
    return 'Animate Element';
  };

  const getAnimateButtonStyle = () => {
    if (selectedLayerIds.length === 0) {
      return {
        background: '#e2e8f0',
        color: '#94a3b8',
        cursor: 'not-allowed',
        ':hover': { background: '#e2e8f0' },
      };
    }
    
    if (isTryingToAnimateDifferent) {
      return {
        background: '#ef4444',
        color: 'white',
        cursor: 'not-allowed',
        ':hover': { background: '#dc2626' },
      };
    }
    
    if (hasAnimatedElements) {
      return {
        background: '#10b981',
        color: 'white',
        cursor: 'pointer',
        ':hover': { background: '#059669' },
      };
    }
    
    return {
      background: '#667eea',
      color: 'white',
      cursor: 'pointer',
      ':hover': { background: '#5a67d8' },
    };
  };

  const updateTransparency = (transparency: number) => {
    selectedLayerIds.forEach((layerId) => {
      if (layerId === 'ROOT') {
        actions.history
          .throttle(2000)
          .setProp<RootLayerProps>(activePage, layerId, {
            image: {
              transparency: transparency / 100,
            },
          });
      } else {
        actions.history.throttle(2000).setProp(activePage, layerId, {
          transparency: transparency / 100,
        });
      }
    });
  };

  useEffect(() => {
    setOpenTransparencySetting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedLayerIds)]);

  const handleChangeSize = (value: string, type: 'width' | 'height') => {
    const ratio = size.width / size.height;
    const v = parseInt(value, 10);
    if (type === 'width') {
      if (lockSiteAspect) {
        (heightRef.current as HTMLInputElement).value = String(
          Math.round((v / ratio) * 10) / 10
        );
      }
      setSize({ ...size, width: v });
    }
    if (type === 'height') {
      if (lockSiteAspect) {
        (widthRef.current as HTMLInputElement).value = String(
          Math.round(v * ratio * 10) / 10
        );
      }
      setSize({ ...size, height: v });
    }
  };

  const isDisabledResize = useMemo(
    () => size.width < 100 || size.height < 100,
    [size]
  );

  const handleResize = () => {
    if (isDisabledResize) return;
    actions.changePageSize(size);
    setOpenResizeSetting(false);
  };

  return (
    <Fragment>
      <div
        css={{
          display: 'grid',
          alignItems: 'center',
          gridAutoFlow: 'column',
          gridGap: 12,
        }}
      >
        <SettingButton onClick={() => actions.setSidebar('LAYER_MANAGEMENT')}>
          <span css={{ padding: '0 4px' }}>Position</span>
        </SettingButton>

        {selectedLayerIds.length > 0 &&
          !isLocked &&
          !isPageLocked &&
          (!isRootLayer(selectedLayers[0]) ||
            (isRootLayer(selectedLayers[0]) &&
              selectedLayers[0].data.props.image)) && (
            <Fragment>
              {/* TODO: Uncomment this */}
              {/* <div
                css={{
                  height: 28,
                  width: `2px`,
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(102, 126, 234, 0.3) 20%, rgba(118, 75, 162, 0.3) 80%, transparent 100%)',
                  borderRadius: '1px',
                }}
              />
              <SettingButton
                ref={transparencyButtonRef}
                css={{ fontSize: 20 }}
                onClick={() => setOpenTransparencySetting(true)}
              >
                <TransparencyIcon />
              </SettingButton>
              <Popover
                anchorEl={transparencyButtonRef.current}
                offsets={{
                  'bottom-end': { x: 0, y: 8 },
                }}
                open={openTransparencySetting}
                placement={'bottom-end'}
                onClose={() => setOpenTransparencySetting(false)}
              >
                <div css={{ padding: 16 }}>
                  <Slider
                    defaultValue={transparency * 100}
                    label={'Transparency'}
                    onChange={updateTransparency}
                  />
                </div>
              </Popover> */}
            </Fragment>
          )}
        {!isPageLocked && (
          <Fragment>
            <div
              css={{
                height: 28,
                width: `2px`,
                background:
                  'linear-gradient(180deg, transparent 0%, rgba(102, 126, 234, 0.3) 20%, rgba(118, 75, 162, 0.3) 80%, transparent 100%)',
                borderRadius: '1px',
              }}
            />
            {/* Uncomment this */}
            <SettingButton
              ref={resizeButtonRef}
              onClick={() => setOpenResizeSetting(true)}
            >
              <span css={{ padding: '0 4px' }}>Resize</span>
            </SettingButton>
          </Fragment>
        )}
        {selectedLayerIds.length > 0 && (
          <SettingButton
            css={{ fontSize: 20 }}
            isActive={isLocked}
            onClick={toggleLock}
          >
            {isLocked && <LockKeyIcon />}
            {!isLocked && <LockKeyOpenIcon />}
          </SettingButton>
        )}
      </div>
      
      {/* Animate Element Button - Right Side */}
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: 'auto',
        }}
      >
        <SettingButton
          css={{
            ...getAnimateButtonStyle(),
            fontWeight: 600,
          }}
          disabled={!canAnimate}
          onClick={handleAnimateClick}
        >
          <span css={{ padding: '0 8px' }}>
            {getAnimateButtonText()}
          </span>
        </SettingButton>
      </div>
      
      {/* Resize Popover */}
      <Popover
        anchorEl={resizeButtonRef.current}
        offsets={{
          'bottom-end': { x: 0, y: 8 },
        }}
        open={openResizeSetting}
        placement={'bottom-end'}
        onClose={() => setOpenResizeSetting(false)}
      >
        <div css={{ padding: 16, width: 240 }}>
          <div css={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div>
              <div css={{ fontSize: 12, fontWeight: 600 }}>Width</div>
              <div
                css={{
                  border: '1px solid rgba(43,59,74,.3)',
                  height: 40,
                  padding: '0 12px',
                  width: 80,
                  borderRadius: 4,
                }}
              >
                <input
                  ref={widthRef}
                  css={{ width: '100%', minWidth: 8, height: '100%' }}
                  defaultValue={size.width}
                  onChange={(e) => handleChangeSize(e.target.value, 'width')}
                />
              </div>
            </div>
            <div>
              <div css={{ fontSize: 12, fontWeight: 600 }}>Height</div>
              <div
                css={{
                  border: '1px solid rgba(43,59,74,.3)',
                  height: 40,
                  padding: '0 12px',
                  width: 80,
                  borderRadius: 4,
                }}
              >
                <input
                  ref={heightRef}
                  css={{ width: '100%', minWidth: 8, height: '100%' }}
                  defaultValue={size.height}
                  onChange={(e) => handleChangeSize(e.target.value, 'height')}
                />
              </div>
            </div>
            <div
              css={{ fontSize: 20, cursor: 'pointer', margin: '10px 0' }}
              onClick={() => setLockSizeAspect(!lockSiteAspect)}
            >
              {lockSiteAspect ? <LockKeyIcon /> : <LockKeyOpenIcon />}
            </div>
          </div>
          {isDisabledResize && (
            <div css={{ color: '#db1436' }}>
              Dimensions must be at least 100px and no more than 8000px.
            </div>
          )}
          <div css={{ marginTop: 12 }}>
            <div
              css={{
                background: !isDisabledResize ? '#3a3a4c' : '#8383A2',
                padding: '8px 14px',
                lineHeight: 1,
                color: '#FFF',
                borderRadius: 4,
                cursor: !isDisabledResize ? 'pointer' : 'not-allowed',
                fontSize: 16,
                textAlign: 'center',
                fontWeight: 700,
              }}
              onClick={handleResize}
            >
              Resize
            </div>
          </div>
        </div>
      </Popover>
      
      {sidebar === 'LAYER_MANAGEMENT' && <LayerSidebar open={true} />}
    </Fragment>
  );
};

export default CommonSettings;
