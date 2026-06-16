import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const SCENE_PACKS = {
  pub: {
    source: 'references/source-sheets/pub_object_sheet.png',
    outputDir: 'public/assets/props/pub/raw',
  },
  'outside-route': {
    source: 'references/source-sheets/outside_route_object_sheet.png',
    outputDir: 'public/assets/props/outside-route/raw',
  },
  beach: {
    source: 'references/source-sheets/beach_object_sheet.png',
    outputDir: 'public/assets/props/beach/raw',
  },
  park: {
    source: 'references/source-sheets/park_object_sheet.png',
    outputDir: 'public/assets/props/park/raw',
  },
  cafe: {
    source: 'references/source-sheets/cafe_object_sheet.png',
    outputDir: 'public/assets/props/cafe/raw',
  },
};
const CRC_TABLE = createCrcTable();

const options = parseArgs(process.argv.slice(2));
const pack = getScenePack(options.pack);
const sourcePath = path.normalize(options.source ?? pack.source);
const outputDir = path.normalize(options.outputDir ?? pack.outputDir);
const settings = {
  padding: options.padding ?? 2,
  minPixels: options.minPixels ?? 32,
  alphaThreshold: options.alphaThreshold ?? 8,
  connectivity: 8,
};

try {
  main();
} catch (error) {
  console.error(`extract-objects failed: ${error.message}`);
  process.exitCode = 1;
}

function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`source PNG not found: ${sourcePath}`);
  }

  const source = decodePng(fs.readFileSync(sourcePath));
  const regions = findConnectedRegions(source, settings)
    .filter((region) => region.pixelCount >= settings.minPixels)
    .sort((a, b) => (a.minY - b.minY) || (a.minX - b.minX));

  if (regions.length === 0) {
    throw new Error('no object regions found above the noise threshold');
  }

  const crops = regions.map((region, index) => {
    const padded = padBounds(region, source.width, source.height, settings.padding);
    const image = cropImage(source, padded);
    const filename = `object_${String(index + 1).padStart(3, '0')}.png`;

    return {
      filename,
      image,
      manifest: {
        filename,
        width: image.width,
        height: image.height,
        sourceBoundingBox: boxFromRegion(region),
        paddedBoundingBox: padded,
        pixelCount: region.pixelCount,
      },
    };
  });

  fs.mkdirSync(outputDir, { recursive: true });

  const manifestPath = path.join(outputDir, 'manifest.json');
  const contactSheetPath = path.join(outputDir, 'contact_sheet.png');
  const reviewPath = path.join(outputDir, 'review.html');
  const outputPaths = [
    manifestPath,
    contactSheetPath,
    reviewPath,
    ...crops.map((crop) => path.join(outputDir, crop.filename)),
  ];
  const existingOutputs = outputPaths.filter((outputPath) => fs.existsSync(outputPath));

  if (existingOutputs.length > 0) {
    throw new Error(`refusing to overwrite existing output files:\n${existingOutputs.join('\n')}`);
  }

  for (const crop of crops) {
    fs.writeFileSync(path.join(outputDir, crop.filename), encodePng(crop.image));
  }

  fs.writeFileSync(contactSheetPath, encodePng(createContactSheet(crops.map((crop) => crop.image))));
  fs.writeFileSync(manifestPath, `${JSON.stringify(createManifest(source, crops), null, 2)}\n`);
  fs.writeFileSync(reviewPath, createReviewHtml(options.pack));

  console.log(`Extracted ${crops.length} ${options.pack} object(s) from ${sourcePath}`);
  console.log(`Wrote raw crops, manifest, contact sheet, and review page to ${outputDir}`);
}

function parseArgs(args) {
  const parsed = { pack: 'pub' };
  const positional = [];

  for (const arg of args) {
    if (arg.startsWith('--padding=')) {
      parsed.padding = parseNumberOption(arg, '--padding=');
    } else if (arg.startsWith('--min-pixels=')) {
      parsed.minPixels = parseNumberOption(arg, '--min-pixels=');
    } else if (arg.startsWith('--alpha-threshold=')) {
      parsed.alphaThreshold = parseNumberOption(arg, '--alpha-threshold=');
    } else if (arg.startsWith('--pack=')) {
      parsed.pack = arg.slice('--pack='.length);
    } else {
      positional.push(arg);
    }
  }

  if (positional[0] && SCENE_PACKS[positional[0]]) {
    parsed.pack = positional[0];
    if (positional[1]) parsed.source = positional[1];
    if (positional[2]) parsed.outputDir = positional[2];
  } else {
    if (positional[0]) parsed.source = positional[0];
    if (positional[1]) parsed.outputDir = positional[1];
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

function parseNumberOption(arg, prefix) {
  const value = Number.parseInt(arg.slice(prefix.length), 10);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`invalid numeric option: ${arg}`);
  }
  return value;
}

