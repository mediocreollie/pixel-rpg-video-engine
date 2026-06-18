# Current Status

## Current Working State

- The project is a Phaser 3 / Vite pixel RPG video engine for short, screen-recordable social media scenes.
- `Pub Friend` remains the current priority MVP flow.
- `Beach Day` is listed in the scene manifest and has a first asset-led beach destination.
- Scene content is JSON-driven through `public/scenes/`, `public/locations/`, `public/characters/`, and `public/schemas/`.
- `Escape` returns gameplay to the scene selector.
- `R` restarts the current gameplay scene.
- `H` hides or shows the recording overlay and persists that setting.
- `?` opens the controls screen.

## Architecture Status

- `ARCHITECTURE_REVIEW.md` captures the current runtime, asset, and scene-building architecture.
- `REFERENCE_MAP_ARCHITECTURE.md` compares the current project to practical Pokemon Platinum-style and Stardew Valley-style map architecture principles.
- `TARGET_MAP_ARCHITECTURE.md` defines the project-specific target contract for map layers, object roles, footprints, triggers, collision, display settings, examples, validation targets, and compatibility rules.
- `public/schemas/location.schema.json` now supports the first target layered map fields while preserving older compatible locations.
- `WorldScene` can render the target layer order for locations with `layers.terrain.rows`: terrain, edges, boundaries, props, optional over-player visuals, then actors and triggers.
- `public/locations/town.json` is the first proof location using the target layered map model.
- Pub and beach remain on the older compatible structure for now and should not be migrated until Town Edge Route is visually confirmed.
- The target model separates terrain, edges, boundaries, props, over-player visuals, actors, triggers, camera/display settings, and layout grammar while keeping the existing JSON-first video workflow.

## Pub Friend Flow

- `Pub Friend` starts in `public/locations/town.json`.
- Jack spawns at `townCenter` on the Town Edge Route v2 dirt path.
- Jack's scripted path follows the visible route toward the pub door.
- The `pubDoor` trigger points to `public/locations/pub.json` and spawns the player at the pub door.
- The pub uses `useTilemap: false`, so the broken mixed-size tileset slicing path remains disabled.
- The pub uses promoted named PNG props from `public/assets/props/pub/` with generated shape fallbacks when a named image is missing.

## Asset-Led Scene State

- Pub props are promoted production assets in `public/assets/props/pub/`.
- Outside-route props are promoted production assets in `public/assets/props/outside-route/`.
- Outside-route support props are promoted production assets in `public/assets/props/outside-route-additional/`.
- Beach props are promoted production assets in `public/assets/props/beach/`.
- `WorldScene` supports location prop packs through `propAssetPack` and explicit per-location `assetPacks`.
- `WorldScene` preloads old prop lists, target map layer props, edge legend assets, and explicit support-pack assets.
- Missing named PNG props fall back to generated shape props instead of crashing the scene.
- Raw `object_###.png` files are not used directly by game code.

## Town Edge Route Layered Proof

The Town Edge Route now uses the target layered map model.

Layer order now used:

1. Terrain.
2. Edges.
3. Boundaries.
4. Props.
5. Optional over-player visuals.
6. Actors.
7. Triggers and collision logic.

What changed:

- The route starts at the left-middle edge and leads mostly left-to-right.
- The visible route is rendered by `layers.terrain.rows`, using repeated tile symbols instead of large decorative path image props.
- Path-edge support images live in `layers.edges` as accents; they no longer define the route.
- Pub building, door, windows, trees, hedges, fences, bushes, and rocks live in `layers.boundaries`.
- Signs, lamps, bench, shadows, flowers, tufts, barrel, and crate live in `layers.props`.
- The `pubDoor` is represented as a `transition` trigger aligned with the visible pub entrance.
- The old `exits`, `map`, and spawn fields remain for compatibility while the new renderer uses the layered structure.
- Water has been omitted for now because the current promoted packs do not provide enough edge pieces to make it read cleanly.
- Jack's movement route remains aligned to the visible path.

Expected visual effect:

The town should read as a DS-era RPG route: enter from the left, follow the continuous dirt terrain path through a lightly wooded town edge, and arrive at the cosy pub on the right.

## Pub Interior State

- The pub interior is still arranged around a room shell, continuous generated floor, bar/service zone, seating pockets, and an open entrance-to-bar lane.
- The pub remains on the generated renderer plus named prop images.
- Tilemap rendering remains future opt-in support only.
- The next migration target should be the pub interior only after Town Edge Route is visually confirmed.

## Beach Destination State

- `public/locations/beach.json` uses `propAssetPack: "beach"`.
- The beach destination uses promoted named PNG props for sand, shoreline, water, hut/signage, boardwalk/entry details, and beach-day clusters.
- Beach remains on the older compatible prop-based structure for now.

## Tilemap Status

- `public/maps/pub_mvp.json` and `public/assets/tilesets/pub_mvp_tileset.png` remain in the repository as future tilemap workflow references.
- `pub_mvp_tileset.png` is not a strict 16x16 grid tileset. It is a mixed-size visual reference / asset sheet.
- Pub tilemap rendering only runs when a location explicitly sets `useTilemap: true`.
- Generated map rendering plus named prop images is the current stable path.

## Validation Status

- `scripts/validate-content.js` now checks the target layered location structure for row widths, invalid layer names, missing promoted assets, invalid asset packs, raw asset references, and transition trigger target locations.

The local command runner is still blocked before npm can start with:

```text
helper_unknown_error: apply deny-read ACLs
```

Because of that, these have not been verified by local command execution in this session:

- `npm run validate-content`
- `npm run build`
- Browser/manual Phaser runtime behaviour
- Exact camera framing in 9:16 mode

GitHub Actions validation/build exists through `.github/workflows/validate.yml`, but direct GitHub-side commits have not exposed a workflow result through the connector in this session.

## Manual Test Checklist

1. Run `npm install` if dependencies are not installed.
2. Run `npm run validate-content`.
3. Run `npm run build`.
4. Run `npm run dev`.
5. Select `Pub Friend`.
6. Confirm the title card appears.
7. Confirm the Town Edge Route loads with a clear left-to-right dirt path from `layers.terrain.rows`.
8. Confirm path-edge accents sit on top of the terrain rather than defining the route.
9. Confirm Jack starts on the path and walks toward the pub door.
10. Confirm the player can follow the path comfortably.
11. Confirm the pub entrance is the clearest destination on the right.
12. Enter the pub door.
13. Confirm the pub interior loads with no random tilemap fragments.
14. Confirm the player can move through the pub and the beer punchline remains visible.
15. Select `Beach Day` and confirm the beach scene still loads.

## Next Recommended Task

Visually confirm Town Edge Route in the browser with the layered renderer. If the proof reads correctly, migrate the pub interior to the same layer model next; keep beach on the compatible structure until pub is stable.
