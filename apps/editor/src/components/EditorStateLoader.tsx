import { useEditor, AnimationService } from '@lidojs/design-editor';
import { useCallback, useEffect, useRef } from 'react';

interface EditorStateLoaderProps {
  editorState: any;
  animationState?: any;
}

const EditorStateLoader: React.FC<EditorStateLoaderProps> = ({ editorState, animationState }) => {
  const { actions, query } = useEditor();
  const hasLoaded = useRef(false);
  const animationService = AnimationService.getInstance();

  // Helper function to get original ID from any layer
  const getOriginalId = (layerId: string, pageIndex = 0): string | null => {
    try {
      const layer = query.getLayer(pageIndex, layerId);
      if (layer && layer._originalId) {
        return layer._originalId;
      }
    } catch (error) {
      console.warn(`Could not get original ID for layer ${layerId}:`, error);
    }
    return null;
  };

  // Helper function to find layer by original ID
  const findLayerByOriginalId = (originalId: string, pageIndex = 0): string | null => {
    try {
      const layers = query.getLayers(pageIndex);
      for (const [layerId, layer] of Object.entries(layers)) {
        if (layerId !== 'ROOT' && layer._originalId === originalId) {
          return layerId;
        }
      }
    } catch (error) {
      console.warn(`Could not find layer by original ID ${originalId}:`, error);
    }
    return null;
  };

  // Function to recreate layers using editor actions
  const recreateLayersFromData = useCallback(async (pages: any[]) => {
    console.log('🔄 Recreating layers from scratch using editor actions...');
    
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      console.log(`📄 Processing page ${pageIndex}:`, page);
      
      if (page.layers) {
        // Clear existing layers except ROOT
        const currentLayers = query.getLayers(pageIndex);
        const layerIds = Object.keys(currentLayers).filter(id => id !== 'ROOT');
        
        if (layerIds.length > 0) {
          actions.deleteLayer(pageIndex, layerIds);
          console.log('✅ Cleared existing layers');
        }
        
        // Create ID mapping to track original -> new ID relationships
        const idMapping: Record<string, string> = {};
        
        // First, set up the root layer properties
        const rootLayer = page.layers.ROOT;
        if (rootLayer && rootLayer.data) {
          const rootProps = rootLayer.data.props;
          if (rootProps) {
            actions.setProp(pageIndex, 'ROOT', {
              boxSize: rootProps.boxSize,
              position: rootProps.position,
              rotate: rootProps.rotate
            });
            console.log('✅ Root layer properties set');
          }
        }
        
        // Process child layers in the correct order
        const childLayerIds = rootLayer?.data?.child || [];
        console.log('👶 Rebuilding child layers:', childLayerIds);
        
        for (const originalLayerId of childLayerIds) {
          const layer = page.layers[originalLayerId];
          if (layer && layer.data) {
            const layerData = layer.data;
            const layerProps = layerData.props;
            const layerType = layerData.type; // This is still a string from the backend

            console.log(`🔧 Rebuilding layer ${originalLayerId} of type ${layerType}:`, layerData);
            
            try {
              // Create layer based on type
              if (layerType === 'SimpleFrame') {
                console.log(`🔧 Creating SimpleFrame layer for original ID: ${originalLayerId}`);
                
                // Create the layer
                actions.addSimpleFrameLayer(
                  'ROOT',
                  originalLayerId,
                  layerData.props
                );
                
              } else if (layerType === 'Image') {
                if (layerProps.image) {
                  console.log(`🔧 Creating Image layer for original ID: ${originalLayerId}`);
                  
                  // Create the layer
                  actions.addImageLayer(
                    {
                      url: layerProps.image.url,
                      thumb: layerProps.image.thumb,
                      // styles: {...layerProps.image, _originalId: originalLayerId},
                      _originalId: originalLayerId,
                      position: layerProps.position,
                    },
                    layerProps.boxSize,
                    'ROOT',
                    true
                  );
                  
                                   
                 
                }
              } else if (layerType === 'Text') {
                // For text layers, we need to create a text layer with the HTML content
                console.log(`🔧 Creating Text layer for original ID: ${originalLayerId}`);
                
                // Create the text layer
                actions.addTextLayer({
                  layers: {
                    [originalLayerId]: {
                      // Use originalLayerId here
                      type: { resolvedName: 'TextLayer' }, // Ensure resolvedName format
                      props: {
                        text: layerProps.text,
                        position: layerProps.position,
                        boxSize: layerProps.boxSize,
                        rotate: layerProps.rotate,
                        scale: layerProps.scale,
                        fonts: layerProps.fonts,
                        colors: layerProps.colors,
                        fontSizes: layerProps.fontSizes,
                      },
                      locked: layerData.locked,
                      parent: 'ROOT',
                      child: [],
                    },
                  },
                  rootId: originalLayerId, // Use originalLayerId as rootId for this subtree
                  position: layerProps.position,
                  _originalId: originalLayerId,
                });
                
                
              }
            } catch (error) {
              console.error(`❌ Error recreating layer ${originalLayerId}:`, error);
            }
          }
        }
        
        // Log the complete ID mapping
        console.log('📋 ID Mapping (Original -> New):', idMapping);
        
        // Log all layers with their _originalId properties for verification
        const allLayers = query.getLayers(pageIndex);
        console.log('🔍 All layers with _originalId properties:');
        Object.entries(allLayers).forEach(([layerId, layer]: [string, any]) => {
          if (layerId !== 'ROOT') {
            console.log(`  ${layerId}: _originalId = ${layer._originalId}`);
          }
        });
        
        // Demonstrate helper functions
        console.log('🛠️ Helper function examples:');
        Object.keys(allLayers).forEach(layerId => {
          if (layerId !== 'ROOT') {
            const originalId = getOriginalId(layerId, pageIndex);
            if (originalId) {
              console.log(`  getOriginalId("${layerId}") = "${originalId}"`);
              const foundLayerId = findLayerByOriginalId(originalId, pageIndex);
              console.log(`  findLayerByOriginalId("${originalId}") = "${foundLayerId}"`);
            }
          }
        });
        
        console.log(`✅ Page ${pageIndex} rebuilt successfully`);
      }
    }
  }, [actions, query, getOriginalId, findLayerByOriginalId]);

  useEffect(() => {
    if (editorState && !hasLoaded.current) {
      console.log('🔄 Restoring complete editor state...');
      console.log('📦 Editor state to restore:', editorState);
      
      const restoreState = async () => {
        try {
          // First, restore basic editor state
          if (editorState.scale !== undefined) {
            actions.setScale(editorState.scale);
            console.log('✅ Scale restored:', editorState.scale);
          }
          
          if (editorState.activePage !== undefined) {
            actions.setActivePage(editorState.activePage);
            console.log('✅ Active page restored:', editorState.activePage);
          }
          
          // Recreate layers from scratch using editor actions
          if (editorState.pages) {
            await recreateLayersFromData(editorState.pages);
            console.log('✅ Pages and layers recreated from scratch');
          }
          
          // Restore other state properties
          if (editorState.selectedLayers) {
            // Restore selected layers for each page
            Object.entries(editorState.selectedLayers).forEach(([pageIndex, layerIds]) => {
              if (Array.isArray(layerIds) && layerIds.length > 0) {
                actions.selectLayers(parseInt(pageIndex), layerIds);
              }
            });
            console.log('✅ Selected layers restored');
          }
          
          if (editorState.hoveredLayer) {
            // Restore hovered layer for each page
            Object.entries(editorState.hoveredLayer).forEach(([pageIndex, layerId]) => {
              actions.hoverLayer(parseInt(pageIndex), layerId as string | null);
            });
            console.log('✅ Hovered layer restored');
          }
          
          if (editorState.animatedLayers) {
            // Restore animated layers if there's a method for it
            if (typeof (actions as any).setAnimatedLayers === 'function') {
              (actions as any).setAnimatedLayers(editorState.animatedLayers);
              console.log('✅ Animated layers restored');
            }
          }
          
          if (editorState.sidebar !== undefined) {
            actions.setSidebar(editorState.sidebar);
            console.log('✅ Sidebar restored:', editorState.sidebar);
          }
          
          if (editorState.controlBox) {
            actions.setControlBox(editorState.controlBox);
            console.log('✅ Control box restored');
          }
          
          if (editorState.guideline) {
            actions.setGuideline(editorState.guideline);
            console.log('✅ Guidelines restored');
          }
          
          console.log('✅ Complete editor state restored successfully');
          
          // Restore animation state AFTER editor state is restored
          if (animationState) {
            console.log('🎬 Restoring animation state...');
            
            // Update pages data in animation service first
            if (editorState.pages) {
              animationService.updatePagesData(editorState.pages);
              console.log('✅ Updated pages data in AnimationService');
            }
            
            // Import the animation state
            const success = animationService.importAnimationState(animationState);
            if (success) {
              console.log('✅ Animation state restored successfully');
              
              const animatedElements = animationService.getAllAnimatedElements();
              console.log(`🔄 Restoring visual indicators for ${animatedElements.length} animated elements`);
              
              // Wait a bit for DOM elements to be rendered, then restore visual indicators
              // This ensures all layer elements are in the DOM before we add icons/numbers
              setTimeout(() => {
                console.log('⏰ DOM should be ready, restoring visual indicators now...');
                animationService.restoreVisualIndicators();
                console.log('✅ All visual indicators (lock icons, animation numbers, play buttons) restored');
              }, 500); // 500ms delay to ensure DOM is fully rendered
            } else {
              console.warn('⚠️ Failed to restore animation state');
            }
          } else {
            console.log('ℹ️ No animation state to restore');
          }
          
          hasLoaded.current = true;
        } catch (error) {
          console.error('❌ Error restoring editor state:', error);
        }
      };
      
      restoreState();
    }
  }, [editorState, animationState, actions, recreateLayersFromData, animationService]);

  return null; // This component doesn't render anything
};

export default EditorStateLoader;
