# Current Status

## What Currently Works By Static Review

- The app boots through `BootScene`, loads `public/scenes/manifest.json`, then opens the DS-era `MenuScene`.
- `Pub Friend` is listed in the manifest and is the current priority MVP test scene.
- The menu can display scene title, description, starting location, and placeholder/custom asset status.
- Selecting `Pub Friend` starts `WorldScene` with the pub scene ID.
- The title card is loaded from `public/scenes/pub.json` and appears at the start of the town scene.
- The town location loads from `public/locations/town.json`.
- The player spawns at the town default spawn.
- Jack spawns at the `townCenter` NPC spawn point.
- Dialogue comes from the pub scene `dialogueSequence`.
- Jack's dialogue colour and generated portrait data come from `public/characters/friend-jack.json`.
- Jack's scripted path leads along the road toward the pub door.
- The pub door exit points to the `pub` location.
- Entering the pub switches to `public/locations/pub.json`.
- The pub interior currently uses the stable generated pub renderer.
- The pub scene has a first future tileset workflow through `public/maps/pub_mvp.json` and `public/assets/tilesets/pub_mvp_tileset.png`.
- The pub MVP tileset asset is present in the GitHub repository at `public/assets/tilesets/pub_mvp_tileset.png`.
- `public/locations/pub.json` now sets `useTilemap: false`, so generated pub rendering is the active default.
- Pub tilemap rendering remains in code as future opt-in support and only runs when a location explicitly sets `useTilemap: true`.
- Pub visual direction remains asset-led, but the current PNG is treated as a reference/asset sheet rather than a grid tileset.
- The pub now preloads and places a first pass of promoted named object-atlas PNGs from `public/assets/props/pub/`.
- Missing named pub PNGs fall back to generated shape props instead of crashing the scene.
- The object extraction and promotion scripts now support separate scene packs for `pub`, `outside-route`, `beach`, `park`, and `cafe`.
- Each supported scene pack has an independent `public/assets/props/<pack>/selected-props.json` promotion map.
- The camera remains player-follow only and is constrained to the active map bounds.
- `Escape` returns from gameplay to the scene selector.
- `R` restarts the current gameplay scene while gameplay is active.
- `H` hides or shows the recording overlay and persists that setting.
- `?` opens the controls screen.

## Pub Visual Pass Before/After

Before:

- The Pub Friend loop was readable mostly through text labels like `BEER`, `TABLE`, and `DOOR`.
- The pub punchline worked conceptually, but it looked like a debug layout rather than a DS-era RPG scene.

After:

- Beer props render as simple generated pint-glass placeholders.
- Tables render as table silhouettes with beer props on top.
- The bar renders as a warm counter with beer shapes.
- The pub door renders as a door shape instead of a text-labelled rectangle.

Visual problem solved:

The main Pub Friend punchline now reads more visually and less textually. This matters because short-form video viewers should understand the pub reveal quickly, especially in 9:16 recording mode.

## Pub Interior Density Pass

Completed visual improvement #1 from `NEXT_VISUAL_PASS.md`.

What changed:

- Added visible shelf bands behind the bar.
- Added small bottle shapes on the shelves.
- Added warm wall sign/light blocks on both sides of the pub.
- Added rows of tap-like bar details.
- Added stools around both tables.
- Added crate-like stacked props near the right side of the pub.
- Added a little more beer density near the reveal area.

Visual effect:

The pub interior should now feel busier, warmer, and more lived in while still using placeholder-friendly JSON props. The scene is closer to the art direction because the environment carries more of the pub identity before dialogue explains it.

## Pub Tileset Workflow Pass

The Pub Friend interior has a simple tilemap-compatible workflow prepared, but tilemap rendering is disabled by default.

What changed:

- Added `TILED_WORKFLOW.md` to document the asset-led scene workflow.
- Added `public/maps/pub_mvp.json` as the first pub test map.
- Pointed `public/locations/pub.json` at `public/maps/pub_mvp.json` and `public/assets/tilesets/pub_mvp_tileset.png`.
- Added `useTilemap: false` to `public/locations/pub.json` so the generated pub renderer stays active.
- Updated `WorldScene` so locations with `useTilemap: true`, a tilemap, and a tileset can render from tile frames.
- Kept the existing generated pub map and props as the stable default and fallback.

Visual effect:

The pub is stable again and no longer displays random sliced fragments from `pub_mvp_tileset.png`. The tileset path remains documented for future work, but the current PNG is treated as a visual benchmark/reference sheet rather than a render-ready 16x16 tileset.

## Pub Object Asset Pass

The Pub Friend interior now uses promoted production PNGs from the object-atlas workflow while staying on the generated map renderer.

What changed:

- Added a pub-only preload list for the first named production assets in `public/assets/props/pub/`.
- Added safe optional image prop placement in `WorldScene`.
- Updated `public/locations/pub.json` to place named PNG props for wall depth, floor dressing, bar pieces, tables, stools, shelves, barrels, fireplace, signage, lamps, plants, windows, rugs, and the door.
- Kept generated shape fallbacks on the same prop entries so missing PNGs do not crash the pub scene.
- Kept `useTilemap: false`; the broken mixed-size tileset slicing path is still not active.

