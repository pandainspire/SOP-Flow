import { SOPDocument } from './types';

// Safe ID generator that works in all environments (unlike crypto.randomUUID which requires secure context)
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// A default placeholder image URL using picsum as requested
export const PLACEHOLDER_IMAGE = "https://picsum.photos/400/300";

// Converted to a function to ensure we get a fresh object instance every time (Deep Copy)
export const createDefaultSOP = (): SOPDocument => ({
  meta: {
    id: generateId(),
    title: "",
    sopId: "",
    date: "",
    author: "",
    cycleTime: "",
    version: ""
  },
  steps: Array.from({ length: 6 }).map((_, i) => ({
    id: `step-${i + 1}-${generateId()}`, // Ensure unique IDs for React keys
    order: i + 1,
    description: "[Enter step description here]",
    image: null
  }))
});

export const ITEMS_PER_PAGE = 6;