# Object Atlas Workflow

This project uses AI-generated or handmade transparent PNG object sheets as a quick way to build prop libraries for short RPG video scenes.

The goal is to reduce manual cropping while keeping the output reviewable before anything reaches the game renderer.

## Source Sheets

Place source sheets in:

```text
references/source-sheets/
```

Example:

```text
references/source-sheets/pub_object_sheet.png
```

Source sheets should be transparent PNG files with each prop separated by transparent space. The extractor detects connected non-transparent pixel regions, so objects that touch each other may be cropped as one object.

## Raw Output

Raw extracted props for the pub live in:

```text
public/assets/props/pub/raw/
```

The raw folder is a review area. It is not wired into game rendering yet.

Running the extractor writes:

```text
object_001.png
object_002.png
...
contact_sheet.png
manifest.json
```

The script refuses to overwrite existing output files. If you need a new pass, move or clear the reviewed raw output first, or choose a different output folder.

## Command

Default pub extraction:

```bash
npm run extract-objects
```

This reads:

```text
references/source-sheets/pub_object_sheet.png
```

And writes to:

```text
public/assets/props/pub/raw/
```

Custom source and output folder:

```bash
npm run extract-objects -- references/source-sheets/pub_object_sheet.png public/assets/props/pub/raw/
```

Optional tuning:

```bash
npm run extract-objects -- references/source-sheets/pub_object_sheet.png public/assets/props/pub/raw/ --padding=2 --min-pixels=32 --alpha-threshold=8
```

## Review Step

After extraction:

1. Open `contact_sheet.png` to inspect the full batch quickly.
2. Check `manifest.json` for crop sizes and source bounding boxes.
3. Review individual `object_###.png` files.
4. Rename, curate, or rebuild approved assets in a future non-raw folder.

## Current Boundary

This workflow only prepares raw object crops. It does not modify Phaser rendering, scene loading, map data, gameplay, dialogue, or controls.

A later asset pass can promote approved props into a proper object atlas or placement workflow after the raw crops have been reviewed.
