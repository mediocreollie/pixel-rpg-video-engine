# Architecture Review

## 1. Current Project Purpose

Pixel RPG Video Engine is not trying to become a full RPG. It is a short-form pixel RPG video engine: a reusable browser-based scene runner for making funny, screen-recordable Nintendo DS-era RPG-style clips.

The core video pattern is:

1. An NPC says something simple.
2. The player follows them through a readable route.
3. The route leads to a destination.
4. The destination reveals a visual punchline or story moment.

The target feeling is Pokemon Platinum route readability plus Stardew Valley environmental warmth, translated into real-life-inspired places such as pubs, beaches, cafes, parks, gyms, and town edges. The engine should make new scenarios quick to author through JSON and reusable locations, not through repeated code changes.

The project should therefore prioritise:

- reusable scenes and locations;
- quick scenario generation;
- phone-readable maps;
- small readable actors;
- clear paths, doors, and reveals;
- stylised real-world places, not realistic simulation;
- video pacing over RPG depth.

## 2. Current Runtime Architecture

The app uses Phaser 3 with Vite. `src/main.js` creates a Phaser game, chooses landscape or portrait canvas dimensions, wires the recording overlay, and registers `BootScene`, `MenuScene`, and `WorldScene`.

`BootScene` loads `public/scenes/manifest.json`, then queues scene, character, and location JSON from the manifest. `MenuScene` displays the scene selector from the loaded manifest. It currently lists three scenes: `pub`, `beach`, and `gym`.

Scene JSON defines the video idea:

- `startingLocation`;
- `destinationLocation`;
- participating character roles;
- dialogue;
- scripted movement paths;
- punchline reveal text;
- title card metadata.

Location JSON defines the playable map:

- generated map symbols in `map.legend` and `map.tiles`;
- optional `terrain` rows, currently documented but not independently rendered as a separate system;
- player and NPC spawn points;
- exits such as `pubDoor`;
- props;
- per-location display settings such as `cameraZoom`, `playerScale`, and `propScaleMultiplier`;
- optional `propAssetPack`;
- pub-only tilemap config kept disabled through `useTilemap: false`.

`WorldScene` is the runtime centre. It currently owns most engine responsibilities:

- content lookup and fallback content;
- runtime content warnings;
- prop asset preloading;
- generated map rendering;
- disabled/future tilemap rendering;
- map blockers;
- exit creation and transitions;
- prop rendering and generated prop fallbacks;
- player and NPC creation;
- scripted NPC movement;
- dialogue interaction;
- title card display;
- camera follow and zoom;
- punchline reveal text;
- recording overlay events;
- debug logging for the old pub tilemap path.

This made fast MVP iteration possible, but it now means scene-building, rendering, validation, actor logic, camera logic, and debug behavior are tightly coupled in one file.

`DialogueBox` is already separated into its own UI helper. That is a good precedent: the rest of the runtime should follow this pattern by extracting small focused systems while keeping `WorldScene` as the coordinator.

## 3. Current Asset Architecture

The asset workflow is stronger than the runtime placement architecture.

Source sheets live under `references/source-sheets/`. `scripts/extract-objects.js` supports these packs:

- `pub`;
- `pub-accessory`;
- `outside-route`;
- `outside-route-additional`;
- `beach`;
- `park`;
- `cafe`.

Extraction detects connected non-transparent PNG regions, crops them into `object_###.png`, writes `manifest.json`, writes `contact_sheet.png`, and generates `review.html` for visual inspection.

Raw output lives in:

```text
public/assets/props/<pack>/raw/
```

Raw files are review artifacts and are not supposed to be used directly in game code.

Promotion is handled by `scripts/promote-props.js`. Each pack has:

```text
public/assets/props/<pack>/selected-props.json
```

That file maps clean production names to raw crops. Promotion copies selected raw PNGs into:

```text
public/assets/props/<pack>/
```

The main packs are scene identity packs: `pub`, `outside-route`, `beach`, `park`, `cafe`. The support packs are expansion packs: `pub-accessory` and `outside-route-additional`.

