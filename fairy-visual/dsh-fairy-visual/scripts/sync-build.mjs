// Post-bundle artifact staging, replacing the POSIX `cp`/`mv` chain in the
// upstream `bundle` script. Windows `cmd.exe` cannot resolve `cp`/`mv`, so the
// bundle previously built successfully and then failed to publish its output.
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Copy one build artifact onto its published path.
 * @param {string} from relative source inside the package
 * @param {string} to relative destination inside the package
 */
function stage(from, to) {
  const source = join(packageRoot, from);
  const target = join(packageRoot, to);
  if (!existsSync(source)) {
    throw new Error(`build artifact missing: ${from} (did tsdown run?)`);
  }
  copyFileSync(source, target);
  console.log(`staged ${from} -> ${to}`);
}

// The client surface is the IIFE bundle the browser ModuleLoader consumes.
stage('lib/index.iife.js', 'lib/client.js');
// The host surface is plain ESM and is published verbatim from src.
stage('src/index.js', 'lib/index.js');
