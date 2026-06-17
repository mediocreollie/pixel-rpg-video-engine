import fs from 'node:fs';
import path from 'node:path';

const SCENE_PACKS = {
  pub: { propDir: 'public/assets/props/pub' },
  'pub-accessory': { propDir: 'public/assets/props/pub-accessory' },
  'outside-route': { propDir: 'public/assets/props/outside-route' },
  'outside-route-additional': { propDir: 'public/assets/props/outside-route-additional' },
  beach: { propDir: 'public/assets/props/beach' },
  park: { propDir: 'public/assets/props/park' },
  cafe: { propDir: 'public/assets/props/cafe' },
};

const options = parseArgs(process.argv.slice(2));
const pack = getScenePack(options.pack);
const propDir = path.normalize(pack.propDir);
const mappingPath = path.join(propDir, 'selected-props.json');

try {
  main();
} catch (error) {
  console.error(`promote-props failed: ${error.message}`);
  process.exitCode = 1;
}

function main() {
  if (!fs.existsSync(mappingPath)) {
    throw new Error(`mapping file not found: ${mappingPath}`);
  }

  const mappings = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  const entries = Object.entries(mappings);

  if (entries.length === 0) {
    console.log(`No selected props to promote for ${options.pack}. Add mappings to selected-props.json first.`);
    return;
  }

  const planned = entries.map(([name, rawRelativePath]) => createPromotionPlan(name, rawRelativePath));
  const missingSources = planned.filter((item) => !fs.existsSync(item.sourcePath));
  if (missingSources.length > 0) {
    throw new Error(`selected raw files are missing:\n${missingSources.map((item) => item.rawRelativePath).join('\n')}`);
  }

  const existingTargets = planned.filter((item) => fs.existsSync(item.targetPath));
  if (existingTargets.length > 0 && !options.overwrite) {
    throw new Error(`refusing to overwrite existing production files:\n${existingTargets.map((item) => item.targetFilename).join('\n')}\nRun with --overwrite to replace them.`);
  }

  for (const item of planned) {
    fs.copyFileSync(item.sourcePath, item.targetPath);
  }

  console.log(`Promoted ${planned.length} ${options.pack} prop(s):`);
  for (const item of planned) {
    console.log(`- ${item.rawRelativePath} -> ${item.targetFilename}`);
  }
}

function parseArgs(args) {
  const positional = [];
  const parsed = {
    pack: 'pub',
    overwrite: false,
  };

  for (const arg of args) {
    if (arg === '--overwrite') {
      parsed.overwrite = true;
    } else if (arg.startsWith('--pack=')) {
      parsed.pack = arg.slice('--pack='.length);
    } else {
      positional.push(arg);
    }
  }

  if (positional[0]) {
    parsed.pack = positional[0];
  }

  return parsed;
}

function getScenePack(packName) {
  const pack = SCENE_PACKS[packName];
  if (!pack) {
    throw new Error(`unknown scene pack: ${packName}. Expected one of: ${Object.keys(SCENE_PACKS).join(', ')}`);
  }
  return pack;
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

  const sourcePath = path.join(propDir, rawRelativePath);
  const targetFilename = `${name}.png`;
  const targetPath = path.join(propDir, targetFilename);

  return {
    name,
    rawRelativePath,
    sourcePath,
    targetFilename,
    targetPath,
  };
}
