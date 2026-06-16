# Tiled Workflow

This project will use small generated or handmade tilesets for video scenes. The goal is not to replace the whole engine at once; it is to move important scenes away from debug-style rectangles and toward reusable DS-era pixel RPG assets.

Tilesets and asset sheets live in `public/assets/tilesets/`.

Maps live in `public/maps/`.

`public/assets/tilesets/pub_mvp_tileset.png` is the first visual benchmark for this workflow, but it is not currently a clean 16x16 grid tileset. It is a mixed-size reference/asset sheet with larger furniture and prop art, so Phaser should not slice it into uniform 16x16 frames by default.

For now, the Pub Friend scene keeps generated pub rendering as the active default through `useTilemap: false` in `public/locations/pub.json`. The generated renderer is the stable path for recording and testing.

Future Phaser map rendering should use either:

- A proper grid-sliceable Tiled-style tileset with consistent tile dimensions and spacing.
- A simple tilemap-compatible layout that references known grid frames.
- An object-atlas workflow that can place larger furniture and prop sprites without forcing them into 16x16 tiles.

Generated rectangle rendering remains available as the fallback path. Tilemap support should be re-enabled only when the pub has a proper grid tileset or object atlas prepared for the renderer.
