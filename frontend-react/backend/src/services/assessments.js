import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load JSON safely
function loadJSON(filename) {
  const filePath = path.join(__dirname, '../data', filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// Load assessments
const phq9 = loadJSON('phq9.json');
const gad7 = loadJSON('gad7.json');
const pss10 = loadJSON('pss10.json');
const burnout = loadJSON('cbi_burnout.json');

export function getAssessment(type) {
  switch (type) {
    case 'phq9':
      return phq9;
    case 'gad7':
      return gad7;
    case 'pss10':
      return pss10;
    case 'burnout':
      return burnout;
    default:
      throw new Error('Invalid assessment type');
  }
}
