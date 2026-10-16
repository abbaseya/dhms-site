#!/usr/bin/env node
// Checks the translation files in src/i18n/. Every language file must have
// exactly the keys of en.json, no value may be empty, and no visible string
// may name a technical primitive: plain language only.
// Exit status: 0 when every check passes, 1 otherwise.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('../src/i18n/', import.meta.url));
// English names match as whole words with their plural and joined forms. The
// Arabic names are the usual translations of the same primitives.
const BANNED = [
  /\b(skill(s|set|sets)?|hooks?|sub-?agents?|plugins?|mcps?|claude\.md|agents\.md)\b/i,
  /(مهارة|مهارات|خطاف|خطافات|وكيل فرعي|وكلاء فرعيون|إضافة برمجية|إضافات برمجية)/,
];

// leaves <value>: every leaf with its dotted key. A leaf that is not a string,
// such as null or a number, is kept so the check can report it.
function leaves(value, prefix = '') {
  if (value === null || typeof value !== 'object') return [[prefix, value]];
  return Object.entries(value).flatMap(([key, inner]) => leaves(inner, prefix ? `${prefix}.${key}` : key));
}

const files = readdirSync(DIR).filter((name) => name.endsWith('.json')).sort();
const strings = Object.fromEntries(files.map((name) => [name, leaves(JSON.parse(readFileSync(join(DIR, name), 'utf8')))]));
const reference = new Set(strings['en.json'].map(([key]) => key));
const errors = [];
for (const [file, entries] of Object.entries(strings)) {
  const keys = new Set(entries.map(([key]) => key));
  for (const key of reference) if (!keys.has(key)) errors.push(`${file}: missing ${key}`);
  for (const key of keys) if (!reference.has(key)) errors.push(`${file}: extra ${key}`);
  for (const [key, text] of entries) {
    if (typeof text !== 'string') {
      errors.push(`${file}: ${key} is not a string`);
      continue;
    }
    if (text.trim() === '') errors.push(`${file}: ${key} is empty`);
    if (BANNED.some((pattern) => pattern.test(text))) errors.push(`${file}: ${key} names a technical primitive: ${text}`);
  }
}
for (const error of errors) console.error(error);
console.log(`Checked ${files.length} language files with ${reference.size} keys each: ${errors.length} errors.`);
process.exit(errors.length === 0 ? 0 : 1);
