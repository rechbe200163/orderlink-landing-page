import { DocumentIconKey, MainIconKey, SecondaryIconKey } from './icons';
import { ROUTES } from './routes';

export const navMain = [
  { title: 'Dashboard', url: ROUTES.dashboard, icon: 'dashboard' },
  { title: 'Projects', url: ROUTES.projects, icon: 'projects' },
] satisfies ReadonlyArray<{ title: string; url: string; icon: MainIconKey }>;

export const navSecondary = [
  { title: 'Settings', url: ROUTES.settings, icon: 'settings' },
] satisfies ReadonlyArray<{
  title: string;
  url: string;
  icon: SecondaryIconKey;
}>;

export const documentItems = [
  { title: 'Data Library', url: '#', icon: 'dataLibrary' },
  { title: 'Reports', url: '#', icon: 'reports' },
  { title: 'Word Assistant', url: '#', icon: 'wordAssistant' },
] satisfies ReadonlyArray<{
  title: string;
  url: string;
  icon: DocumentIconKey;
}>;
