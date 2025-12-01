export type ImageFitMode = 'contain' | 'cover' | 'fill';

export interface SOPStep {
  id: string;
  order: number;
  description: string;
  image: string | null; // Base64 or Object URL
  imageFit?: ImageFitMode;
}

export interface SOPMetaData {
  id: string;
  title: string;
  sopId: string;
  date: string;
  author: string;
  cycleTime: string;
  version: string;
}

export interface SOPDocument {
  meta: SOPMetaData;
  steps: SOPStep[];
}

export enum ViewMode {
  LANDING = 'LANDING',
  EDITOR = 'EDITOR',
  PREVIEW = 'PREVIEW'
}