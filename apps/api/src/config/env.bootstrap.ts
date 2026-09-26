import { resolve } from 'node:path';
import { config } from 'dotenv';
// Works from source, compiled output and either workspace cwd.
for (const file of ['apps/api/.env', '.env', '../../.env']) {
  config({ path: resolve(process.cwd(), file), quiet: true });
}
