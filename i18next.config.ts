import { defineConfig } from 'i18next-cli'

import conditionalPlugin from './scripts/i18next/conditionalPlugin'
import pluralPlugin from './scripts/i18next/pluralPlugin'
import translationKeyPlugin from './scripts/i18next/translationKeyPlugin'

export default defineConfig({
  locales: [
    'en-US',
  ],
  plugins: [conditionalPlugin, pluralPlugin, translationKeyPlugin],
  extract: {
    input: 'src/**/*.{js,jsx,ts,tsx}',
    output: 'src/assets/locales/{{language}}/{{namespace}}.json',
  },
})
