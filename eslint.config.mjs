import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  {
    // The toys moved from www.thearcades.me restore saved progress in effects,
    // which that repo's lint config allows. Keep the exception to those files.
    files: ['components/toys/**'],
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
  globalIgnores(['.next/**', 'node_modules/**']),
]);
