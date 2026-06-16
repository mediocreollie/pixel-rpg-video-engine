# Tiled Workflow

This project will use small generated or handmade tilesets for video scenes. The goal is not to replace the whole engine at once; it is to move important scenes away from debug-style rectangles and toward reusable DS-era pixel RPG assets.

Tilesets live in `public/assets/tilesets/`.

Maps live in `public/maps/`.

`public/assets/tilesets/pub_mvp_tileset.png` is the first visual benchmark for this workflow. The Pub Friend interior should use that tileset when it is available, with `public/maps/pub_mvp.json` describing the room layout.

Phaser should render these scene maps through Tiled-style maps or a simple tilemap-compatible JSON layout. The current pub MVP map uses readable character rows plus a legend so layout changes can stay content-driven while the engine remains small.

Generated rectangle rendering is now fallback only for the pub. It should remain available so the scene can still load if a map or tileset asset is missing, but visual progress should now be asset-led rather than rectangle-led.
