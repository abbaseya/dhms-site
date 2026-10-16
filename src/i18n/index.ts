import en from './en.json';
import ar from './ar.json';

// Every visible string comes from one of these files. To add a language,
// add its JSON file with the same keys and an entry in LOCALES.
export const LOCALES = {
  en: { name: 'English', dir: 'ltr', strings: en },
  ar: { name: 'العربية', dir: 'rtl', strings: ar },
} as const;

export type Locale = keyof typeof LOCALES;
export const DEFAULT_LOCALE: Locale = 'en';
export type Strings = typeof en;

// English lives at the root. Every other language lives under /<locale>/.
export function localePath(locale: Locale, page: string): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${prefix}/${page}`.replace(/\/+$/, '') + '/';
}

// getStaticPaths entries for one page in every language. The rest parameter
// is undefined for English, so its page sits at the root.
export function localeStaticPaths() {
  return (Object.keys(LOCALES) as Locale[]).map((locale) => ({
    params: { lang: locale === DEFAULT_LOCALE ? undefined : locale },
    props: { locale },
  }));
}

export function strings(locale: Locale): Strings {
  return LOCALES[locale].strings as Strings;
}
