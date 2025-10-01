import { FontData } from '@lidojs/design-core';
import axios from 'axios';
import { FC, useState, useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useAsync } from 'react-use';
import Test from './src/Test';
import { AuthScreen } from '@lidojs/design-editor';
import { authService, User } from '@lidojs/design-editor';

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
const App: FC = () => {
  const [googleFontList, setGoogleFontList] = useState([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

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

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading DesignDeck...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return <Test googleFontList={googleFontList} user={user} onLogout={handleLogout} />;
};

export default App;
