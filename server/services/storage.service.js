import fs from 'fs';
import path from 'path';

export async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });
}

export async function saveJson(filePath, data) {
  await ensureDir(filePath);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function readJson(filePath) {
  try {
    const buf = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(buf);
  } catch {
    return null;
  }
}


