import { AnimationFrame, AnimationSettings, ElementCoordinates } from './types';
import { dataURLToFile } from './utils';

// Mock mode flag - set to true to bypass actual API calls for testing
const MOCK_MODE = true;

// Mock video URL for testing
const MOCK_VIDEO_URL = 'https://speedpaint.co/sketchly/test@example.com/outputs/65f9c6e3d91612a4c934f1d4a7713604.webm';

/**
 * Submit a frame to the API for processing
 */
export const submitFrameToAPI = async (
  frame: AnimationFrame,
  elementId: string,
  elementData: ElementCoordinates,
  settings: AnimationSettings
): Promise<string | null> => {
  try {
    // Mock mode: return fake file ID immediately
    if (MOCK_MODE) {
      console.log(`🧪 Mock mode: Simulating API submission for frame ${frame.id}`);
      
      // Simulate a small delay to mimic real API behavior
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return a mock file ID
      const mockFileId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`🧪 Mock mode: Generated file ID: ${mockFileId}`);
      
      return mockFileId;
    }

    console.log(`🚀 Submitting frame ${frame.id} to API for processing...`);

    // Convert image data URL to file
    const imageFile = await dataURLToFile(frame.imageDataUrl, `element-${elementId}.png`);

    // Create form data
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('hand', settings.handStyle);
    formData.append('sketch_duration', settings.sketchingDuration.toString());
    formData.append('color_duration', settings.colorFillDuration.toString());
    formData.append('email', 'test@example.com'); // Test email
    formData.append('frame_width', '1920'); // Frame width
    formData.append('frame_length', '1080'); // Frame height
    formData.append('center_x', elementData.centerX.toString());
    formData.append('center_y', elementData.centerY.toString());
    formData.append('element_width', elementData.width.toString());
    formData.append('element_length', elementData.height.toString());

    // Submit to API
    const response = await fetch('https://speedpaint.co/api/submit', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Frame submitted successfully:`, result);

    // Return the file_id for later use
    if (result.file_id) {
      console.log(`📁 File ID stored: ${result.file_id}`);
      return result.file_id;
    }

    return null;

  } catch (error) {
    console.error(`❌ Error submitting frame to API:`, error);
    return null;
  }
};

/**
 * Poll for result from the API
 */
export const pollForResult = (
  fileId: string,
  onSuccess: (resultUrl: string) => void,
  onProgress: (progress: number) => void,
  onFailure: () => void
): void => {
  // Mock mode: return mock video URL immediately
  if (MOCK_MODE) {
    console.log(`🧪 Mock mode: Simulating immediate success for file ${fileId}`);
    
    // Simulate progress updates quickly
    setTimeout(() => onProgress(25), 100);
    setTimeout(() => onProgress(50), 200);
    setTimeout(() => onProgress(75), 300);
    setTimeout(() => onProgress(100), 400);
    
    // Return success after a brief delay
    setTimeout(() => {
      console.log(`🧪 Mock mode: Returning mock video URL: ${MOCK_VIDEO_URL}`);
      onSuccess(MOCK_VIDEO_URL);
    }, 500);
    
    return;
  }

  const maxAttempts = 60; // 10 minutes max (60 * 10 seconds)
  let attempts = 0;
  
  const pollInterval = setInterval(async () => {
    try {
      attempts++;
      console.log(`🔄 Polling for result (attempt ${attempts}/${maxAttempts}) for file ${fileId}`);
      
      const response = await fetch(`https://speedpaint.co/api/result?file_id=${fileId}`);
      
      if (!response.ok) {
        throw new Error(`Result API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`📊 Poll result for ${fileId}:`, result);
      
      if (result.status === 'success' && result.result_url) {
        console.log(`🎉 Video ready for ${fileId}: ${result.result_url}`);
        
        // Stop polling
        clearInterval(pollInterval);
        
        // Call success callback
        onSuccess(result.result_url);
        
      } else if (result.status === 'pending') {
        console.log(`⏳ Still processing ${fileId}: ${result.progress}% - ${result.message}`);
        
        // Update progress if available
        if (result.progress !== undefined) {
          onProgress(result.progress);
        }
        
      } else {
        console.warn(`⚠️ Unexpected status for ${fileId}:`, result);
      }
      
      // Stop polling if max attempts reached
      if (attempts >= maxAttempts) {
        console.warn(`⏰ Max polling attempts reached for ${fileId}`);
        clearInterval(pollInterval);
        onFailure();
      }
      
    } catch (error) {
      console.error(`❌ Error polling for result ${fileId}:`, error);
      attempts++;
      
      // Stop polling if too many errors
      if (attempts >= maxAttempts) {
        console.warn(`⏰ Max polling attempts reached due to errors for ${fileId}`);
        clearInterval(pollInterval);
        onFailure();
      }
    }
  }, 10000); // Poll every 10 seconds
};
