import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(rootDir, 'public');
const contentDirs = {
  scene: path.join(publicDir, 'scenes'),
  character: path.join(publicDir, 'characters'),
  location: path.join(publicDir, 'locations')
};
const schemaFiles = {
  scene: path.join(publicDir, 'schemas', 'scene.schema.json'),
  character: path.join(publicDir, 'schemas', 'character.schema.json'),
  location: path.join(publicDir, 'schemas', 'location.schema.json')
};
const allowedLocationLayers = new Set(['terrain', 'edges', 'boundaries', 'props', 'overPlayer']);

const errors = [];

function relative(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, '/');
}

function addError(filePath, fieldPath, message) {
  errors.push(`${relative(filePath)} ${fieldPath}: ${message}`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    addError(filePath, '$', `Invalid JSON: ${error.message}`);
    return null;
  }
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    errors.push(`${relative(dir)} $: Directory does not exist`);
    return [];
  }

  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.join(dir, file))
    .filter((file) => path.basename(file) !== 'manifest.json');
}

function listAssetPacks() {
  const propsDir = path.join(publicDir, 'assets', 'props');

  if (!fs.existsSync(propsDir)) {
    return new Set();
  }

  return new Set(fs.readdirSync(propsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name));
}

function loadContent(type) {
  const items = new Map();

  for (const filePath of listJsonFiles(contentDirs[type])) {
    const data = readJson(filePath);
    if (!data) {
      continue;
    }

    if (!data.id || typeof data.id !== 'string') {
      addError(filePath, '$.id', 'Required string field is missing');
      continue;
    }

    if (items.has(data.id)) {
      addError(filePath, '$.id', `Duplicate ${type} id "${data.id}"`);
    }

    items.set(data.id, { filePath, data });
  }

  return items;
}

function typeOf(value) {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  return typeof value;
}

function validateValue(filePath, schema, value, fieldPath) {
  if (!schema || typeof schema !== 'object') {
    return;
  }

  if (schema.type && typeOf(value) !== schema.type) {
    addError(filePath, fieldPath, `Expected ${schema.type}, got ${typeOf(value)}`);
    return;
  }

  if (schema.required && value && typeof value === 'object') {
    for (const requiredField of schema.required) {
      if (value[requiredField] === undefined) {
        addError(filePath, `${fieldPath}.${requiredField}`, 'Required field is missing');
      }
    }
  }

  if (schema.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, childSchema] of Object.entries(schema.properties || {})) {
      if (value[key] !== undefined) {
        validateValue(filePath, childSchema, value[key], `${fieldPath}.${key}`);
      }
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      for (const [key, childValue] of Object.entries(value)) {
        if (!schema.properties?.[key]) {
          validateValue(filePath, schema.additionalProperties, childValue, `${fieldPath}.${key}`);
        }
      }
    }
  }

  if (schema.type === 'array' && Array.isArray(value) && schema.items) {
    value.forEach((item, index) => {
      validateValue(filePath, schema.items, item, `${fieldPath}[${index}]`);
    });
  }
}

function validateWithSchema(type, items) {
  const schema = readJson(schemaFiles[type]);
  if (!schema) {
    return;
  }

  for (const { filePath, data } of items.values()) {
    validateValue(filePath, schema, data, '$');
  }
}

function validateSceneReferences(scenes, characters, locations) {
  for (const { filePath, data: scene } of scenes.values()) {
    const actorIds = new Set();

    if (!locations.has(scene.startingLocation)) {
      addError(filePath, '$.startingLocation', `Unknown location "${scene.startingLocation}"`);
    }

    if (!locations.has(scene.destinationLocation)) {
      addError(filePath, '$.destinationLocation', `Unknown location "${scene.destinationLocation}"`);
    }

    (scene.participatingCharacters || []).forEach((entry, index) => {
      if (entry?.id) {
        actorIds.add(entry.id);
      }

      if (!entry?.character || !characters.has(entry.character)) {
        addError(filePath, `$.participatingCharacters[${index}].character`, `Unknown character "${entry?.character}"`);
      }
    });

    (scene.dialogueSequence || []).forEach((line, index) => {
      if (!actorIds.has(line?.speaker)) {
        addError(filePath, `$.dialogueSequence[${index}].speaker`, `Unknown scene actor "${line?.speaker}"`);
      }
    });

    (scene.scriptedMovements || []).forEach((movement, index) => {
      if (!actorIds.has(movement?.actor)) {
        addError(filePath, `$.scriptedMovements[${index}].actor`, `Unknown scene actor "${movement?.actor}"`);
      }
    });
  }
}

