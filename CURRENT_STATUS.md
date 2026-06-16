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
- The pub interior has placeholder bar, table, beer, shelf, stool, wall sign, light, and crate-like prop dressing for the punchline.
- The pub scene now has a first tileset workflow through `public/maps/pub_mvp.json` and `public/assets/tilesets/pub_mvp_tileset.png`.
- The pub MVP tileset asset is present in the GitHub repository at `public/assets/tilesets/pub_mvp_tileset.png`.
- Generated pub rendering is now fallback only when the tilemap or tileset cannot be loaded.
- Pub visual direction is now asset-led rather than rectangle-led.
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

The Pub Friend interior now opts into a simple tilemap-compatible asset workflow.

What changed:

- Added `TILED_WORKFLOW.md` to document the asset-led scene workflow.
- Added `public/maps/pub_mvp.json` as the first pub test map.
- Pointed `public/locations/pub.json` at `public/maps/pub_mvp.json` and `public/assets/tilesets/pub_mvp_tileset.png`.
- Updated `WorldScene` so locations with a tilemap and tileset render from tile frames instead of generated rectangle props.
- Kept the existing generated pub map and props as fallback if the map or tileset is missing.

Visual effect:

The pub is now set up to move toward small generated or handmade tilesets. The target direction is asset-led interior composition, with generated rectangles preserved only as a resilience path while the tileset workflow settles.

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
24. Confirm the beer punchline is visually obvious.
25. Confirm the pub uses the tileset map when `public/assets/tilesets/pub_mvp_tileset.png` is available.
26. Confirm the generated pub fallback still loads if the tilemap or tileset is missing.
27. Press `Escape` and confirm the scene selector returns.
28. Start Pub Friend again and confirm the scene still loads.
29. Start Pub Friend, press `R`, and confirm the scene restarts.
30. Press `H` and confirm the recording overlay hides/shows.
31. Press `?` and confirm the controls screen opens.
32. Toggle 9:16 canvas mode and repeat the key checks for readability.

## Next Recommended Task

Run GitHub Actions and manually check the Pub Friend pub interior before expanding beach or gym content.
