# Next Visual Pass

## Purpose

This is a planning-only visual-state audit. It does not add features, create assets, change gameplay, or modify implementation code.

The goal is to rank the next visual improvements that most directly support the project vision: fast creation of funny, screen-recordable DS-era RPG scenes where the world delivers the joke.

## Sources Reviewed

- `ART_DIRECTION.md`
- `VISUAL_AUDIT.md`
- `PROJECT_VISION.md`
- `REFERENCE_ANALYSIS.md`
- `CURRENT_STATUS.md`
- `public/scenes/manifest.json`
- `public/scenes/pub.json`
- `public/locations/town.json`
- `public/locations/pub.json`
- `public/locations/beach.json`
- `public/locations/gym.json`
- `public/characters/friend-jack.json`
- `src/main.js`
- `src/game/WorldScene.js`

## Reference Access Note

`references/` exists in the GitHub repository, but the current GitHub file API exposed through this session confirms it only as a directory and does not provide a recursive image listing or image contents.

This pass therefore compares the current state against the written reference interpretation in `REFERENCE_ANALYSIS.md` and the visual rules in `ART_DIRECTION.md`. Direct image-specific reference findings should be added later when the reference images can be inspected.

## Current Visual State

### Locations

Current reusable locations are:

- Town
- Pub
- Beach
- Gym

Town is the main route hub. It contains grass, roads, water, pub/gym/beach exits, and a few labelled props. It is functional but still reads as a prototype map with broad open areas and text labels.

Pub is the strongest current visual location. It has warm colours, generated beer props, table props, a bar prop, and the core beer punchline. It still lacks cosy interior storytelling such as stools, shelves, taps, wall decor, varied furniture, floor texture, and warm lighting accents.

Beach has the right basic sand/water structure and a large diagonal ocean mass, but relies on labelled props and does not yet feel like a scenic reveal.

Gym has repeated mat rows and labelled equipment props. It communicates the concept, but not yet the exaggerated interior density needed for a visual joke.

### Player Scale

The player is generated in `WorldScene.js` from simple rectangles. The body is about 10 pixels wide, with head/body/legs making a small readable figure against 16px tiles. The camera uses zoom 3.

This is broadly compatible with the 5-10% screen-height target from `ART_DIRECTION.md`, especially in portrait mode, but the player can feel more visually important than intended because the environment is still sparse.

### Environment Density

Environment density is currently the main weakness.

The maps are structurally usable, but many spaces use large blocks of flat colour. Important exits and landmarks still rely partly on labels. Pub density has improved, but town, beach, and gym are still closer to debug-readable than screenshot-readable.

### Interior Design

The pub is the key interior and the correct first focus. It has the beginning of a warm tavern palette, but it needs more furniture variation, wall detail, shelves, lighting, and object clusters before it feels cosy or lived in.

The gym is also an interior, but it should remain second priority until Pub Friend is visually strong.

## Ranked Next 10 Visual Improvements

### 1. Pub Interior Density Pack - Complete

Status:

Complete. Implemented in `public/locations/pub.json` with additional shelf bands, bottle shapes, warm wall accents, tap-like bar details, stools, crate-like clutter, and extra beer density.

Why it matters:

Pub Friend is the MVP recording loop, and the pub is where the visual punchline lands. The art direction says interiors should feel cosy, lived in, and readable before dialogue explains them.

Expected visual gain:

High. Adding stools, shelves, taps, wall signs, drink clusters, and small table variation makes the pub read more like a real place instead of a warm prototype room.

Estimated difficulty:

Medium. This pass stayed JSON-driven and placeholder-friendly.

### 2. Pub Punchline Composition Pass

Why it matters:

The joke is not just that beer exists; it is that the pub contains an absurd amount of beer. The current rows are readable, but the reveal could be staged more clearly.

Expected visual gain:

High. Better clustering, foreground/background distribution, and visible beer piles near the bar would make the punchline instant in a short clip.

Estimated difficulty:

Low to medium. This can mostly be planned as location layout work using existing beer/table/bar placeholder rendering.

### 3. Town Route Readability Pack

Why it matters:

The journey to the pub is part of the comedy structure: normal request, journey, reveal, escalation. The route should be understandable from roads, building shapes, greenery, and destination framing rather than labels.

Expected visual gain:

High. A clearer pub exterior, better road edges, windows, bushes, signs, and suburban landmarks would make the walk feel like a real DS-era RPG scene.

