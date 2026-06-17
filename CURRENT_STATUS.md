# Current Status

## Current Working State

- The project is a Phaser 3 / Vite pixel RPG video engine for short, screen-recordable social media scenes.
- The app boots through `BootScene`, loads `public/scenes/manifest.json`, and opens the DS-era `MenuScene`.
- `Pub Friend` remains the current priority MVP flow.
- `Beach Day` is listed in the scene manifest and has a first asset-led beach destination.
- Scene content is still JSON-driven through `public/scenes/`, `public/locations/`, `public/characters/`, and `public/schemas/`.
- `Escape` returns gameplay to the scene selector.
- `R` restarts the current gameplay scene.
- `H` hides or shows the recording overlay and persists that setting.
- `?` opens the controls screen.

## Pub Friend Flow

- `Pub Friend` starts in `public/locations/town.json`.
- The town location is now a town-edge / outside-route connector using `propAssetPack: "outside-route"`.
- Jack spawns at the `townCenter` NPC spawn point.
- Jack's scripted path still leads along the route toward the pub door.
- The `pubDoor` exit still points to `public/locations/pub.json` and spawns the player at the pub door.
- The pub uses `useTilemap: false`, so the broken mixed-size tileset slicing path remains disabled.
- The pub uses promoted named PNG props from `public/assets/props/pub/` with generated shape fallbacks when a named image is missing.
- The pub destination skips actors without a valid destination spawn, so Jack no longer causes a missing `townCenter` warning inside the pub.

## Asset-Led Scene State

- Pub props are promoted production assets in `public/assets/props/pub/` and are not loaded from `raw/object_###.png` paths.
- Outside-route props are promoted production assets in `public/assets/props/outside-route/`.
- Beach props are promoted production assets in `public/assets/props/beach/`.
- `WorldScene` supports location prop packs through `propAssetPack`.
- `WorldScene` preloads the first production prop packs for `pub`, `outside-route`, and `beach`.
- Missing named PNG props fall back to generated shape props instead of crashing the scene.
- The object extraction and promotion scripts support separate scene packs for `pub`, `outside-route`, `beach`, `park`, and `cafe`.

## Tilemap Status

- `public/maps/pub_mvp.json` and `public/assets/tilesets/pub_mvp_tileset.png` remain in the repository as future tilemap workflow references.
- `pub_mvp_tileset.png` is not a strict 16x16 grid tileset. It is a mixed-size visual reference / asset sheet.
- Pub tilemap rendering remains future opt-in support and only runs when a location explicitly sets `useTilemap: true`.
- Generated map rendering plus named prop images is the current stable path.

## RPG Layout Grammar Pass

The current Pub Friend route and pub interior have been retuned around RPG map readability rather than large placed asset images.

Layout rules now applied:

- The player is the scale anchor.
- The camera should show a playable area, not a close-up of props.
- Ground, path, and floor dressing should read as repeated tile-like pieces.
- Props should sit on logical grid positions and support route, visual, or story logic.
- Large assets should be clamped to sensible tile footprints.
- Boundaries should shape where the player understands they can walk.
- Signs, lamps, doors, paths, and landmarks should guide the viewer toward the destination.
- Trees, hedges, fences, walls, and building pieces should frame edges instead of floating in the route centre.
- Interior objects should form zones: entrance lane, wall fixtures, bar service, seating clusters, and punchline area.

Scale reference now used:

- Player and NPCs should feel about one tile wide and roughly 1.5 to 2 tiles tall.
- Small props should be roughly 0.5 to 1 player height.
- Tables should feel like 2x2 or 3x2 tile objects, not half-screen set dressing.
- Signs, lamps, chairs, stools, and mugs should not dominate the camera.
- Bar counters and building pieces can be larger, but they should form environmental zones rather than fill the viewport.
- Trees and building pieces can command space only when they sit at boundaries or scene edges.

## Town Edge Route Pass

What changed:

