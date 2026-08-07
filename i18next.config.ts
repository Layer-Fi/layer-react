// Type-only on purpose: a value import makes tsx `require()` i18next-cli's CJS build, which
// reaches an ESM-only transitive dep and fails to resolve. `defineConfig` is identity.
import type { I18nextToolkitConfig } from 'i18next-cli'

import conditionalPlugin from './scripts/i18next/conditionalPlugin'
import pluralPlugin from './scripts/i18next/pluralPlugin'
import translationKeyPlugin from './scripts/i18next/translationKeyPlugin'

const config: I18nextToolkitConfig = {
  locales: ['en-US', 'fr-CA'],
  plugins: [conditionalPlugin, pluralPlugin, translationKeyPlugin],
  extract: {
    // Tests and stories are not shipped copy, and the zone rules in `npm run i18n:check`
    // deliberately exempt them — so they must not be able to write keys into the locale JSON.
    input: 'src/**/*.{js,jsx,ts,tsx}',
    ignore: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/*.stories.tsx', 'src/**/*.storyData.tsx'],
    output: 'src/assets/locales/{{language}}/{{namespace}}.json',
  },
}

export default config
