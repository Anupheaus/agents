/**
 * Shared tsup config template for Anupheaus TypeScript libraries.
 *
 * Usage in tsup.config.ts:
 *   import { defineConfig } from 'tsup';
 *   import { createLibraryConfig } from '../../agents/ci-templates/tsup/library';
 *   export default createLibraryConfig({ entry: ['src/index.ts'] });
 *
 * Or override any field:
 *   export default createLibraryConfig({
 *     entry: ['src/index.ts'],
 *     external: ['react', 'react-dom'],
 *     noExternal: [],  // bundle specific deps
 *   });
 */
import { defineConfig, type Options } from 'tsup';

interface LibraryConfigOptions extends Omit<Options, 'format' | 'dts' | 'sourcemap' | 'clean'> {
  entry: string[];
  /** Additional externals beyond node built-ins (auto-detected from package.json peerDeps) */
  external?: (string | RegExp)[];
  /** Whether to emit a CommonJS build alongside ESM (default: true for Node libs) */
  cjs?: boolean;
}

export function createLibraryConfig(options: LibraryConfigOptions) {
  const { cjs = true, ...rest } = options;
  const formats: Options['format'] = cjs ? ['esm', 'cjs'] : ['esm'];

  return defineConfig({
    format: formats,
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false,
    ...rest,
  });
}
