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
- Jack's scripted path now follows the rebuilt sketch-based route spine toward the pub door.
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
- `WorldScene` also preloads any explicit `assetPack` named on individual props, so support-pack details can render without replacing the main location pack.
- Missing named PNG props fall back to generated shape props instead of crashing the scene.
- The object extraction and promotion scripts support separate scene packs for `pub`, `outside-route`, `beach`, `park`, and `cafe`.
- The object extraction and promotion scripts also support expansion packs for `pub-accessory` and `outside-route-additional`.
- The support packs write to their own folders and do not replace existing `pub` or `outside-route` production assets.
- Empty selection maps now exist at `public/assets/props/pub-accessory/selected-props.json` and `public/assets/props/outside-route-additional/selected-props.json`.

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

## Sketch-Based Town Route Rebuild

The Town Edge Route has been rebuilt around the attached sketch plan instead of incremental prop placement.

Composition order now used:

- Main walkable route first: a single continuous left-to-right path begins near the player and Jack, then bends into the pub entrance.
- Pub destination second: the pub building, doorway, lamp, sign, and entrance shadows sit on the right side as the clear story destination.
- Boundaries third: trees, hedges, bushes, fences, rough ground, and a small water edge frame the route instead of floating in the middle of it.
- Small details last: path edges, dirt patches, tufts, flowers, and shadows are used as accents near route edges, bushes, and building edges.

What changed:

- Player spawn moved to the left/centre-left side of the route.
- Jack spawn moved onto the same route spine.
- The old broken block-feeling path fragments were replaced by a simpler continuous route.
- `pubDoor` moved to the right-side pub entrance at the end of the route.
- Jack's scripted movement points were updated to follow the rebuilt route and turn into the pub doorway.
- Left-side trees and hedges now read as the natural boundary from the sketch.
- Lower route bushes, flowers, fence support, rough ground, and small water/edge detail support the route without cluttering it.

Expected visual effect:

The town should now read more like a Pokemon-style route to a destination: start on the left, follow the obvious path, pass natural boundaries and route markers, and arrive at the pub on the right.

## Town Edge Route Support Polish

The town route now uses named support assets from `public/assets/props/outside-route-additional/` for a light readability pass.

What changed:

- Added subtle path-edge accents around the existing path instead of rebuilding the route.
- Added small dirt patches, grass tufts, tiny flowers, small bushes, and ground shadows to break up flat grass.
- Added doorway/building shadow support near the pub entrance so the pub cue feels more grounded.
- Added small fence support pieces where existing fences already define boundaries.
- Kept the core route spine unchanged: spawn -> Jack -> path -> pub cue -> pub entrance.
- Kept the additions sparse so Jack, the player, and the pub transition remain readable.

Expected visual effect:

The Town Edge Route should feel less flat and more naturally edged while still reading as the same simple, walkable Pub Friend route.

## Pub Interior Layout Grammar Pass

The pub has been refined around room grammar rather than extra decoration.

Rules applied:

- Room shell comes first: walls, windows, sign, lamps, fireplace, and plant sit on or near room edges.
- Floor comes second: the continuous generated pub-floor texture now carries the main floor read instead of visible large image patches.
- Walkable lanes come third: the central entrance-to-bar lane remains open and seating is pushed into left and lower-right pockets.
- The back-wall bar/service zone is one readable band, with shelf, counter, corner piece, keg tap, and lamps grouped together.
- Seating clusters now have stools/chairs placed in relation to tables rather than as isolated objects.
- The rug anchors the lower-right seating group instead of sitting in the middle of the main lane.
- Surface props remain tied to surfaces through the named table/bar assets: beer tables contain mugs, bottle shelf sits behind the bar, and keg/tap sits by the service zone.
- Empty space is intentional, especially between the lower door, the bar, and both seating pockets.

What changed:

- Removed the repeated `floor_wood.png` prop patches from the pub layout so the floor reads as one continuous room surface.
- Kept the same camera and scale settings from the previous pass: `cameraZoom: 1.55`, `playerScale: 0.9`, and `propScaleMultiplier: 0.78`.
- Tightened wall props against the shell: back wall, corners, sign, hanging lamps, window, fireplace, and plant.
- Repositioned the bar, shelf, bar corner, and keg tap into a stronger back-wall service area.
- Kept a left seating cluster around the round table.
- Moved the rug/table/chair/stool cluster into the lower-right seating area so it does not block the entrance lane.
- Reduced scattered feel by removing the central seating island and keeping fewer isolated props.

Expected visual effect:

The pub should now read as one coherent Stardew/Pokemon-style interior: a room shell, a continuous floor, a clear bar zone, believable seating pockets, and an open walkable lane from entrance to bar and seating.

## Beach Destination Pass

- `public/locations/beach.json` uses `propAssetPack: "beach"`.
- The beach destination uses promoted named PNG props for sand, shoreline, water, hut/signage, boardwalk/entry details, and beach-day clusters.
- Walkable sand fills the arrival/play area.
- Blocked water sits along the top and right edge.
- Props are grouped around arrival, hut, shoreline, and relaxation zones.

## Support Extraction Packs

Two expansion/support packs are now available for object extraction and promotion:

- `pub-accessory` reads `references/source-sheets/pub_accessory_object_sheet.png` and writes raw crops to `public/assets/props/pub-accessory/raw/`.
- `outside-route-additional` reads `references/source-sheets/outside_route_additional_object_sheet.png` and writes raw crops to `public/assets/props/outside-route-additional/raw/`.

These packs are tooling lanes only. They do not alter game rendering, preloads, maps, promoted pub assets, or promoted outside-route assets.

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
5. Run `npm run extract-objects -- pub-accessory` after confirming the source sheet exists.
6. Run `npm run extract-objects -- outside-route-additional` after confirming the source sheet exists.
7. Confirm each support pack writes raw crops, `contact_sheet.png`, `manifest.json`, and `review.html` to its own raw folder.
8. Confirm `npm run promote-props -- pub-accessory` exits cleanly with the empty selection map.
9. Confirm `npm run promote-props -- outside-route-additional` exits cleanly with the empty selection map.
10. Open the local Vite URL.
11. Select `Pub Friend`.
12. Confirm the title card appears.
13. Confirm town loads as the outside-route / town-edge connector.
14. Confirm Jack and the pub door flow still work.
15. Enter the pub door.
16. Confirm the pub interior loads with no random tilemap fragments.
17. Confirm the player can move through the pub and the beer punchline remains visible.
18. Select `Beach Day` and confirm the beach scene still loads.

## Next Recommended Task

Run browser or CI validation for the latest sketch-based Town Edge Route rebuild, then do a quick visual check of Pub Friend to confirm the route reads clearly in vertical framing.