Estimated difficulty:

Medium. It likely requires both location JSON changes and a small set of reusable town prop/tile assets later.

### 4. Replace Text-Label Dependence With Silhouettes

Why it matters:

`ART_DIRECTION.md` says screenshots should communicate location and joke without context. Current props such as `PUB`, `ROAD`, `GYM`, `BEACH`, `TOWEL`, `SUN`, `OCEAN`, `BENCH`, and `WEIGHTS` still lean on labels.

Expected visual gain:

High. Replacing labels with recognisable shapes will immediately make the project feel less like a debug map and more like a DS-era RPG world.

Estimated difficulty:

Medium. Some labels can be removed once silhouettes improve; others need new prop shapes or assets first.

### 5. Pub Floor And Wall Texture Pass

Why it matters:

The pub uses warm colours, but flat floor and wall blocks limit atmosphere. Interior design guidance calls for wood, lighting, decoration, and a room that tells a story before dialogue begins.

Expected visual gain:

Medium to high. Simple planks, darker wall bands, amber highlights, and edge shadows would make the room feel warmer and more finished.

Estimated difficulty:

Medium. Tile texture needs care so it supports readability without visual noise.

### 6. Character Silhouette Scale Pass

Why it matters:

Player and NPC scale is acceptable, but both still read as rectangle people. The art direction says characters should be recognisable through silhouette, hair, outfit colour, or accessories, while staying secondary to the world.

Expected visual gain:

Medium. A small DS-era silhouette pass for the player and Jack would improve charm without shifting focus away from locations.

Estimated difficulty:

Medium. This should wait until the pub and town have enough density that characters do not become the main visual interest.

### 7. Beach Scenic Reveal Foundation

Why it matters:

Beach Day is one of the core future video formats. The beach should be bright, open, and instantly readable as a scenic reveal, not just sand plus labelled ocean.

Expected visual gain:

Medium. A stronger shoreline, water edge, beach props, and reveal framing would establish a second reusable visual template after Pub Friend.

Estimated difficulty:

Medium. It needs composition work more than complex systems, but should wait until Pub Friend is visually stronger.

### 8. Gym Interior Identity Pack

Why it matters:

The gym is already in the manifest and map set, but it currently depends on labelled equipment and repeated rows. For the `quick session` joke, the gym needs exaggerated equipment density.

Expected visual gain:

Medium. Benches, racks, mirrors, mats, heavy equipment silhouettes, and repeated over-the-top props would make the joke readable.

Estimated difficulty:

Medium. It is mostly prop and layout work, but less urgent than pub and town because Pub Friend is the current MVP.

### 9. Vertical 9:16 Visual QA Pass

Why it matters:

The engine is for screen-recordable short-form video. Portrait mode exists at 180x320, but the docs still note that actual framing, overlays, and punchline readability need visual QA.

Expected visual gain:

Medium. This pass would identify whether the player/NPC scale, dialogue box, pub reveal, and route framing work on a phone-shaped canvas.

Estimated difficulty:

Low to medium. It is mostly review and adjustment planning, but changes should be based on real screenshots once the app can be visually inspected.

### 10. Reusable Prop Vocabulary Plan

Why it matters:

The project goal is to create new videos quickly through JSON scenes. A small reusable prop vocabulary for pubs, town streets, beach scenes, and gyms would reduce future content effort.

Expected visual gain:

Medium. It would make future scenes easier to dress without adding bespoke systems or one-off maps.

Estimated difficulty:

Low for planning, medium for implementation. The next step is to define the vocabulary before creating assets.

## Recommended Order

1. Pub Interior Density Pack - complete
2. Pub Punchline Composition Pass
3. Town Route Readability Pack
4. Replace Text-Label Dependence With Silhouettes
5. Pub Floor And Wall Texture Pass
6. Character Silhouette Scale Pass
7. Beach Scenic Reveal Foundation
8. Gym Interior Identity Pack
9. Vertical 9:16 Visual QA Pass
10. Reusable Prop Vocabulary Plan

## Next Practical Step

Move to the Pub Punchline Composition Pass. The pub now has more lived-in interior dressing, so the next improvement should stage the absurd beer quantity more clearly in the reveal area.

Do not begin beach, gym, or character polish until the Pub Friend route and pub reveal pass the screenshot test.
