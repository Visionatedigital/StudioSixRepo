import { generatedLibraryGroups } from './generated-assets';

export interface LibraryAsset {
  id: string;
  name: string;
  svgPath: string;
}

export interface LibraryCategory {
  id: string;
  name: string;
  itemCount: number;
  assets: LibraryAsset[];
  icon: string; // This will now be the path to an SVG for the category icon
  isPro?: boolean;
}

export interface LibraryGroup {
  id: string;
  name: string;
  categories: LibraryCategory[];
}

// Manually defined groups for items that are not auto-generated
const manualGroups: LibraryGroup[] = [
  // Example of a manual group.
  // {
  //   id: 'other',
  //   name: 'Other',
  //   categories: [
  //     { id: 'accessible-restroom', name: 'Accessible restroom...', itemCount: 56, icon: '♿', assets: [] },
  //     { id: 'animals', name: 'Animals - 3 views', itemCount: 156, icon: '🦓', assets: [] },
  //   ]
  // }
];

export const STUDIOSIX_LIBRARIES: LibraryGroup[] = [
  ...generatedLibraryGroups,
  ...manualGroups,
]; 