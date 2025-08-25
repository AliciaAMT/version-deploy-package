import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  outDir: 'dist',
  minify: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
  platform: 'node',
  external: [],
  noExternal: ['commander', 'inquirer', 'fs-extra', 'ejs', 'semver', 'jsonc-parser', 'chalk', 'ora'],
  banner: {
    js: '#!/usr/bin/env node',
  },
});