What works:

- extraction reduces manual cropping;
- review happens before production naming;
- raw assets stay separate from production assets;
- pack separation prevents pub/beach/park/cafe assets from overwriting each other;
- support packs can add detail without replacing the main pack;
- promotion refuses unsafe paths and accidental overwrites.

What is still awkward:

- promoted assets are named, but there is no manifest of production asset metadata such as footprint, layer role, default scale, or placement category;
- `WorldScene` has hard-coded `PROP_ASSET_PACKS` for only `pub`, `outside-route`, and `beach`;
- support-pack props can be referenced manually through `assetPack`, but support packs are not first-class scene-building inputs;
- the runtime cannot tell whether an asset is terrain, boundary, furniture, wall decoration, surface clutter, or story cue unless the location JSON author implies it through placement;
- there is no placement grammar that turns promoted assets into reliable Pokemon/Stardew-style maps.

## 4. Current Scene-Building Architecture

Maps are currently built from a generated grid plus a flat prop list.

The generated map grid is rendered first. Each symbol in `map.tiles` looks up a color, optional texture hint, blocked flag, or simple decoration behavior in `map.legend`. This creates the base floor/ground and physics blockers. Pub floor and wall line textures are special-cased through `drawTileTexture`.

Props are then rendered on top from one flat `props` array. A prop may be a named PNG from a pack or a generated rectangle/container fallback. Props have coordinates, dimensions, depth, alpha, color fallback, and optional `assetPack`.

Actors use spawn points from locations. Scene movement paths are stored in scene JSON as tile coordinates and converted to world pixels in `WorldScene`. Exits are location objects with tile coordinates and target locations. The camera follows the player and clamps zoom/scale settings.

The newly added `terrain` field exists in the location schema and in `town.json`, but the current renderer still uses `map.tiles` as the real rendered terrain layer. In practice, terrain is partly first-class through the generated grid, but the architecture has not fully separated terrain, boundaries, props, triggers, and decoration.

Town has improved because the path now lives in grid symbols rather than large path props. Beach still shows the older problem: large sand, water, shoreline, and shell images are placed as props even though they function as terrain. Pub uses generated floor/wall grid tiles with wall/furniture props over the top. This means the project has three competing map-building patterns:

- generated colored grid terrain;
- large image props pretending to be terrain;
- disabled/future tilemap support.

That inconsistency is the root of many visual/layout loops.

## 5. Main Problems Causing Circular Iteration

The repeated visual fixes are not mainly an asset quality problem. They come from missing map grammar and missing layer boundaries.

The biggest blockers are:

- terrain/path/floor/water are not consistently treated as a grid layer;
- props are still sometimes used as terrain, especially when large ground images cover the map;
- all non-grid objects live in one flat `props` list, so boundary, destination, decoration, furniture, wall detail, and surface clutter are mixed together;
- the data model does not enforce route logic, boundary logic, or interior zones;
- scale and footprint rules are manual per prop rather than attached to asset metadata;
- the runtime does not understand a difference between `path`, `boundary`, `destination`, `furniture`, `surfaceProp`, `wallDecoration`, and `clutter`;
- support assets exist but rely on hand placement instead of reliable placement categories;
- scenes are repeatedly edited directly rather than composed from reusable layout rules;
- the tilemap path exists but is disabled because the current pub PNG is not a strict grid tileset;
- `WorldScene` carries too many responsibilities, which makes every visual fix feel like a local scene fix instead of an engine capability;
- `SCENE_PACK_ROADMAP.md` is missing, so there is no single roadmap linking available asset packs to planned reusable scene packs;
- park and cafe assets are workflow-supported, but `public/locations/park.json` and `public/locations/cafe.json` do not currently exist.

## 6. Target Architecture

The target architecture should stay practical and incremental. It should not become a heavy editor or a full RPG engine.

The content model should become:

### Scene = Story Flow

Scene JSON should answer: what happens in this video?

It should own:

- title and description;
- starting location;
- destination location;
- cast roles;
- dialogue;
- scripted route points;
- trigger timing;
- punchline reveal;
- scene-specific title card and recording metadata.

