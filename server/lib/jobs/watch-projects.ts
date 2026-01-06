/**
 * File watcher for automatic sync
 * Watches projects.json and syncs to DB when it changes
 */

import fs from 'fs';
import path from 'path';
import { syncProjectsFromJson } from './sync-projects';

const projectsJsonPath = path.join(process.cwd(), '../client/src/data/projects.json');

console.log('👀 Watching projects.json for changes...');
console.log(`   Path: ${projectsJsonPath}`);

let isSyncing = false;

fs.watch(projectsJsonPath, async (eventType, filename) => {
  if (eventType === 'change' && !isSyncing) {
    console.log('\n📝 projects.json changed! Syncing to database...');
    isSyncing = true;

    // Small delay to ensure file is fully written
    setTimeout(async () => {
      try {
        await syncProjectsFromJson();
        console.log('✅ Auto-sync complete! Watching for more changes...\n');
      } catch (error) {
        console.error('❌ Auto-sync failed:', error);
      } finally {
        isSyncing = false;
      }
    }, 500);
  }
});

console.log('✅ Watcher started! Edit projects.json and save to trigger sync.\n');