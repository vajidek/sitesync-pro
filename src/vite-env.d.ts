/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PWA_ENABLE?: string | boolean;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