function findConnectedRegions(image, config) {
  const { width, height, data } = image;
  const visited = new Uint8Array(width * height);
  const queue = [];
  const regions = [];
  const neighbors = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1],
  ];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const start = y * width + x;
      if (visited[start] || data[start * 4 + 3] <= config.alphaThreshold) continue;

      const region = { minX: x, minY: y, maxX: x, maxY: y, pixelCount: 0 };
      visited[start] = 1;
      queue.length = 0;
      queue.push(start);

      for (let cursor = 0; cursor < queue.length; cursor += 1) {
        const current = queue[cursor];
        const currentX = current % width;
        const currentY = Math.floor(current / width);

        region.pixelCount += 1;
        region.minX = Math.min(region.minX, currentX);
        region.minY = Math.min(region.minY, currentY);
        region.maxX = Math.max(region.maxX, currentX);
        region.maxY = Math.max(region.maxY, currentY);

        for (const [offsetX, offsetY] of neighbors) {
          const nextX = currentX + offsetX;
          const nextY = currentY + offsetY;
          if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) continue;

          const next = nextY * width + nextX;
          if (visited[next] || data[next * 4 + 3] <= config.alphaThreshold) continue;

          visited[next] = 1;
          queue.push(next);
        }
      }

      regions.push(region);
    }
  }

  return regions;
}

function padBounds(region, imageWidth, imageHeight, padding) {
  const x = Math.max(0, region.minX - padding);
  const y = Math.max(0, region.minY - padding);
  const maxX = Math.min(imageWidth - 1, region.maxX + padding);
  const maxY = Math.min(imageHeight - 1, region.maxY + padding);

  return { x, y, width: maxX - x + 1, height: maxY - y + 1 };
}

function boxFromRegion(region) {
  return {
    x: region.minX,
    y: region.minY,
    width: region.maxX - region.minX + 1,
    height: region.maxY - region.minY + 1,
  };
}

function cropImage(source, bounds) {
  const data = Buffer.alloc(bounds.width * bounds.height * 4);

  for (let y = 0; y < bounds.height; y += 1) {
    const sourceStart = ((bounds.y + y) * source.width + bounds.x) * 4;
    const targetStart = y * bounds.width * 4;
    source.data.copy(data, targetStart, sourceStart, sourceStart + bounds.width * 4);
  }

  return { width: bounds.width, height: bounds.height, data };
}

function createContactSheet(images) {
  const gap = 8;
  const columns = Math.max(1, Math.ceil(Math.sqrt(images.length)));
  const rows = Math.ceil(images.length / columns);
  const maxWidth = Math.max(...images.map((image) => image.width));
  const maxHeight = Math.max(...images.map((image) => image.height));
  const cellWidth = maxWidth + gap * 2;
  const cellHeight = maxHeight + gap * 2;
  const sheet = createSolidImage(columns * cellWidth, rows * cellHeight, [31, 41, 55, 255]);

  images.forEach((image, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = column * cellWidth + gap + Math.floor((maxWidth - image.width) / 2);
    const y = row * cellHeight + gap + Math.floor((maxHeight - image.height) / 2);
    blit(image, sheet, x, y);
  });

  return sheet;
}

function createSolidImage(width, height, color) {
  const data = Buffer.alloc(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    data[offset] = color[0];
    data[offset + 1] = color[1];
    data[offset + 2] = color[2];
    data[offset + 3] = color[3];
  }
  return { width, height, data };
}

function blit(source, target, targetX, targetY) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const sourceOffset = (y * source.width + x) * 4;
      const alpha = source.data[sourceOffset + 3] / 255;
      const targetOffset = ((targetY + y) * target.width + targetX + x) * 4;

      target.data[targetOffset] = Math.round(source.data[sourceOffset] * alpha + target.data[targetOffset] * (1 - alpha));
      target.data[targetOffset + 1] = Math.round(source.data[sourceOffset + 1] * alpha + target.data[targetOffset + 1] * (1 - alpha));
      target.data[targetOffset + 2] = Math.round(source.data[sourceOffset + 2] * alpha + target.data[targetOffset + 2] * (1 - alpha));
      target.data[targetOffset + 3] = 255;
    }
  }
}

function createManifest(source, crops) {
  return {
    scenePack: options.pack,
    source: toPosixPath(sourcePath),
    outputDir: toPosixPath(outputDir),
    generatedAt: new Date().toISOString(),
    settings,
    sourceImage: { width: source.width, height: source.height },
    objects: crops.map((crop) => crop.manifest),
  };
}

