import fs from 'fs';
import path from 'path';
import { init, add, commit, statusMatrix } from 'isomorphic-git';

const dir = '/Users/olegzubarev/Desktop/FoodNutrion/papkasait';

// 1. Init repo
await init({ fs, dir, defaultBranch: 'main' });
console.log('Initialized empty Git repository');

// 2. Get all files via statusMatrix
const matrix = await statusMatrix({ fs, dir, filter: f => !f.startsWith('.git') });

// Files that exist in workdir (workdir === 2) and are not ignored
// In statusMatrix, ignored files are typically not listed at all or have workdir === 0
const files = matrix
  .filter(([filepath, head, workdir, stage]) => workdir === 2)
  .map(([filepath]) => filepath);

console.log(`Adding ${files.length} files...`);

// 3. Add files
for (const filepath of files) {
  try {
    await add({ fs, dir, filepath });
  } catch (e) {
    console.warn(`Warning: could not add ${filepath}: ${e.message}`);
  }
}

// 4. Commit
const sha = await commit({
  fs,
  dir,
  message: 'init: initial project setup',
  author: {
    name: 'Oleg Zubarev',
    email: 'olegzubarev@example.com',
  },
});

console.log(`[main (root-commit) ${sha.slice(0, 7)}] init: initial project setup`);
console.log(`${files.length} files changed`);
console.log('Git repository initialized successfully!');
