import { ElementType } from 'react';
import FrameLayer from '../layers/FrameLayer';
import GroupLayer from '../layers/GroupLayer';
import IframeLayer from '../layers/IframeLayer';
import ImageLayer from '../layers/ImageLayer';
import RootLayer from '../layers/RootLayer';
import ShapeLayer from '../layers/ShapeLayer';
import SvgLayer from '../layers/SvgLayer';
import TextLayer from '../layers/TextLayer';

export const resolvers: Record<string, ElementType> = {
  RootLayer,
  ShapeLayer,
  TextLayer,
  ImageLayer,
  GroupLayer,
  FrameLayer,
  SvgLayer,
  IframeLayer,
};