function validateLocationReferences(locations) {
  for (const { filePath, data: location } of locations.values()) {
    (location.exits || []).forEach((exit, index) => {
      if (!locations.has(exit?.targetLocation)) {
        addError(filePath, `$.exits[${index}].targetLocation`, `Unknown location "${exit?.targetLocation}"`);
      }
    });
  }
}

function validateAssetPack(filePath, fieldPath, pack, assetPacks) {
  if (!pack || typeof pack !== 'string') {
    addError(filePath, fieldPath, 'Asset pack must be a non-empty string');
    return false;
  }

  if (!assetPacks.has(pack)) {
    addError(filePath, fieldPath, `Unknown asset pack "${pack}"`);
    return false;
  }

  return true;
}

function validateAssetReference(filePath, fieldPath, entry, fallbackPack, assetPacks) {
  if (!entry || typeof entry !== 'object' || !entry.asset) {
    return;
  }

  if (typeof entry.asset !== 'string') {
    addError(filePath, `${fieldPath}.asset`, 'Asset must be a string');
    return;
  }

  if (entry.asset.startsWith('raw/')) {
    addError(filePath, `${fieldPath}.asset`, 'Raw extracted object files must not be referenced directly');
    return;
  }

  const pack = entry.assetPack || fallbackPack;
  if (!validateAssetPack(filePath, `${fieldPath}.assetPack`, pack, assetPacks)) {
    return;
  }

  const assetPath = path.join(publicDir, 'assets', 'props', pack, entry.asset);
  if (!fs.existsSync(assetPath)) {
    addError(filePath, `${fieldPath}.asset`, `Missing asset "public/assets/props/${pack}/${entry.asset}"`);
  }
}

function validateRows(filePath, fieldPath, rows, expectedWidth) {
  if (!Array.isArray(rows) || rows.length === 0) {
    addError(filePath, fieldPath, 'Rows must be a non-empty array');
    return null;
  }

  let width = expectedWidth ?? null;

  rows.forEach((row, index) => {
    if (typeof row !== 'string') {
      addError(filePath, `${fieldPath}[${index}]`, 'Row must be a string');
      return;
    }

    if (width === null) {
      width = row.length;
    }

    if (row.length !== width) {
      addError(filePath, `${fieldPath}[${index}]`, `Expected row width ${width}, got ${row.length}`);
    }
  });

  return { width, height: rows.length };
}

function validateLayerSymbols(filePath, fieldPath, rows, legend, allowSpace = false) {
  if (!Array.isArray(rows) || !legend || typeof legend !== 'object') {
    return;
  }

  const symbols = new Set(Object.keys(legend));

  rows.forEach((row, rowIndex) => {
    if (typeof row !== 'string') {
      return;
    }

    Array.from(row).forEach((symbol, colIndex) => {
      if (allowSpace && symbol === ' ') {
        return;
      }

      if (!symbols.has(symbol)) {
        addError(filePath, `${fieldPath}[${rowIndex}][${colIndex}]`, `Unknown layer symbol "${symbol}"`);
      }
    });
  });
}

function validateLegendAssets(filePath, fieldPath, legend, fallbackPack, assetPacks) {
  if (!legend || typeof legend !== 'object') {
    return;
  }

  for (const [symbol, entry] of Object.entries(legend)) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    validateAssetReference(filePath, `${fieldPath}.${symbol}`, entry, fallbackPack, assetPacks);
  }
}

function validateLayerObjects(filePath, fieldPath, objects, fallbackPack, assetPacks) {
  if (!Array.isArray(objects)) {
    addError(filePath, fieldPath, 'Layer must be an array');
    return;
  }

  objects.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      addError(filePath, `${fieldPath}[${index}]`, 'Layer entry must be an object');
      return;
    }

    if (typeof entry.x !== 'number') {
      addError(filePath, `${fieldPath}[${index}].x`, 'Required numeric x field is missing');
    }

    if (typeof entry.y !== 'number') {
      addError(filePath, `${fieldPath}[${index}].y`, 'Required numeric y field is missing');
    }

    validateAssetReference(filePath, `${fieldPath}[${index}]`, entry, fallbackPack, assetPacks);
  });
}

