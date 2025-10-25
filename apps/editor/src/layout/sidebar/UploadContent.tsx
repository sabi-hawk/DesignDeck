import XIcon from '@duyank/icons/regular/X';
import { useEditor } from '@lidojs/design-editor';
import { fetchSvgContent } from '@lidojs/design-utils';
import axios from 'axios';
import React, { ChangeEvent, FC, useRef, useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useAuth } from '../../contexts/AuthContext';

const AUTH_BASE_URL = 'http://localhost:3001';

interface UploadContentProps {
  visibility: boolean;
  onClose: () => void;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'svg' | 'image' | 'video' | 'audio';
  filename: string;
  originalName: string;
}

const UploadContent: FC<UploadContentProps> = ({ visibility, onClose }) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { actions } = useEditor();
  const { user } = useAuth();

  const [images, setImages] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  // Fetch user's uploaded media on component mount
  useEffect(() => {
    if (user && visibility) {
      fetchUserMedia();
    }
  }, [user, visibility]);

  const fetchUserMedia = async () => {
    try {
      const response = await axios.get(`${AUTH_BASE_URL}/api/media`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        const mediaItems = response.data.media.map((item: {
          id: string;
          url: string;
          type: string;
          filename: string;
          originalName: string;
        }) => ({
          id: item.id,
          url: `${AUTH_BASE_URL}${item.url}`,
          type: item.type,
          filename: item.filename,
          originalName: item.originalName
        }));
        setImages(mediaItems);
      }
    } catch (error) {
      console.error('Error fetching user media:', error);
    }
  };

  const addImage = async (url: string) => {
    const img = new Image();
    img.onerror = (err) => window.alert(err);
    img.src = url;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      actions.addImageLayer(
        { url, thumb: url },
        { width: img.naturalWidth, height: img.naturalHeight }
      );
      if (isMobile) {
        onClose();
      }
    };
  };

  const addSvg = async (url: string) => {
    const ele = await fetchSvgContent(url);
    const viewBox = ele.getAttribute('viewBox')?.split(' ') || [];
    const width =
      viewBox.length === 4 ? +viewBox[2] : +(ele.getAttribute('width') || 100);
    const height =
      viewBox.length === 4 ? +viewBox[3] : +(ele.getAttribute('height') || 100);
    actions.addSvgLayer(url, { width, height }, ele);
    if (isMobile) {
      onClose();
    }
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // If user is not logged in, use local storage only
    if (!user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMedia: MediaItem = {
          id: `local-${Date.now()}`,
          url: reader.result as string,
          type: file.type === 'image/svg+xml' ? 'svg' : 'image',
          filename: file.name,
          originalName: file.name
        };
        setImages((prevState) => [newMedia, ...prevState]);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Upload to backend if user is logged in
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${AUTH_BASE_URL}/api/media/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        const newMedia: MediaItem = {
          id: response.data.media.id,
          url: `${AUTH_BASE_URL}${response.data.media.url}`,
          type: response.data.media.type,
          filename: response.data.media.filename,
          originalName: response.data.media.originalName
        };
        setImages((prevState) => [newMedia, ...prevState]);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      const errorMessage = error instanceof Error && (error as {response?: {data?: {message?: string}}}).response?.data?.message;
      alert(errorMessage || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  return (
    <div
      css={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        overflowY: 'auto',
        display: visibility ? 'flex' : 'none',
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          height: 48,
          borderBottom: '1px solid rgba(57,76,96,.15)',
          padding: '0 20px',
        }}
      >
        <p
          css={{
            lineHeight: '48px',
            fontWeight: 600,
            color: '#181C32',
            flexGrow: 1,
          }}
        >
          Upload Files
        </p>
        <div
          css={{
            fontSize: 20,
            flexShrink: 0,
            width: 32,
            height: 32,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onClose}
        >
          <XIcon />
        </div>
      </div>
      <div
        css={{
          margin: 16,
          background: uploading ? '#666' : '#3a3a4c',
          borderRadius: 8,
          color: '#fff',
          padding: '8px 16px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          textAlign: 'center',
        }}
        onClick={() => !uploading && inputFileRef.current?.click()}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </div>
      <input
        ref={inputFileRef}
        accept="image/*,video/*,audio/*"
        css={{ display: 'none' }}
        disabled={uploading}
        type={'file'}
        onChange={handleUpload}
      />
      <div css={{ padding: '16px' }}>
        <div
          css={{
            flexGrow: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
            gridGap: 8,
          }}
        >
          {images.map((item) => (
            <div
              key={item.id}
              css={{ cursor: 'pointer', position: 'relative' }}
              onClick={() =>
                item.type === 'image' ? addImage(item.url) : addSvg(item.url)
              }
            >
              <div css={{ paddingBottom: '100%', height: 0 }} />
              <div
                css={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f5f5f5',
                }}
              >
                {item.type === 'image' || item.type === 'svg' ? (
                  <img
                    alt={item.originalName}
                    css={{ maxHeight: '100%', maxWidth: '100%' }}
                    loading="lazy"
                    src={item.url}
                  />
                ) : (
                  <div css={{ fontSize: 12, padding: 8, textAlign: 'center' }}>
                    {item.type === 'video' ? '🎥' : '🎵'}
                    <br />
                    {item.originalName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadContent;
