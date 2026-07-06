import fs from 'fs';
import path from 'path';
import { syncAllProjectsFromDb } from '../lib/services/projects-json-sync.service';

const envPath = path.join(__dirname, '../.env');
const envContents = fs.readFileSync(envPath, 'utf-8');
const databaseUrl = envContents
  .split('\n')
  .find((line) => line.startsWith('DATABASE_URL='))
  ?.replace(/^DATABASE_URL="?/, '')
  .replace(/"$/, '');

if (!databaseUrl) {
  throw new Error('DATABASE_URL not found in .env');
}

process.env.DATABASE_URL = databaseUrl;

async function main() {
  const count = await syncAllProjectsFromDb();
  console.log(`✅ Synced ${count} projects to projects.json`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
