import { FontData } from '@lidojs/design-core';
import axios from 'axios';
import { FC, useState } from 'react';
import ReactGA from 'react-ga4';
import { useAsync } from 'react-use';
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
const App: FC = () => {
  const [googleFontList, setGoogleFontList] = useState([]);
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
  return <Test googleFontList={googleFontList} />;
};

export default App;