function createReviewHtml(packName) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(packName)} Object Review</title>
  <style>
    body { margin: 0; background: #111827; color: #f8fafc; font-family: system-ui, sans-serif; }
    header { position: sticky; top: 0; background: #020617; padding: 16px 20px; border-bottom: 1px solid #334155; }
    h1 { margin: 0; font-size: 18px; }
    main { padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 16px; }
    .card { background: #1f2937; border: 1px solid #334155; border-radius: 6px; padding: 10px; }
    .preview { display: grid; place-items: center; height: 136px; background: #0f172a; border-radius: 4px; image-rendering: pixelated; }
    img { max-width: 100%; max-height: 128px; image-rendering: pixelated; }
    .name { margin-top: 8px; font: 12px ui-monospace, SFMono-Regular, Consolas, monospace; color: #facc15; }
    .meta { margin-top: 4px; font-size: 12px; color: #cbd5e1; }
  </style>
</head>
<body>
  <header><h1>${escapeHtml(packName)} raw object review</h1></header>
  <main><div id="grid" class="grid"></div></main>
  <script>
    fetch('manifest.json')
      .then((response) => response.json())
      .then((manifest) => {
        const grid = document.getElementById('grid');
        grid.innerHTML = manifest.objects.map((item) => `
          <article class="card">
            <div class="preview"><img src="${'${item.filename}'}" alt="${'${item.filename}'}"></div>
            <div class="name">${'${item.filename}'}</div>
            <div class="meta">${'${item.width}'} x ${'${item.height}'} px</div>
          </article>
        `).join('');
      })
      .catch((error) => {
        document.getElementById('grid').textContent = `Unable to load manifest.json: ${'${error.message}'}`;
      });
  </script>
</body>
</html>
`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function decodePng(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buffer.subarray(0, 8).equals(signature)) {
    throw new Error('source is not a PNG file');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlaceMethod = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += length + 12;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlaceMethod = data[12];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (bitDepth !== 8) throw new Error(`unsupported PNG bit depth: ${bitDepth}. Expected 8-bit PNG.`);
  if (interlaceMethod !== 0) throw new Error('interlaced PNG files are not supported');

  const channels = getChannelCount(colorType);
  const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
  const rowLength = width * channels;
  const rgba = Buffer.alloc(width * height * 4);
  const previous = Buffer.alloc(rowLength);
  const current = Buffer.alloc(rowLength);
  let inputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filterType = inflated[inputOffset];
    inputOffset += 1;
    inflated.copy(current, 0, inputOffset, inputOffset + rowLength);
    inputOffset += rowLength;

    unfilterScanline(current, previous, channels, filterType);
    copyScanlineToRgba(current, rgba, y, width, channels, colorType);
    current.copy(previous);
  }

  return { width, height, data: rgba };
}

function getChannelCount(colorType) {
  if (colorType === 6) return 4;
  if (colorType === 2) return 3;
  if (colorType === 4) return 2;
  if (colorType === 0) return 1;
  throw new Error(`unsupported PNG color type: ${colorType}. Use an RGB or RGBA PNG.`);
}

function unfilterScanline(current, previous, bytesPerPixel, filterType) {
  for (let index = 0; index < current.length; index += 1) {
    const left = index >= bytesPerPixel ? current[index - bytesPerPixel] : 0;
    const up = previous[index] ?? 0;
    const upLeft = index >= bytesPerPixel ? previous[index - bytesPerPixel] : 0;

    if (filterType === 0) continue;
    if (filterType === 1) current[index] = (current[index] + left) & 0xff;
    else if (filterType === 2) current[index] = (current[index] + up) & 0xff;
    else if (filterType === 3) current[index] = (current[index] + Math.floor((left + up) / 2)) & 0xff;
    else if (filterType === 4) current[index] = (current[index] + paethPredictor(left, up, upLeft)) & 0xff;
    else throw new Error(`unsupported PNG filter type: ${filterType}`);
  }
}

function copyScanlineToRgba(scanline, rgba, y, width, channels, colorType) {
  for (let x = 0; x < width; x += 1) {
    const sourceOffset = x * channels;
    const targetOffset = (y * width + x) * 4;

    if (colorType === 6) {
      rgba[targetOffset] = scanline[sourceOffset];
      rgba[targetOffset + 1] = scanline[sourceOffset + 1];
      rgba[targetOffset + 2] = scanline[sourceOffset + 2];
      rgba[targetOffset + 3] = scanline[sourceOffset + 3];
    } else if (colorType === 2) {
      rgba[targetOffset] = scanline[sourceOffset];
      rgba[targetOffset + 1] = scanline[sourceOffset + 1];
      rgba[targetOffset + 2] = scanline[sourceOffset + 2];
      rgba[targetOffset + 3] = 255;
    } else if (colorType === 4) {
      const gray = scanline[sourceOffset];
      rgba[targetOffset] = gray;
      rgba[targetOffset + 1] = gray;
      rgba[targetOffset + 2] = gray;
      rgba[targetOffset + 3] = scanline[sourceOffset + 1];
    } else if (colorType === 0) {
      const gray = scanline[sourceOffset];
      rgba[targetOffset] = gray;
      rgba[targetOffset + 1] = gray;
      rgba[targetOffset + 2] = gray;
      rgba[targetOffset + 3] = 255;
    }
  }
}

function paethPredictor(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
}

function encodePng(image) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(image.width, 0);
  ihdr.writeUInt32BE(image.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const raw = Buffer.alloc(image.height * (image.width * 4 + 1));
  for (let y = 0; y < image.height; y += 1) {
    raw[y * (image.width * 4 + 1)] = 0;
    image.data.copy(raw, y * (image.width * 4 + 1) + 1, y * image.width * 4, (y + 1) * image.width * 4);
  }

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', zlib.deflateSync(raw)),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return chunk;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
