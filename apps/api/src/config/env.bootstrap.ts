import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

const envFiles = [
  resolve(__dirname, '../../.env'),
  resolve(__dirname, '../../../../.env'),
];

for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    config({ path: envFile });
  }
}
