# Upload Feature Implementation Guide

## Overview
This guide documents the implementation of persistent file upload functionality in DesignDeck. Users can now upload images, videos, and audio files that are saved to the backend and persist across sessions.

## Features Implemented

### Backend
1. **Media Model** (`server/models/Media.js`)
   - Stores file metadata in MongoDB
   - Tracks user ownership, file type, dimensions, and more

2. **File Upload System**
   - Uses Multer for handling multipart/form-data
   - Supports images (JPG, PNG, GIF, SVG, WebP), videos (MP4, WebM, OGG), and audio (MP3, WAV, M4A)
   - Maximum file size: 50MB
   - Files stored in `server/uploads/` directory

3. **API Endpoints** (`server/routes/media.js`, `server/controllers/mediaController.js`)
   - `POST /api/media/upload` - Upload new media file
   - `GET /api/media` - Fetch user's uploaded media (paginated)
   - `DELETE /api/media/:id` - Delete media file

### Frontend
1. **Enhanced Upload Panel** (`apps/editor/src/layout/sidebar/UploadContent.tsx`)
   - Uploads files to backend when user is logged in
   - Falls back to local storage for guest users
   - Automatically loads user's media on component mount
   - Shows upload progress indicator
   - Supports multiple file types with appropriate preview icons

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install multer@^1.4.5-lts.1
```

### 2. Create Uploads Directory
The uploads directory is automatically created when the server starts, but you can manually create it:

```bash
cd server
mkdir uploads
```

### 3. Start the Backend Server

```bash
cd server
npm run dev
```

The server should start on `http://localhost:3001`

### 4. Start the Frontend

```bash
# From project root
npm start
# or
nx serve editor
```

## Testing the Feature

### Test Case 1: Upload as Logged-In User
1. Start both backend and frontend servers
2. Navigate to `http://localhost:4200`
3. Sign in with your account
4. Click on "Upload" in the left sidebar
5. Click the "Upload" button
6. Select an image, video, or audio file
7. File should upload and appear in the panel
8. Refresh the page - uploaded files should persist

### Test Case 2: Upload as Guest User
1. Use the app without logging in
2. Upload files - they'll be stored in browser memory
3. Files will be lost on page refresh (expected behavior)

### Test Case 3: Multiple File Types
1. Upload different file types:
   - Images: .jpg, .png, .gif, .svg, .webp
   - Videos: .mp4, .webm, .ogg
   - Audio: .mp3, .wav, .m4a
2. Verify each type displays correctly in the panel

### Test Case 4: Persistence Across Sessions
1. Upload several files while logged in
2. Log out
3. Log back in
4. Open the Upload panel - all previous uploads should be visible

### Test Case 5: File Size Limit
1. Try uploading a file larger than 50MB
2. Should receive an error message

## API Usage Examples

### Upload a File
```javascript
const formData = new FormData();
formData.append('file', fileObject);

const response = await axios.post('http://localhost:3001/api/media/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
});
```

### Get User's Media
```javascript
const response = await axios.get('http://localhost:3001/api/media?page=1&limit=50', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Delete Media
```javascript
const response = await axios.delete(`http://localhost:3001/api/media/${mediaId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## File Structure Changes

### New Files
- `server/models/Media.js` - Media database model
- `server/routes/media.js` - Media API routes
- `server/controllers/mediaController.js` - Media business logic
- `server/uploads/.gitignore` - Prevents committing uploaded files

### Modified Files
- `server/package.json` - Added multer dependency
- `server/server.js` - Added media routes and static file serving
- `apps/editor/src/layout/sidebar/UploadContent.tsx` - Enhanced with backend integration

## Security Considerations

1. **Authentication Required**: All media operations require valid JWT token
2. **User Isolation**: Users can only access their own uploaded files
3. **File Type Validation**: Only allowed file types can be uploaded
4. **File Size Limit**: 50MB maximum to prevent abuse
5. **Unique Filenames**: Files are renamed with timestamps to prevent collisions

## Future Enhancements

Potential improvements for the future:
1. Add ability to delete files from the UI
2. Implement drag-and-drop upload
3. Add upload progress bar with percentage
4. Support batch/multiple file uploads
5. Add file search/filter functionality
6. Implement image optimization/compression
7. Add cloud storage integration (AWS S3, Cloudinary)
8. Add file sharing between users

## Troubleshooting

### Issue: Files not uploading
- Check backend server is running on port 3001
- Verify user is logged in (check localStorage for token)
- Check browser console for error messages

### Issue: Uploaded files not appearing
- Verify MongoDB connection is working
- Check server console for errors
- Try refreshing the page

### Issue: Large files failing
- Check file size is under 50MB limit
- Verify sufficient disk space on server
- Check server memory limits

### Issue: CORS errors
- Verify frontend is running on allowed origin (localhost:4200 or localhost:3000)
- Check CORS configuration in `server/server.js`

## Notes

- The uploads directory is gitignored by default to prevent committing user files
- Files are stored on the server's filesystem - consider cloud storage for production
- The frontend automatically falls back to local storage for non-authenticated users
- Media queries support pagination for efficient loading of large media libraries

