/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TIMEZONE: string | undefined;
  readonly VITE_CURRENCY: string | undefined;
  readonly VITE_LOCALE: string | undefined;
  readonly VITE_SENTRY_DSN: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
