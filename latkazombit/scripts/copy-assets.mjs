import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

function copy(source, destination) {
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

copy('index.html', 'public/index.html');

for (const file of readdirSync('data')) {
  if (file.endsWith('.json')) {
    copy(join('data', file), join('public', 'data', file));
  }
}

copy('data/audio', 'public/data/audio');
copy('data/images', 'public/data/images');
