import { FontData } from '@lidojs/design-core';
import { Editor, GetFontQuery, PageControl, AnimationPopup, AnimationSettings, AnimationService } from '@lidojs/design-editor';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AppLayerSettings from './layout/AppLayerSettings';
import HeaderLayout from './layout/HeaderLayout';
import Sidebar from './layout/Sidebar';
import EditorContent from './pages/EditorContent';
import PreviewModal from './PreviewModal';
import { User } from '@lidojs/design-editor';
import { SaveButton } from '@lidojs/design-editor';
import { projectService } from '@lidojs/design-editor';

const Test = ({ googleFontList, user, onLogout }: { 
  googleFontList: FontData[]; 
  user: User; 
  onLogout: () => void; 
}) => {
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [showAnimationPopup, setShowAnimationPopup] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<string>('Element');
  const [selectedElementName, setSelectedElementName] = useState<string>('Selected Element');
  const [animationService] = useState(() => AnimationService.getInstance());
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>();
  const [canvasData, setCanvasData] = useState<any>(null);

  // Debug state changes
  useEffect(() => {
    console.log('🔍 Test component state changed:', {
      showAnimationPopup,
      selectedElementId,
      selectedElementType,
      selectedElementName
    });
  }, [showAnimationPopup, selectedElementId, selectedElementType, selectedElementName]);

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

  const handleShowAnimationPopup = (elementId: string, elementType: string, elementName: string) => {
    console.log('🎬 handleShowAnimationPopup called with:', { elementId, elementType, elementName });
    setSelectedElementId(elementId);
    setSelectedElementType(elementType);
    setSelectedElementName(elementName);
    setShowAnimationPopup(true);
    console.log('🎬 State updated, showAnimationPopup set to true');
  };

  const handleAnimateWithSettings = (settings: AnimationSettings) => {
    if (selectedElementId) {
      try {
        console.log(`🎬 Starting animation for element ${selectedElementId} with settings:`, settings);
        
        // Start animation with settings
        const success = animationService.startAnimation(selectedElementId, settings);
        
        if (success) {
          if ((window as any).showTimeline) {
            (window as any).showTimeline();
          }
          console.log(`✅ Animation started successfully for element ${selectedElementId}`);
        } else {
          alert('Failed to start animation for selected element.');
        }
      } catch (error) {
        console.error('Error starting animation with settings:', error);
        alert('An error occurred while starting animation.');
      }
    }
  };

  // Save project
  const handleSave = (projectId?: string) => {
    setCurrentProjectId(projectId);
    console.log('Project saved with ID:', projectId);
  };

  // Load project
  const handleLoad = async (projectId: string) => {
    try {
      const project = await projectService.getProject(projectId);
      setCurrentProjectId(projectId);
      setCanvasData(project.canvasData);
      console.log('Project loaded:', project);
      // Here you would restore the canvas state
      // This would need to be integrated with the Editor component
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project');
    }
  };

  // Get current canvas data (this would be called when saving)
  const getCurrentCanvasData = () => {
    // This would need to be implemented to get the current state from the Editor
    // For now, return a placeholder
    return {
      pages: [],
      selectedPageId: null,
      // Add other canvas state here
    };
  };

  return (
    <Editor config={config} getFonts={getFonts} uploadImage={uploadImage}>
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          height: '100vh',
          maxHeight: viewPortHeight ? `${viewPortHeight}px` : 'auto',
        }}
      >
        <HeaderLayout 
          openPreview={() => setOpenPreview(true)}
          user={user}
          onLogout={onLogout}
          onSave={handleSave}
          onLoad={handleLoad}
          currentProjectId={currentProjectId}
          canvasData={canvasData || getCurrentCanvasData()}
        />
        {openPreview && <PreviewModal onClose={() => setOpenPreview(false)} />}
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
            <AppLayerSettings onShowAnimationPopup={handleShowAnimationPopup} />
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
  );
};

export default Test;