function validateLayeredLocations(locations) {
  const assetPacks = listAssetPacks();

  for (const { filePath, data: location } of locations.values()) {
    const fallbackPack = location.propAssetPack || location.id;

    (location.assetPacks || []).forEach((pack, index) => {
      validateAssetPack(filePath, `$.assetPacks[${index}]`, pack, assetPacks);
    });

    (location.props || []).forEach((prop, index) => {
      validateAssetReference(filePath, `$.props[${index}]`, prop, fallbackPack, assetPacks);
    });

    if (!location.layers) {
      continue;
    }

    for (const layerName of Object.keys(location.layers)) {
      if (!allowedLocationLayers.has(layerName)) {
        addError(filePath, `$.layers.${layerName}`, `Invalid layer name "${layerName}"`);
      }
    }

    const terrain = location.layers.terrain;
    let terrainSize = null;

    if (terrain) {
      const rowsField = '$.layers.terrain.rows';
      terrainSize = validateRows(filePath, rowsField, terrain.rows, location.width);
      validateLayerSymbols(filePath, rowsField, terrain.rows, terrain.legend, false);
      validateLegendAssets(filePath, '$.layers.terrain.legend', terrain.legend, fallbackPack, assetPacks);

      if (terrainSize && typeof location.height === 'number' && location.height !== terrainSize.height) {
        addError(filePath, '$.height', `Expected ${terrainSize.height} terrain rows, got height ${location.height}`);
      }

      if (terrainSize && typeof location.width === 'number' && location.width !== terrainSize.width) {
        addError(filePath, '$.width', `Expected terrain width ${terrainSize.width}, got width ${location.width}`);
      }
    }

    const edges = location.layers.edges;
    if (edges) {
      const rowsField = '$.layers.edges.rows';
      const expectedWidth = terrainSize?.width ?? location.width;
      validateRows(filePath, rowsField, edges.rows, expectedWidth);
      validateLayerSymbols(filePath, rowsField, edges.rows, edges.legend, true);
      validateLegendAssets(filePath, '$.layers.edges.legend', edges.legend, fallbackPack, assetPacks);
    }

    validateLayerObjects(filePath, '$.layers.boundaries', location.layers.boundaries || [], fallbackPack, assetPacks);
    validateLayerObjects(filePath, '$.layers.props', location.layers.props || [], fallbackPack, assetPacks);
    validateLayerObjects(filePath, '$.layers.overPlayer', location.layers.overPlayer || [], fallbackPack, assetPacks);

    (location.triggers || []).forEach((trigger, index) => {
      if (!trigger?.id || typeof trigger.id !== 'string') {
        addError(filePath, `$.triggers[${index}].id`, 'Required string id field is missing');
      }

      if (!trigger?.type || typeof trigger.type !== 'string') {
        addError(filePath, `$.triggers[${index}].type`, 'Required string type field is missing');
      }

      if (typeof trigger?.x !== 'number') {
        addError(filePath, `$.triggers[${index}].x`, 'Required numeric x field is missing');
      }

      if (typeof trigger?.y !== 'number') {
        addError(filePath, `$.triggers[${index}].y`, 'Required numeric y field is missing');
      }

      if (trigger?.type === 'transition') {
        if (!trigger.targetLocation || typeof trigger.targetLocation !== 'string') {
          addError(filePath, `$.triggers[${index}].targetLocation`, 'Transition trigger requires targetLocation');
        } else if (!locations.has(trigger.targetLocation)) {
          addError(filePath, `$.triggers[${index}].targetLocation`, `Unknown location "${trigger.targetLocation}"`);
        }
      }
    });
  }
}

const scenes = loadContent('scene');
const characters = loadContent('character');
const locations = loadContent('location');

validateWithSchema('scene', scenes);
validateWithSchema('character', characters);
validateWithSchema('location', locations);
validateSceneReferences(scenes, characters, locations);
validateLocationReferences(locations);
validateLayeredLocations(locations);

if (errors.length > 0) {
  console.error('Content validation failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Content validation passed: ${scenes.size} scenes, ${characters.size} characters, ${locations.size} locations.`);
