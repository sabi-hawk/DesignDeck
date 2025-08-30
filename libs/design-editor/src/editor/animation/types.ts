export interface AnimationSettings {
  sketchingDuration: number;
  colorFillDuration: number;
  handStyle: string;
}

export interface AnimationFrame {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  elementId: string;
  frameIndex: number; // Which timeline frame this belongs to
  settings: AnimationSettings; // Animation configuration settings
  isInsideFrame?: boolean; // Whether this element was animated as part of a SimpleFrame
  parentFrameId?: string; // The ID of the SimpleFrame that contains this element
  parentFrameBorderColor?: string; // The border color of the parent frame
  fileId?: string; // ID of the file uploaded to speedpaint.co
  resultUrl?: string; // URL of the processed video when ready
  progress?: number; // Processing progress percentage (0-100)
}

export interface AnimatedElement {
  id: string;
  frameIndex: number; // Reserved timeline frame position
  startTime: number;
  lastCaptureTime: number;
  settings: AnimationSettings; // Animation configuration settings
  parentFrameId?: string; // The ID of the SimpleFrame that contains this element (if any)
}

export interface FrameData {
  id: string;
  name: string;
  type: string;
  props: any;
  position: any;
  boxSize: any;
  color: string;
}

export interface DOMPosition {
  frameRect: DOMRect;
  css19b3lheRect: DOMRect;
  containerRect: DOMRect;
  relativeLeft: number;
  relativeTop: number;
  borderColor: string;
  parentContainer: Element;
  frameElement: Element;
  css19b3lheDiv: Element;
}

export interface ElementCoordinates {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface HandStyle {
  id: string;
  name: string;
  icon: string;
  color: string;
}
