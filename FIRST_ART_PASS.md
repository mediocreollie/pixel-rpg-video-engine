# First Art Pass

## Pack Name

Pub Friend Environment Pack

## Purpose

Make the current Pub Friend MVP loop visually understandable in a screenshot and in a vertical short-form recording.

The pack should improve world readability and location identity without creating final production art.

## Scope

This is not a full art replacement.

Do not create:

- final character portraits
- final music
- final sound effects
- beach assets
- gym assets
- cinematic camera elements

## Exact Assets Required

### Town Route Assets

1. `town-grass-tile.png`
2. `town-road-tile.png`
3. `town-road-edge-tile.png`
4. `pub-exterior-front.png`
5. `pub-door.png`
6. `pub-sign.png`
7. `town-bush.png`
8. `town-window.png`

### Pub Interior Assets

1. `pub-floor-tile.png`
2. `pub-wall-tile.png`
3. `pub-bar-counter.png`
4. `pub-bar-shelf.png`
5. `pub-tap.png`
6. `pub-table-round.png`
7. `pub-stool.png`
8. `beer-pint.png`
9. `beer-crate.png`
10. `beer-shelf-cluster.png`
11. `pub-wall-sign.png`
12. `pub-warm-light.png`

### Minimal Character Assets

These are lower priority than the pub environment, but useful if time allows.

1. `player-placeholder-idle.png`
2. `friend-jack-placeholder-idle.png`

## Recommended Dimensions

Use dimensions that match the current 16px tile logic.

Tiles:

- `16x16`

Small props:

- `8x8`
- `8x12`
- `12x12`
- `16x16`

Medium props:

- `24x16`
- `32x16`
- `32x24`

Large props:

- `64x32`
- `96x32`
- `128x48`

Character placeholders:

- `16x20` or smaller

Characters should remain small enough that the world dominates the frame.

## Implementation Order

### 1. Beer Pint

Create `beer-pint.png` first.

Expected impact:

- Makes the punchline readable without labels.
- Improves the most important reveal immediately.

### 2. Pub Bar Counter And Shelf

Create:

- `pub-bar-counter.png`
- `pub-bar-shelf.png`
- `pub-tap.png`

Expected impact:

- Makes the pub interior recognisable.
- Adds environmental storytelling.

### 3. Pub Table And Stool

Create:

- `pub-table-round.png`
- `pub-stool.png`

Expected impact:

- Makes the interior feel used by people.
- Reduces empty floor feeling.

### 4. Pub Floor And Wall Tiles

Create:

- `pub-floor-tile.png`
- `pub-wall-tile.png`

Expected impact:

- Replaces flat colour blocks.
- Adds warmth and atmosphere.

### 5. Pub Exterior And Door

Create:

- `pub-exterior-front.png`
- `pub-door.png`
- `pub-sign.png`

Expected impact:

- Makes the destination obvious before entering.
- Strengthens the journey/reveal structure.

### 6. Town Route Tiles

Create:

- `town-grass-tile.png`
- `town-road-tile.png`
- `town-road-edge-tile.png`
- `town-bush.png`

Expected impact:

- Makes following Jack through town feel less like walking through a prototype grid.

### 7. Minimal Character Placeholders

Create:

- `player-placeholder-idle.png`
- `friend-jack-placeholder-idle.png`

Expected impact:

- Improves DS-era readability without stealing focus from the world.

## Expected Visual Impact

After this pack, a screenshot of the Pub Friend loop should make it obvious:

- the player is in a town
- the pub is the destination
- the pub interior is warm and busy
- the reveal is absurd amounts of beer
- the world, not the player sprite, is the joke delivery system

## Storage Targets

Recommended paths:

- `public/assets/locations/`
- `public/assets/characters/`

Do not add copyrighted or traced assets.

Do not commit private reference photos.