### Location = Playable Map

Location JSON should answer: what reusable place does the player move through?

It should own:

- map name;
- asset packs;
- tile size;
- terrain layers;
- boundary layers;
- prop/object layers;
- actor spawn points;
- exits/triggers;
- camera/display settings.

### Terrain Layer

Terrain should be the first rendered visual layer. It should handle grass, dirt path, sand, water, floor, walls, foundation, doorstep, shoreline, and similar map surfaces.

This should replace the habit of placing giant image props for ground/floor/path.

A practical first structure:

```json
"layers": {
  "terrain": {
    "tileSize": 16,
    "legend": {
      "G": { "role": "grass", "color": "#86efac" },
      "P": { "role": "path", "color": "#d9b77d" },
      "W": { "role": "water", "blocked": true },
      "F": { "role": "floor" },
      "#": { "role": "wall", "blocked": true }
    },
    "rows": []
  }
}
```

For compatibility, this can initially compile to or mirror existing `map.legend` and `map.tiles`.

### Boundary Layer

Boundaries should be map-shaping objects: trees, hedges, fences, pub walls, cliffs, water edges, building sides, interior walls. They should guide movement and frame the scene.

### Prop Layer

Props should be placeable objects: signs, lamps, benches, tables, stools, mugs, bottles, flowers, crates, barrels, plants, towels, umbrellas, and similar details.

### Actors

Actors should stay data-driven and scene-specific: the scene chooses character roles, while locations provide spawn points. Movement paths should continue to be simple tile-coordinate routes.

### Triggers

Doors, exits, punchline triggers, camera beats, and future reveal zones should be explicit triggers rather than just invisible rectangles in the same conceptual bucket as map decoration.

### Camera And Display Settings

Camera/display should stay per location and optionally per scene:

- `cameraZoom`;
- `playerScale`;
- `propScaleMultiplier`;
- future framing presets for vertical video;
- optional reveal framing points later.

### Layout Grammar

The missing architecture piece is not just code. It is a shared grammar that content files follow and tooling can validate.

Each placed object should declare or inherit a role:

```json
{
  "role": "boundary | destination | routeCue | furniture | wallDecoration | surfaceProp | clutter",
  "asset": "lamp_post.png",
  "x": 17.2,
  "y": 5.95
}
```

This role does not need complex runtime behavior at first. Its first value is authoring discipline, validation, and review.

## 7. Desired Map Grammar

Exterior route grammar:

- Path leads.
- Door rewards.
- Walls frame.
- Fences block.
- Trees frame.
- Hedges guide.
- Signs explain.
- Lamps highlight.
- Flowers soften.
- Props cluster.
- Empty space breathes.
- Decoration comes last.

The player should understand the path before noticing decoration. A route scene should be built in this order:

1. Base terrain.
2. Continuous path.
3. Destination door/building/transition.
4. Boundaries.
5. Route cues.
6. Small decoration.

Interior grammar:

1. Room shell first.
2. Floor second.
3. Walkable lanes third.
4. Furniture zones fourth.
5. Surface props fifth.
6. Wall decoration sixth.

Interior rules:

- walls, windows, shelves, signs, lights, and fireplaces belong around room edges;
- floors should read as one continuous surface;
- walkable lanes should connect entrance, bar, seating, and punchline area;
- bar counters should form a service zone;
- tables and stools should form seating clusters;
- mugs and bottles belong on tables, bars, or shelves;
- rugs anchor zones but do not block movement;
- plants belong in corners or against walls;
- empty space is intentional and should protect player readability.

Destination grammar:

- the destination object should be the clearest endpoint;
- sign/lamp/door/foundation should reinforce it;
- nearby props should support the reveal, not compete with it;
- punchline density belongs at the destination, not along the route.

## 8. Recommended Next Implementation Sequence

1. Formalise the location layer model in documentation and schema.

Add explicit `layers.terrain`, `layers.boundaries`, `layers.props`, and `triggers` as the target shape while keeping backward compatibility with existing `map` and `props`.

