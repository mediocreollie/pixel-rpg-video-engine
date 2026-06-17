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

## Pub Friend Flow

- `Pub Friend` starts in `public/locations/town.json`.
- Jack spawns at `townCenter` on the Town Edge Route v2 dirt path.
- Jack's scripted path follows the visible route toward the pub door.
- The `pubDoor` exit points to `public/locations/pub.json` and spawns the player at the pub door.
- The pub uses `useTilemap: false`, so the broken mixed-size tileset slicing path remains disabled.
- The pub uses promoted named PNG props from `public/assets/props/pub/` with generated shape fallbacks when a named image is missing.

## Asset-Led Scene State

- Pub props are promoted production assets in `public/assets/props/pub/`.
- Outside-route props are promoted production assets in `public/assets/props/outside-route/`.
- Outside-route support props are promoted production assets in `public/assets/props/outside-route-additional/`.
- Beach props are promoted production assets in `public/assets/props/beach/`.
- `WorldScene` supports location prop packs through `propAssetPack`.
- `WorldScene` preloads the first production prop packs for `pub`, `outside-route`, and `beach`.
- `WorldScene` also preloads any explicit `assetPack` named on individual props, so support-pack details can render without replacing the main location pack.
- Missing named PNG props fall back to generated shape props instead of crashing the scene.
- Raw `object_###.png` files are not used directly by game code.

## Town Edge Route V2

The Town Edge Route has been rebuilt from a terrain-first blockout.

Design order now used:

1. Grass base.
2. Continuous dirt path.
3. Pub building and door.
4. Boundaries.
5. Route cues.
6. Small decoration.

What changed:

- The route now starts at the left-middle edge and leads mostly left-to-right.
- The path is one continuous dirt route with a gentle bend into the pub entrance.
- Disconnected path carpet blocks were removed.
- The pub building sits on the right side as the clear destination.
- The pub door, stone/paved doorstep, lamp, and route sign make the endpoint readable.
- Trees and hedges frame the left and upper-left route boundary.
- Fences, bushes, and rocks support the lower boundary.
- Water has been omitted for now because the current promoted packs do not provide enough edge pieces to make it read cleanly.
- Flowers and tufts are limited to path edges, bushes, and the pub foundation.
- Jack's movement route is aligned to the visible path.

Expected visual effect:

The town should read as a DS-era RPG route: enter from the left, follow the dirt path through a lightly wooded town edge, and arrive at the cosy pub on the right.

## Pub Interior State

- The pub interior is still arranged around a room shell, continuous generated floor, bar/service zone, seating pockets, and an open entrance-to-bar lane.
- The pub remains on the generated renderer plus named prop images.
- Tilemap rendering remains future opt-in support only.

## Beach Destination State

- `public/locations/beach.json` uses `propAssetPack: "beach"`.
- The beach destination uses promoted named PNG props for sand, shoreline, water, hut/signage, boardwalk/entry details, and beach-day clusters.

## Tilemap Status

- `public/maps/pub_mvp.json` and `public/assets/tilesets/pub_mvp_tileset.png` remain in the repository as future tilemap workflow references.
- `pub_mvp_tileset.png` is not a strict 16x16 grid tileset. It is a mixed-size visual reference / asset sheet.
- Pub tilemap rendering only runs when a location explicitly sets `useTilemap: true`.
- Generated map rendering plus named prop images is the current stable path.

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

GitHub Actions validation/build exists through `.github/workflows/validate.yml`, but direct GitHub-side commits have not exposed a workflow result through the connector in this session.

## Manual Test Checklist

1. Run `npm install` if dependencies are not installed.
2. Run `npm run validate-content`.
3. Run `npm run build`.
4. Run `npm run dev`.
5. Select `Pub Friend`.
6. Confirm the title card appears.
7. Confirm the Town Edge Route v2 loads with a clear left-to-right dirt path.
8. Confirm Jack starts on the path and walks toward the pub door.
9. Confirm the player can follow the path comfortably.
10. Confirm the pub entrance is the clearest destination on the right.
11. Enter the pub door.
12. Confirm the pub interior loads with no random tilemap fragments.
13. Confirm the player can move through the pub and the beer punchline remains visible.
14. Select `Beach Day` and confirm the beach scene still loads.

## Next Recommended Task

Run CI or local validation once the command runner is available, then visually test Pub Friend in vertical framing to confirm the Town Edge Route v2 blockout reads before adding any further decoration.
