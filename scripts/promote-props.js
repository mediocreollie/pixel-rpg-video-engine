import fs from 'node:fs';
import path from 'node:path';

const PROP_DIR = path.normalize('public/assets/props/pub');
const MAPPING_PATH = path.join(PROP_DIR, 'selected-props.json');
const overwrite = process.argv.includes('--overwrite');

try {
  main();
} catch (error) {
  console.error(`promote-props failed: ${error.message}`);
  process.exitCode = 1;
}

function main() {
  if (!fs.existsSync(MAPPING_PATH)) {
    throw new Error(`mapping file not found: ${MAPPING_PATH}`);
  }

  const mappings = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8'));
  const entries = Object.entries(mappings);

  if (entries.length === 0) {
    console.log('No selected props to promote. Add mappings to selected-props.json first.');
    return;
  }

  const planned = entries.map(([name, rawRelativePath]) => createPromotionPlan(name, rawRelativePath));
  const missingSources = planned.filter((item) => !fs.existsSync(item.sourcePath));
  if (missingSources.length > 0) {
    throw new Error(`selected raw files are missing:\n${missingSources.map((item) => item.rawRelativePath).join('\n')}`);
  }

  const existingTargets = planned.filter((item) => fs.existsSync(item.targetPath));
  if (existingTargets.length > 0 && !overwrite) {
    throw new Error(`refusing to overwrite existing production files:\n${existingTargets.map((item) => item.targetFilename).join('\n')}\nRun with --overwrite to replace them.`);
  }

  for (const item of planned) {
    fs.copyFileSync(item.sourcePath, item.targetPath);
  }

  console.log(`Promoted ${planned.length} pub prop(s):`);
  for (const item of planned) {
    console.log(`- ${item.rawRelativePath} -> ${item.targetFilename}`);
  }
}

function createPromotionPlan(name, rawRelativePath) {
  if (!/^[a-z0-9_-]+$/.test(name)) {
    throw new Error(`invalid production prop name: ${name}. Use lowercase letters, numbers, underscores, or hyphens.`);
  }

  if (typeof rawRelativePath !== 'string' || rawRelativePath.length === 0) {
    throw new Error(`invalid raw file path for ${name}`);
  }

  if (path.isAbsolute(rawRelativePath) || rawRelativePath.includes('..')) {
    throw new Error(`unsafe raw file path for ${name}: ${rawRelativePath}`);
  }

  if (!rawRelativePath.startsWith('raw/') || !rawRelativePath.endsWith('.png')) {
    throw new Error(`raw file path for ${name} must look like raw/object_###.png`);
  }

  const sourcePath = path.join(PROP_DIR, rawRelativePath);
  const targetFilename = `${name}.png`;
  const targetPath = path.join(PROP_DIR, targetFilename);

  return {
    name,
    rawRelativePath,
    sourcePath,
    targetFilename,
    targetPath,
  };
}
