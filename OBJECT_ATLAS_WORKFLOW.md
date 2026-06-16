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

The raw folder is a review area. Raw extracted files are not used directly in game code.

Running the extractor writes:

```text
object_001.png
object_002.png
...
contact_sheet.png
manifest.json
```

The script refuses to overwrite existing output files. If you need a new pass, move or clear the reviewed raw output first, or choose a different output folder.

## Extraction Command

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

After extraction, open:

```text
public/assets/props/pub/raw/review.html
```

The review page reads `manifest.json`, displays every extracted `object_###.png`, shows filenames, and includes dimensions when the manifest provides them.

Use this page to compare candidates visually before choosing production props.

## Selection Map

Selected pub props are listed in:

```text
public/assets/props/pub/selected-props.json
```

The file maps clean production names to raw candidates:

```json
{
  "table_round": "raw/object_012.png",
  "stool": "raw/object_018.png",
  "beer_mug": "raw/object_025.png",
  "bar_counter": "raw/object_031.png",
  "bottle_shelf": "raw/object_044.png"
}
```

Edit this file manually after reviewing the raw crops. The left side becomes the production filename, and the right side points to the selected raw crop.

## Promotion Command

Promote selected props with:

```bash
npm run promote-props
```

This copies selected raw files into:

```text
public/assets/props/pub/
```

For example:

```text
raw/object_012.png -> table_round.png
```

The promotion script never deletes raw files. It refuses to overwrite existing production files unless run with:

```bash
npm run promote-props -- --overwrite
```

## Current Boundary

This workflow only prepares, reviews, and promotes object PNG assets. It does not modify Phaser rendering, scene loading, map data, gameplay, dialogue, or controls.

A later asset pass can wire approved production props into an object atlas or placement workflow after the promoted files have been reviewed.
