import { AnimationFrame } from '../../animation';

export interface ParentFrameGroupInfo {
  parentFrameId: string;
  groupFrames: { frameIndex: number; frame: AnimationFrame }[];
  isFirst: boolean;
  isLast: boolean;
  isMiddle: boolean;
}

export const getFramesByParentFrame = (
  framesByIndex: Map<number, AnimationFrame[]>
): Map<string, { frameIndex: number; frame: AnimationFrame }[]> => {
  const framesByParent = new Map<string, { frameIndex: number; frame: AnimationFrame }[]>();
  
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

export const getParentFrameGroupMapping = (
  framesByParent: Map<string, { frameIndex: number; frame: AnimationFrame }[]>
): Map<number, ParentFrameGroupInfo | null> => {
  const mapping = new Map<number, ParentFrameGroupInfo | null>();
  
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

export const getParentFrameGroupInfo = (
  segmentIndex: number,
  mapping: Map<number, ParentFrameGroupInfo | null>
): ParentFrameGroupInfo | null => {
  return mapping.get(segmentIndex) || null;
};

export const getSceneNumber = (
  parentFrameId: string,
  pages: any[]
): number => {
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
    const framesByParent = getFramesByParentFrame(new Map());
    const parentFrameIds = Array.from(framesByParent.keys()).sort();
    return parentFrameIds.indexOf(parentFrameId) + 1;
  } catch (error) {
    console.error('Error getting scene number for timeline:', error);
    return 1;
  }
};

export const hasCompletedAnimation = (
  parentFrameId: string,
  framesByParent: Map<string, { frameIndex: number; frame: AnimationFrame }[]>
): boolean => {
  try {
    const sceneFrames = framesByParent.get(parentFrameId);
    
    if (!sceneFrames || sceneFrames.length === 0) {
      return false;
    }

    // Check if any frame in this scene has a resultUrl
    return sceneFrames.some(({ frame }) => frame.resultUrl && frame.resultUrl.trim() !== '');
  } catch (error) {
    console.error(`Error checking completed animation for scene ${parentFrameId}:`, error);
    return false;
  }
};

export const isFirstInParentFrameGroup = (
  segmentIndex: number,
  mapping: Map<number, ParentFrameGroupInfo | null>
): boolean => {
  const group = mapping.get(segmentIndex);
  if (!group) return false;
  
  return group.isFirst;
};

export const isLastInParentFrameGroup = (
  segmentIndex: number,
  mapping: Map<number, ParentFrameGroupInfo | null>
): boolean => {
  const group = mapping.get(segmentIndex);
  if (!group) return false;
  
  return group.isLast;
};

export const getAnimatedSegments = (
  framesByIndex: Map<number, AnimationFrame[]>
): { segmentIndex: number; frame: AnimationFrame }[] => {
  const segments: { segmentIndex: number; frame: AnimationFrame }[] = [];
  
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
