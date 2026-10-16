/**
 * Exports the built-in sample data from src/utils/storage.ts to the backend seed file.
 * Run: npx tsx scripts/export_seed_data.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildDefaultData, getTodayDateStr } from '../src/utils/storage';
const data = buildDefaultData();

// Attendance and comments are generated for "today"; keep that behaviour in the seed.
const json = JSON.stringify(data, null, 2).split(getTodayDateStr()).join('{{TODAY}}');
const out = resolve(import.meta.dirname, '../backend/db/seeds/default_data.json');
writeFileSync(out, json + '\n');
console.log(`Wrote ${out}`);
