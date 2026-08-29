import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  globalIgnores([
    '**/.next/**',
    '**/node_modules/**',
    '**/out/**',
    '**/build/**',
    '**/resumeai/**',
    '**/careerhub/**',
    'prisma.config.ts',
  ]),
]);

export default eslintConfig;
