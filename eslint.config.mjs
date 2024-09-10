// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';


export default tseslint.config({
  files: ['**/*.ts'],
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
  ],
  ignores: [
    "dist/*",
    "node_modules/*",
    "jest.config.js",
    "test/*"
  ],
  rules: {
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-unsafe-function-type": "off"
  },
});
