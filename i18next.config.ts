import { defineConfig } from 'i18next-cli'

import conditionalPlugin from './scripts/i18next/conditionalPlugin'
import pluralPlugin from './scripts/i18next/pluralPlugin'

export default defineConfig({
  locales: [
    'en-US',
    'fr-CA',
  ],
  plugins: [conditionalPlugin, pluralPlugin],
  extract: {
    input: 'src/**/*.{js,jsx,ts,tsx}',
    output: 'src/assets/locales/{{language}}/{{namespace}}.json',
  },
})
