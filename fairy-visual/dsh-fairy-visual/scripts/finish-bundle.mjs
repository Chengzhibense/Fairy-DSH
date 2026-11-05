import { copyFile } from 'node:fs/promises';

await copyFile('lib/index.iife.js', 'lib/client.js');
await copyFile('src/index.js', 'lib/index.js');
