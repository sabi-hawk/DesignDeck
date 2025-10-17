import { DesignFrame } from '@lidojs/design-editor';
import React from 'react';
import { data } from './data';
import { useSidebarContext } from '../contexts/SidebarContext';

const EditorContent = () => {
  const { isSidebarPopupOpen } = useSidebarContext();
  return <DesignFrame data={data} isSidebarPopupOpen={isSidebarPopupOpen} />;
};

export default EditorContent;
