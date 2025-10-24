/// <reference types="vite/client" />

// Extend ImportMeta env typings for Vite and project-specific variables
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
