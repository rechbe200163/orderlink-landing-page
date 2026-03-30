export type Locale = (typeof locales)[number];

export const locales = ['en', 'de', 'fr', 'es', 'nl'] as const;
export const defaultLocale: Locale = 'de';
