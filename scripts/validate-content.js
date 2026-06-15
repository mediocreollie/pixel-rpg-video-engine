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

const scenes = loadContent('scene');
const characters = loadContent('character');
const locations = loadContent('location');

validateWithSchema('scene', scenes);
validateWithSchema('character', characters);
validateWithSchema('location', locations);
validateSceneReferences(scenes, characters, locations);
validateLocationReferences(locations);

if (errors.length > 0) {
  console.error('Content validation failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Content validation passed: ${scenes.size} scenes, ${characters.size} characters, ${locations.size} locations.`);