Visual effect:

The pub should now read less like rectangle placeholders and more like a DS-era RPG interior built from reusable object sprites, while preserving the Pub Friend flow, dialogue, player movement, camera follow, and punchline reveal.

## Multi-Scene Object Workflow

The object atlas tooling now works across multiple scene packs instead of only the pub.

What changed:

- `npm run extract-objects` still defaults to pub.
- `npm run extract-objects -- <pack>` can extract `pub`, `outside-route`, `beach`, `park`, or `cafe` source sheets into separate raw folders.
- Extraction writes `object_###.png`, `contact_sheet.png`, `manifest.json`, and `review.html` for each pack.
- `npm run promote-props` still defaults to pub.
- `npm run promote-props -- <pack>` promotes selected raw assets for the chosen pack only.
- New empty selection maps were added for `outside-route`, `beach`, `park`, and `cafe`.

Boundary:

This is a workflow/tooling change only. No game rendering was added for the new packs, and existing pub assets were not deleted.

## Pub Tilemap Debug Pass

A temporary pub-only debugging pass was added to diagnose the failed tileset render.

Runtime console logs can report:

- Pub map path.
- Pub tileset path.
- Whether the map JSON loaded.
- Whether the tileset texture loaded.
- Tile width and tile height used by the Phaser spritesheet loader.
- Tileset image width, image height, frame count, and first frame names as Phaser sees them.
- Number of map layers and objects.
- Number of rendered tiles.
- Unique map symbols and frame IDs.
- The first 20 tile frame IDs being rendered.
- Whether the highest frame ID used by the map fits inside the loaded tileset frame count.

These logs now only matter when `useTilemap: true` is set for a location.

Static map inspection:

- `public/maps/pub_mvp.json` expects `tileSize: 16`.
- Its legend maps visible tiles to frame IDs `0` through `7`, with `-1` used for empty overlay cells.
- The map contains varied tile symbols and frame IDs; it is not only one repeated tile.

Tileset slicing status:

- The GitHub API confirms `public/assets/tilesets/pub_mvp_tileset.png` is a binary PNG file.
- Browser testing showed the PNG is not a strict 16x16 grid tileset.
- The PNG is a good art direction reference and asset sheet, but it contains mixed-size furniture/prop art with uneven spacing.
- Tilemap rendering is disabled until a proper grid tileset or object atlas is prepared.

## Pub Destination NPC Handling

The pub destination does not need Jack to spawn at the town-only `townCenter` point.

`WorldScene` now skips actors without a valid spawn silently when the current location is the scene's destination location. This prevents the missing `townCenter` spawn warning in the pub while keeping normal spawn warnings active for route locations such as town.

## Untested Due To Sandbox Command Issue

The local command runner is still blocked before npm can start with:

```text
helper_unknown_error: apply deny-read ACLs
```

Because of that, these have not been verified by local command execution in this session:

- `npm run validate-content`
- `npm run build`
- Browser/manual Phaser runtime behaviour
- Actual keyboard feel in the canvas
- Exact camera framing in 9:16 mode

GitHub Actions validation/build has been added separately through `.github/workflows/validate.yml`.

## Manual Test Checklist

1. Run `npm install` if dependencies are not installed.
2. Run `npm run validate-content`.
3. Run `npm run build`.
4. Run `npm run dev`.
5. Open the local Vite URL.
6. Confirm the scene selector appears before gameplay.
7. Confirm `Pub Friend` is selectable.
8. Confirm the menu shows the Pub Friend title, description, starting location, and asset status.
9. Press `Space` or `Enter` to start Pub Friend.
10. Confirm the title card appears.
11. Press `Space` or wait for the title card duration.
12. Confirm town loads and the player appears.
13. Confirm Jack appears near the player.
14. Walk around town and confirm the camera follows the player without showing outside the map.
15. Stand near Jack and press `Space` or `Enter`.
16. Confirm the DS-era dialogue box opens.
17. Confirm the typewriter effect runs.
18. Press `Space` mid-line and confirm the line completes instantly.
19. Press `Space` again and confirm dialogue closes.
20. Confirm Jack starts walking toward the pub door.
21. Follow Jack and confirm the player can move freely along the route.
22. Walk into the highlighted pub door.
23. Confirm the pub interior loads.
24. Confirm the pub uses the generated renderer by default and shows no random sliced tile fragments.
25. Confirm the pub displays named production PNG props when those files are available.
26. Confirm the beer punchline is visually obvious.
27. Confirm no missing `townCenter` spawn warning appears in the pub.
28. Press `Escape` and confirm the scene selector returns.
29. Start Pub Friend again and confirm the scene still loads.
30. Start Pub Friend, press `R`, and confirm the scene restarts.
31. Press `H` and confirm the recording overlay hides/shows.
32. Press `?` and confirm the controls screen opens.
33. Toggle 9:16 canvas mode and repeat the key checks for readability.

## Next Recommended Task

Run the Pub Friend browser test to confirm the generated pub is stable with the new object-atlas props, then tune object scale and placement based on a real screenshot before adding more assets.
