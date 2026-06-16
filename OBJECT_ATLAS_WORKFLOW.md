# Object Atlas Workflow

This project uses AI-generated or handmade transparent PNG object sheets as a quick way to build prop libraries for short RPG video scenes.

The goal is to reduce manual cropping while keeping the output reviewable before anything reaches the game renderer.

## Scene Packs

The object workflow supports these scene packs:

```text
pub
outside-route
beach
park
cafe
```

Each pack has its own source sheet, raw review folder, selection map, and production prop folder. Keep packs separate so a beach pass cannot accidentally overwrite pub assets.

| Pack | Source sheet | Raw output folder |
| --- | --- | --- |
| `pub` | `references/source-sheets/pub_object_sheet.png` | `public/assets/props/pub/raw/` |
| `outside-route` | `references/source-sheets/outside_route_object_sheet.png` | `public/assets/props/outside-route/raw/` |
| `beach` | `references/source-sheets/beach_object_sheet.png` | `public/assets/props/beach/raw/` |
| `park` | `references/source-sheets/park_object_sheet.png` | `public/assets/props/park/raw/` |
| `cafe` | `references/source-sheets/cafe_object_sheet.png` | `public/assets/props/cafe/raw/` |

## Source Sheets

Place source sheets in:

```text
references/source-sheets/
```

Source sheets should be transparent PNG files with each prop separated by transparent space. The extractor detects connected non-transparent pixel regions, so objects that touch each other may be cropped as one object.

## Raw Output

Raw extracted props live in each pack's `raw/` folder, for example:

```text
public/assets/props/pub/raw/
public/assets/props/beach/raw/
```

The raw folder is a review area. Raw extracted files are not used directly in game code.

Running the extractor writes:

```text
object_001.png
object_002.png
...
contact_sheet.png
manifest.json
review.html
```

The script refuses to overwrite existing output files. If you need a new pass, move or clear the reviewed raw output first, or choose a different output folder.

## Extraction Command

Default pub extraction still works:

```bash
npm run extract-objects
```

Pack-specific extraction:

```bash
npm run extract-objects -- pub
npm run extract-objects -- outside-route
npm run extract-objects -- beach
npm run extract-objects -- park
npm run extract-objects -- cafe
```

Optional tuning:

```bash
npm run extract-objects -- beach --padding=2 --min-pixels=32 --alpha-threshold=8
```

The extractor still supports a custom source and output folder for one-off experiments:

```bash
npm run extract-objects -- references/source-sheets/pub_object_sheet.png public/assets/props/pub/raw/
```

## Review Step

After extraction, open the generated review page for the pack:

```text
public/assets/props/<pack>/raw/review.html
```

The review page reads `manifest.json`, displays every extracted `object_###.png`, shows filenames, and includes dimensions when the manifest provides them.

Use this page to compare candidates visually before choosing production props.

## Selection Map

Each pack has its own selection map:

```text
public/assets/props/<pack>/selected-props.json
```

The file maps clean production names to raw candidates:

```json
{
  "table_round": "raw/object_012.png",
  "stool": "raw/object_018.png",
  "beer_mug": "raw/object_025.png"
}
```

Edit this file manually after reviewing the raw crops. The left side becomes the production filename, and the right side points to the selected raw crop.

## Promotion Command

Default pub promotion still works:

```bash
npm run promote-props
```

Pack-specific promotion:

```bash
npm run promote-props -- pub
npm run promote-props -- outside-route
npm run promote-props -- beach
npm run promote-props -- park
npm run promote-props -- cafe
```

This copies selected raw files into that pack's production folder:

```text
public/assets/props/<pack>/
```

For example:

```text
public/assets/props/beach/raw/object_012.png -> public/assets/props/beach/driftwood.png
```

The promotion script never deletes raw files. It refuses to overwrite existing production files unless run with:

```bash
npm run promote-props -- beach --overwrite
```

## Current Boundary

This workflow only prepares, reviews, and promotes object PNG assets. It does not modify Phaser rendering, scene loading, map data, gameplay, dialogue, or controls.

A later asset pass can wire approved production props into an object atlas or placement workflow after the promoted files have been reviewed.
