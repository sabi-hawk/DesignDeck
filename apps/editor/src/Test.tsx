import { FontData } from '@lidojs/design-core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  Editor,
  GetFontQuery,
  PageControl,
  AnimationPopup,
  AnimationSettings,
  AnimationService,
} from '@lidojs/design-editor';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import EditorStateLoader from './components/EditorStateLoader';
import { useAuth } from './contexts/AuthContext';
import { useProgress } from './contexts/ProgressContext';
import { SidebarProvider } from './contexts/SidebarContext';
import AppLayerSettings from './layout/AppLayerSettings';
import HeaderLayout from './layout/HeaderLayout';
import Sidebar from './layout/Sidebar';
import EditorContent from './pages/EditorContent';
import PreviewModal from './PreviewModal';

const Test = ({ googleFontList }: { googleFontList: FontData[] }) => {
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [showAnimationPopup, setShowAnimationPopup] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [selectedElementType, setSelectedElementType] =
    useState<string>('Element');
  const [selectedElementName, setSelectedElementName] =
    useState<string>('Selected Element');
  const [animationService] = useState(() => AnimationService.getInstance());
  const { loadLatestProject, hasLoadedInitial, resetLoadState } = useProgress();
  const { user } = useAuth();
  const [loadedEditorState, setLoadedEditorState] = useState<any>(null);
  const [loadedAnimationState, setLoadedAnimationState] = useState<any>(null);

  // Auto-load latest project on component mount (only once)
  useEffect(() => {
    const loadProject = async () => {
      if (!hasLoadedInitial) {
        const result = await loadLatestProject();
        if (result.success && result.project) {
          console.log('📦 Project loaded from API:', result.project);
          console.log('📊 Editor state from DB:', result.project.canvasData);
          console.log(
            '🎬 Animation state from DB:',
            result.project.animationState
          );

          // The canvasData from DB is actually the complete editor state
          if (result.project.canvasData) {
            setLoadedEditorState(result.project.canvasData);
            console.log('✅ Editor state ready to be restored');
          } else {
            console.warn('⚠️ No editor state found');
          }

          // Store animation state for restoration
          if (result.project.animationState) {
            setLoadedAnimationState(result.project.animationState);
            console.log('✅ Animation state ready to be restored');
          } else {
            console.log('ℹ️ No animation state found');
          }
        } else {
          console.log('ℹ️ No project to load, starting with blank canvas');
        }
      }
    };
    loadProject();
  }, [loadLatestProject, hasLoadedInitial]);

  // Watch for user login/logout and trigger project loading
  useEffect(() => {
    if (user) {
      // User just logged in, reset the load state and trigger loading
      console.log(
        '👤 User logged in, resetting load state and loading project'
      );
      resetLoadState();
      // The loadProject will trigger automatically via the first useEffect when hasLoadedInitial becomes false
    } else {
      // User logged out, clear the loaded state
      console.log('👤 User logged out, clearing loaded state');
      setLoadedEditorState(null);
      setLoadedAnimationState(null);
      resetLoadState();
    }
  }, [user, resetLoadState]);

  // Debug state changes
  useEffect(() => {
    console.log('🔍 Test component state changed:', {
      showAnimationPopup,
      selectedElementId,
      selectedElementType,
      selectedElementName,
    });
  }, [
    showAnimationPopup,
    selectedElementId,
    selectedElementType,
    selectedElementName,
  ]);

  const getFonts = useCallback(
    async (query: GetFontQuery) => {
      return googleFontList
        .filter((i) => !query.q || i.name.toLowerCase().includes(query.q))
        .slice(
          parseInt(query.offset, 10),
          parseInt(query.offset, 10) + parseInt(query.limit, 10)
        );
    },
    [googleFontList]
  );
  const [viewPortHeight, setViewPortHeight] = useState<number>();
  useEffect(() => {
    const windowHeight = () => {
      setViewPortHeight(window.innerHeight);
    };
    window.addEventListener('resize', windowHeight);
    windowHeight();
    return () => {
      window.removeEventListener('resize', windowHeight);
    };
  }, []);
  const config = useMemo(
    () => ({
      assetPath: './assets',
      frame: {
        defaultImage: {
          url: `./assets/images/frame-placeholder.png`,
          width: 1200,
          height: 800,
        },
      },
    }),
    []
  );

  const uploadImage = async (file: File) => {
    // TODO: to integrate with image manipulation then need update this
    return new Promise<{ url: string; thumb: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve({
          url: reader.result as string,
          thumb: reader.result as string,
        });
      };
      reader.onerror = reject;
    });
  };

  const handleShowAnimationPopup = (
    elementId: string,
    elementType: string,
    elementName: string
  ) => {
    console.log('🎬 handleShowAnimationPopup called with:', {
      elementId,
      elementType,
      elementName,
    });
    setSelectedElementId(elementId);
    setSelectedElementType(elementType);
    setSelectedElementName(elementName);
    setShowAnimationPopup(true);
    console.log('🎬 State updated, showAnimationPopup set to true');
  };

  const handleAnimateWithSettings = (settings: AnimationSettings) => {
    if (selectedElementId) {
      try {
        console.log(
          `🎬 Starting animation for element ${selectedElementId} with settings:`,
          settings
        );

        // Start animation with settings
        const success = animationService.startAnimation(
          selectedElementId,
          settings
        );

        if (success) {
          if ((window as any).showTimeline) {
            (window as any).showTimeline();
          }
          console.log(
            `✅ Animation started successfully for element ${selectedElementId}`
          );
        } else {
          alert('Failed to start animation for selected element.');
        }
      } catch (error) {
        console.error('Error starting animation with settings:', error);
        alert('An error occurred while starting animation.');
      }
    }
  };

  return (
    <SidebarProvider>
      <Editor config={config} getFonts={getFonts} uploadImage={uploadImage}>
        {/* Load editor state and animation state if available */}
        {loadedEditorState && (
          <EditorStateLoader
            animationState={loadedAnimationState}
            editorState={loadedEditorState}
          />
        )}

        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            width: '100vw',
            height: '100vh',
            maxHeight: viewPortHeight ? `${viewPortHeight}px` : 'auto',
          }}
        >
          <HeaderLayout openPreview={() => setOpenPreview(true)} />
          {openPreview && (
            <PreviewModal onClose={() => setOpenPreview(false)} />
          )}
          <div
            css={{
              display: 'flex',
              flexDirection: 'row',
              flex: 'auto',
              overflow: 'auto',
              background: '#EBECF0',
              '@media (max-width: 900px)': {
                flexDirection: 'column-reverse',
              },
            }}
          >
            <div
              ref={leftSidebarRef}
              css={{
                display: 'flex',
                background: 'white',
              }}
            >
              <Sidebar />
            </div>
            <div
              css={{
                flexGrow: 1,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
              }}
            >
              <AppLayerSettings
                onShowAnimationPopup={handleShowAnimationPopup}
              />
              <div
                css={{
                  flexGrow: 1,
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <EditorContent />
              </div>
              <div
                css={{
                  height: 40,
                  background: '#fff',
                  borderTop: '1px solid rgba(57,76,96,.15)',
                  display: 'grid',
                  alignItems: 'center',
                  flexShrink: 0,
                  '@media (max-width: 900px)': {
                    display: 'none',
                  },
                }}
              >
                <PageControl />
              </div>
            </div>
          </div>
        </div>

        {/* Animation Popup */}
        <AnimationPopup
          elementId={selectedElementId}
          elementName={selectedElementName}
          elementType={selectedElementType}
          isVisible={showAnimationPopup}
          onAnimate={handleAnimateWithSettings}
          onClose={() => setShowAnimationPopup(false)}
        />
      </Editor>
    </SidebarProvider>
  );
};

export default Test;
