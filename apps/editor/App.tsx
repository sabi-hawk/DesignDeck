import { FontData } from '@lidojs/design-core';
import axios from 'axios';
import React, { FC, useState } from 'react';
import ReactGA from 'react-ga4';
import { useAsync } from 'react-use';
import AuthPage from './src/components/auth/AuthPage';
import ToastContainer from './src/components/ui/ToastContainer';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import Test from './src/Test';

if (process.env.NODE_ENV === 'production') {
  ReactGA.initialize('G-68BJDBYMLE');
}
const API_KEYS = [
  process.env.API_KEY_ONE,
  process.env.API_KEY_TWO,
  process.env.API_KEY_THREE,
];
type FontVariant =
  | 'regular'
  | 'italic'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';
const AppContent: FC = () => {
  const { user, loading } = useAuth();
  const [googleFontList, setGoogleFontList] = useState<FontData[]>([]);
  
  useAsync(async () => {
    const rand = Math.floor(Math.random() * 2);
    const data = await axios.get<{
      items: {
        family: string;
        variants: FontVariant[];
        files: Record<FontVariant, string>;
      }[];
    }>(`https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEYS[rand]}`);
    const items = data.data.items;
    const res: FontData[] = items.map((i) => {
      const fonts = Object.entries(i.files).reduce(
        (acc, [fontWeight, file]) => {
          if (fontWeight === 'regular' || fontWeight === '400') {
            if (i.variants.includes('italic')) {
              acc.push({
                style: 'Italic',
                urls: [file],
              });
            }
            acc.push({
              urls: [file],
            });
          } else if (fontWeight === '600') {
            if (i.variants.includes('italic')) {
              acc.push({
                style: 'Bold_Italic',
                urls: [file],
              });
            }
            acc.push({
              style: 'Bold',
              urls: [file],
            });
          }
          return acc;
        },
        [] as FontData['fonts']
      );
      return {
        name: i.family,
        fonts: fonts,
      };
    });
    setGoogleFontList(res);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ fontSize: '1.2rem', margin: '0' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <Test googleFontList={googleFontList} />;
};

const App: FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
