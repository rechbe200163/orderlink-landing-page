export const ROUTES = {
  home: '/' as const,
  dashboard: '/dashboard' as const,
  lifecycle: '/dashboard/lifecycle' as const,
  analytics: '/dashboard/analytics' as const,
  projects: '/dashboard/projects' as const,
  team: '/dashboard/team' as const,
  settings: '/settings' as const,
  help: '/help' as const,
  search: '/search' as const,
} as const;

// Optional: für Type-Safety, falls du URLs irgendwo validieren willst
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