2. Make terrain rendering reliable and reusable.

Create one renderer path for grid terrain. It should support colored fallback tiles first, then optional named terrain tile assets later. Do not use large image props for path, floor, sand, shoreline, or water.

3. Convert Town Edge Route to the target layer model.

Town is the best test because it already moved closest to terrain-first. Convert its current grid path into the new formal layer shape and move boundary/destination/decor props into role-based arrays.

4. Convert Pub to the target layer model.

Make room shell, floor, wall, walkable lanes, bar zone, seating zone, wall decorations, and surface props explicit. Keep `useTilemap: false` until a real grid tileset or object atlas exists.

5. Convert Beach to the target layer model.

Beach currently uses large terrain-like props for sand/water/shoreline. Move sand, water, shoreline, and blocked water into terrain layers before adding beach props back on top.

6. Add pack metadata for production props.

Create lightweight pack manifests such as `public/assets/props/pub/props.json` or `asset-metadata.json` with role, default footprint, and suggested layer. This lets promoted assets become easier to place consistently.

7. Apply the layer model to Park and Cafe after their locations exist.

Park and cafe assets are promoted/workflow-supported, but reusable locations are missing. Do not start by hand-scattering props; start with terrain and room/route grammar.

8. Extract runtime systems from `WorldScene` incrementally.

Suggested order:

- `PropAssetRegistry` / `PropRenderer`;
- `LocationRenderer`;
- `ActorController`;
- `CameraController`;
- `TransitionController`;
- `RecordingSceneUi` or title-card helper.

Each extraction should preserve behavior.

9. Add layout validation.

Extend `validate-content` to catch architectural drift:

- terrain rows must be rectangular;
- actor path points should be inside the map;
- exits should align with destination cues;
- large props should not use terrain roles;
- raw `object_###.png` paths should never appear in location files;
- support-pack assets should declare an explicit role.

10. Later, consider a layout authoring helper.

After the layer model is stable, create helper scripts that can scaffold a location from grammar presets, for example `route-to-destination`, `small-pub-interior`, `beach-reveal`, `park-path`, or `cafe-room`.

## 9. What We Should Stop Doing

Stop using large props as path, floor, sand, shoreline, or water terrain.

Stop adding more assets before the map structure is solved.

Stop fixing screenshots one prop at a time when the underlying layer model is unclear.

Stop mixing terrain, decoration, boundary, destination cues, furniture, and story props in one undifferentiated flat list.

Stop adding water or ponds unless the terrain edge pieces are sufficient to make the edge readable.

Stop treating support packs as random extra decoration. They should support a placement role.

Stop re-enabling the pub tilemap path until there is a clean grid tileset or an object-atlas renderer designed for mixed-size sprites.

Stop solving scale only through camera zoom. Asset footprint, map role, and grid placement need to carry more of the load.

Stop adding full-RPG systems such as inventory, combat, levelling, economy, or complex quests unless they directly support short-form video production.

## 10. Immediate Next Task Recommendation

The next task should be:

Formalise the target location layer model without changing any visual output.

Concrete scope:

1. Create `LOCATION_LAYER_MODEL.md` documenting the target JSON shape for `layers.terrain`, `layers.boundaries`, `layers.props`, `triggers`, actor spawns, exits, and display settings.
2. Update `location.schema.json` to allow the new layer fields while keeping existing `map` and `props` valid.
3. Update `validate-content` only enough to validate rectangular terrain rows when a new `layers.terrain.rows` field is present.
4. Do not convert any scene yet.

This is small enough to implement safely, but it aligns the project around the architecture that future Town, Pub, Beach, Park, and Cafe passes should follow.

## Honest Unknowns

- `SCENE_PACK_ROADMAP.md` does not currently exist in the repository.
- `public/locations/park.json` does not currently exist.
- `public/locations/cafe.json` does not currently exist.
- Local validation/build could not be verified from this environment because the local Windows sandbox is still failing before commands can run.
- The current `terrain` field is documented in schema and present in Town, but the actual renderer still uses `map.tiles` as the active generated terrain grid.
