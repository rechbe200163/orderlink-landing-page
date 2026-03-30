import { IconDashboard, IconFolder, IconSettings } from '@tabler/icons-react';

export const MAIN_ICONS = {
  dashboard: IconDashboard,
  projects: IconFolder,
} as const;
export type MainIconKey = keyof typeof MAIN_ICONS;

export const SECONDARY_ICONS = {
  settings: IconSettings,
} as const;
export type SecondaryIconKey = keyof typeof SECONDARY_ICONS;

export const DOCUMENT_ICONS = {
  dataLibrary: IconFolder,
  reports: IconFolder,
  wordAssistant: IconFolder,
} as const;
export type DocumentIconKey = keyof typeof DOCUMENT_ICONS;