- `cameraZoom` was reduced to `1.45` so more of the route is visible at once.
- `playerScale` was reduced to `0.9` so the player and Jack read closer to RPG map scale.
- `propScaleMultiplier` was reduced to `0.78` so signs, lamps, trees, fences, and building accents no longer dominate the frame.
- The visual route spine now reads as spawn -> Jack -> repeated path tiles -> pub direction cue -> pub entrance.
- Large path pieces were replaced with smaller repeated path accents.
- Pub entrance building pieces were reduced so they imply a structure without swallowing the route.
- Route sign, lamp, mailbox, signpost, notice board, and bench were reduced to map-object scale.
- Fences, hedges, bushes, trees, rocks, and flowers now act more clearly as route edges and boundary support.

Expected visual effect:

The town connector should read more like a Pokemon-style route: a small player on a readable path with destination cues and boundary framing, rather than a close-up collage of oversized props.

## Pub Interior Pass

What changed:

- `cameraZoom` was reduced to `1.55` so the bar, seating area, entrance lane, and wall fixtures are visible together more often.
- `playerScale` was reduced to `0.9`.
- `propScaleMultiplier` was reduced to `0.78`.
- The single large floor prop was replaced by repeated smaller floor pieces so the room reads more like a tiled RPG interior.
- Wall, sign, lamp, window, and fireplace assets were reduced to wall-feature scale.
- Bottle shelf, bar counter, bar corner, and keg/tap assets were reduced into a clear back-wall service zone.
- Tables now read closer to 2x2 tile furniture footprints.
- Stools, chairs, barrel, plant, rug, and door were scaled down to support clear walkable lanes.
- The entrance lane from the lower doorway toward the bar and seating remains open.

Expected visual effect:

The pub should feel closer to a Stardew/Pokemon-style interior: visible zones, repeated floor logic, furniture clusters, and a clear walkable route through the room.

## Beach Destination Pass

- `public/locations/beach.json` uses `propAssetPack: "beach"`.
- The beach destination uses promoted named PNG props for sand, shoreline, water, hut/signage, boardwalk/entry details, and beach-day clusters.
- Walkable sand fills the arrival/play area.
- Blocked water sits along the top and right edge.
- Props are grouped around arrival, hut, shoreline, and relaxation zones.

## Validation Status

The local command runner is still blocked before npm can start with:

```text
helper_unknown_error: apply deny-read ACLs
```

Because of that, these have not been verified by local command execution in this session:

- `npm run validate-content`
- `npm run build`
- Browser/manual Phaser runtime behaviour
- Exact camera framing in 9:16 mode

GitHub Actions validation/build exists through `.github/workflows/validate.yml`, but this pass still needs the next CI result or a working local runner to confirm validation and build.

## Manual Test Checklist

1. Run `npm install` if dependencies are not installed.
2. Run `npm run validate-content`.
3. Run `npm run build`.
4. Run `npm run dev`.
5. Open the local Vite URL.
6. Select `Pub Friend`.
7. Confirm the title card appears.
8. Confirm town loads as the outside-route / town-edge connector.
9. Confirm the camera shows more of the route and destination context.
10. Confirm the player and Jack are readable but smaller than before.
11. Confirm the repeated path leads visually from spawn and Jack toward the pub door.
12. Confirm the route sign, lamp, mailbox, building pieces, fences, trees, and hedges do not dominate the frame.
13. Talk to Jack and confirm dialogue still works.
14. Confirm Jack walks toward the pub door through the connector route.
15. Enter the pub door.
16. Confirm the pub interior loads with no random tilemap fragments.
17. Confirm the pub camera shows more of the room at once.
18. Confirm bar, seating, wall fixtures, rug, and entrance lane read as separate interior zones.
19. Confirm the player can move through the pub and the beer punchline remains visible.
20. Press `Escape`, `R`, `H`, and `?` to confirm recording controls still work.
21. Select `Beach Day` and confirm the beach scene still loads.

## Next Recommended Task

Run browser or CI validation for the latest layout pass, then tune from screenshots in vertical recording mode before moving on to another destination scene.
