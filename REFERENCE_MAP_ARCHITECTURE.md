# Reference Map Architecture

## 1. What Pokemon Platinum-Style Maps Generally Do

Pokemon Platinum-style maps are built around a grid-first mental model. The player, paths, buildings, grass, signs, trees, ledges, doors, and NPC routes all make visual sense because they share a tile-based structure.

From a practical game-design perspective, this usually means:

- the world is constructed from small repeated tiles;
- terrain is the first layer, not a decoration pass;
- paths, grass, water, cliffs, building foundations, and floors are assembled from tile patterns;
- edge and corner tiles make paths feel connected instead of pasted on top;
- objects align to grid cells or predictable half-cell offsets;
- the player has a consistent scale relative to tiles;
- collisions are represented by blocked tiles or object footprints;
- doors, warps, and story events are trigger zones on the map;
- NPC movement routes follow walkable grid positions;
- camera framing shows enough map context for the player to understand where to go.

The key point is not only that tiles exist. The key point is that map roles are clear.

A dirt path is not just a picture of dirt. It is a connected terrain path that implies walkability and route direction. Grass patches are not random decoration; they sit beside paths and boundaries. Buildings sit on foundations. Doors sit on the front of buildings. Signs sit near routes, junctions, or entrances. Fences and trees form borders. Water and cliffs stop movement and shape the path.

This is why paths feel connected: they are composed from repeated center, edge, corner, and transition pieces that visually share a grid. The player reads the path as a continuous surface, not as a series of separate objects.

This is also why buildings, trees, signs, and fences feel correctly placed. They are not floating independent illustrations. They serve map grammar:

- buildings are destinations or boundaries;
- doors are rewards for following a route;
- trees frame the map and restrict movement;
- signs explain the route;
- fences block or guide;
- NPCs move along readable walkable cells.

The small camera viewport matters too. A DS-era route has to communicate intent quickly inside a limited window. The route must be readable even if the player can only see part of the map. That forces strong map grammar: paths, doors, boundaries, and landmarks need to be clearer than decoration.

## 2. What Stardew Valley-Style Maps Generally Do

Stardew-style maps are also tilemap-first, but their strength is layered environmental richness. They tend to combine clear tile layers with many small objects that make spaces feel warm and used.

From a practical game-design perspective, this usually means:

- base ground/floor is built from repeated tiles;
- terrain variation is layered through tile variations, not giant single images;
- walls, floors, rugs, water, paths, cliffs, and edges are usually tile-layer concepts;
- decorative objects sit on top of the base map;
- a collision layer controls movement separately from the visual layer;
- a front or above-player layer is used where objects should visually overlap the player;
- furniture and props have footprints;
- objects can be decorative, blocking, surface-only, wall-mounted, or above-player;
- interiors are organised around room shell, floor, lanes, zones, and props.

For interiors, the grammar is especially important:

1. Room shell first.
2. Floor second.
3. Walkable lanes third.
4. Furniture zones fourth.
5. Surface props fifth.
6. Wall decoration sixth.

A warm room does not come from one huge detailed prop. It comes from many small, correctly layered details: floor variation, wall trim, furniture clusters, surface items, plants, shelves, lamps, windows, and empty walking space.

For outdoor maps, the grammar is similar:

1. Terrain base.
2. Paths and water.
3. Boundaries.
4. Destination landmarks.
5. Props.
6. Small detail.

Environmental warmth comes from layering small purposeful details after the structure works. A flower patch feels right beside a path, fence, bush, or building edge. It feels wrong if it is random noise in the middle of open grass. A bench feels right beside a path or quiet edge. It feels wrong if it blocks route logic.

The important principle for this project: Stardew-like warmth depends on tilemap structure first, then object layering. It does not work well if the base map is a flat background with large decorative images scattered over it.

## 3. Compare Those Principles To Our Current Architecture

The project already has a strong story/content architecture.

Current scene JSON does the right job: it defines the video beat. `public/scenes/pub.json` describes `Pub Friend` as a simple short-form flow: start in town, talk to Jack, follow his scripted route, enter the pub, and show the punchline reveal. `public/scenes/manifest.json` exposes `pub`, `beach`, and `gym` through the scene selector.

Current location JSON does most of the map work. A location defines:

- `map.legend` and `map.tiles`;
- optional `terrain` rows;
- `propAssetPack`;
- explicit per-prop `assetPack` overrides;
- player spawns;
- NPC spawn points;
- exits/transitions;
- props;
- camera and display scale settings.

The asset workflow is also solid. Source sheets are extracted into raw `object_###.png` files, reviewed through contact sheets/review pages, mapped through `selected-props.json`, and promoted into named production assets. Main packs and support packs are separate. Raw files are not intended for runtime use.

`WorldScene` renders the current maps in this order:

1. Preload named props from the location's pack and explicit prop asset packs.
2. Build a generated grid map from `map.tiles` unless an enabled tilemap is available.
3. Render each map tile as a colored square with some special texture hints.
4. Add blockers for blocked map symbols.
5. Render the flat `props` array on top.
6. Create exits/triggers as invisible or semi-visible rectangles.
7. Create player and NPCs.
8. Apply camera follow, zoom, and display scale settings.

This is close to the right direction, but not yet a full Pokemon/Stardew-style map architecture.

### Where It Matches

- Scene JSON is a good story-flow layer.
- Locations are reusable content files.
- Actor spawn points and scripted movement are tile-coordinate based.
- Exits such as `pubDoor` work like simple map triggers.
- `map.tiles` can act as a grid-first terrain base.
- Town now uses grid symbols for the main route path instead of large path props.
- The pub has generated floor/wall grid structure and named props over it.
- Camera/display settings are data-driven per location.
- Missing named props fall back instead of crashing.

### Where It Mismatches

Terrain is only partially first-class.

The active renderer still uses `map.tiles` as the real grid terrain. The newer `terrain` field exists in schema and in `town.json`, but it is not the independent canonical layer used by the renderer. That means the project has a concept of terrain, but not yet a complete terrain-layer architecture.

Paths are not always fully tile-aware.

Town has moved closer to tile-aware pathing. Beach still uses large sand, water, and shoreline PNG props that behave like terrain but live in the prop layer.

Props still do terrain work.

In `beach.json`, `sand_tile_plain.png`, `water_tile_deep.png`, `water_tile_light.png`, and `shoreline_wave_tile.png` are placed as large props. Visually they are terrain layers, but architecturally they are objects. That keeps the engine in the old screenshot-fix loop.

Asset footprints are not consistently defined.

Props define width/height per placement. The asset itself does not declare its default footprint, collision, role, or intended layer. A table, wall panel, shoreline tile, path edge, and flower are all just props with coordinates and dimensions.

Collision/walkability is not clearly represented as a separate grid.

Blocked terrain exists through `map.legend[tile].blocked`, and prop fallback shapes can render visually, but there is not yet a clear collision layer for object footprints, over-player pieces, or special walkability. Large visual props do not automatically define footprint/collision semantics.

Decoration, boundaries, story cues, and terrain are mixed.

The flat `props` array contains building pieces, path accents, trees, fences, flowers, signs, lamps, furniture, rugs, shelves, doors, and clutter. The renderer can draw them, but the content model does not know why each prop exists.

Scale is controlled visually rather than through a consistent grid/footprint model.

`cameraZoom`, `playerScale`, `propScaleMultiplier`, and per-prop dimensions help, but they are compensating for missing footprint standards. Pokemon/Stardew-style scale usually comes from consistent tile size, player footprint, object footprints, and layer rules first; camera zoom then frames the result.

Scene layout is hand-authored but not yet constrained by map grammar.

The current JSON allows good layouts, but it does not enforce them. A sign can be anywhere. A flower can be anywhere. A water prop can cover half the map. A path can be represented as terrain in one location and as props in another. Validation currently checks references and schema shape, not map grammar.

## 4. Define The Target Architecture For This Project

This project should not become a full RPG engine. It should become a small Pokemon-style video map engine.

The target model should be strong enough to make maps readable and fast to author, but not so complex that it becomes a general-purpose game engine.

### Scene = Story Flow / Video Beat

Scene JSON should continue to describe the short video:

- who is in the scene;
- what they say;
- where the scene starts;
- where it ends;
- which route the NPC follows;
- when the reveal happens;
- what title card or punchline text appears.

Scene files should not own reusable map structure.

### Location = Playable Grid Map

Location JSON should describe the reusable place:

- tile size;
- grid dimensions;
- terrain layers;
- boundaries;
- props;
- over-player visuals;
- collision/walkability;
- triggers;
- actor spawn points;
- display settings.

### Terrain Layer

The terrain layer is the base map surface:

- grass;
- dirt path;
- sand;
- floor;
- water;
- walls;
- building foundations;
- doorstep/foundation zones.

This should be the first rendered layer and the first authoring concern.

### Edge Layer

The edge layer handles transitions and borders:

- path edges;
- water edges;
- cliff edges;
- wall trims;
- floor trim;
- shoreline corners;
- foundation borders.

This layer makes terrain feel connected. It should not be random decoration.

### Boundary Layer

The boundary layer shapes movement and composition:

- trees;
- hedges;
- fences;
- walls;
- building edges;
- rocks or cliffs;
- water boundaries.

Boundary objects may create collision, visual framing, or both.

### Prop Layer

The prop layer contains readable scene objects:

- signs;
- lamps;
- mugs;
- tables;
- flowers;
- barrels;
- crates;
- clutter;
- shelves;
- benches;
- towels;
- umbrellas.

Props should support story, navigation, or atmosphere. They should not define the main terrain.

### Over-Player Layer

Some visuals may need to draw above actors:

- wall tops;
- tree canopies;
- door frames;
- hanging signs;
- archways;
- foreground trim.

This can be small and optional, but it should exist as a concept before maps need it badly.

### Collision / Walkability Grid

Collision should be represented as map data, not guessed from visuals.

A practical model:

- terrain symbols may be blocked;
- object footprints may be blocking;
- triggers may be walkable but interactive;
- above-player visuals may be non-blocking.

### Trigger Grid

Triggers should be explicit:

- doors;
- transitions;
- story beats;
- punchline reveal zones;
- optional camera/reveal cues later.

Current exits are a good start, but the target should make triggers a named layer rather than just another location field.

### Actor Layer

Actors remain player and NPCs. They should spawn on walkable grid cells and follow routes aligned to walkable terrain.

### Camera / Display Settings

Per-location camera/display settings should remain:

- `cameraZoom`;
- `playerScale`;
- `propScaleMultiplier`;
- later: framing presets or reveal anchors.

These should tune a correct map, not compensate for incorrect asset scale or terrain structure.

### Object Footprint Metadata

Promoted assets should eventually have metadata:

- default visual size;
- grid footprint;
- collision footprint;
- default layer;
- role;
- whether it can draw above the player;
- whether it is wall-mounted, surface-mounted, terrain, boundary, or decoration.

This lets the object atlas workflow become part of map architecture, not just a folder of PNGs.

## 5. Define The Map Grammar We Should Enforce

### Outdoor Routes

- Path leads.
- Door rewards.
- Trees frame.
- Hedges guide.
- Fences block.
- Signs explain.
- Lamps highlight.
- Flowers soften.
- Water/cliffs are boundaries.
- Decoration comes last.

Outdoor route build order:

1. Grass/base terrain.
2. Continuous path.
3. Destination door/building/transition.
4. Boundaries.
5. Direction cues.
6. Small decoration.

Outdoor maps should make the player understand the route before they notice the small details.

### Interiors

- Room shell first.
- Floor second.
- Walkable lanes third.
- Furniture zones fourth.
- Surface props fifth.
- Wall decoration sixth.
- Collision/footprints must respect walkable lanes.

Interior build order:

1. Define the room shell and walls.
2. Fill the continuous floor surface.
3. Reserve entrance-to-destination lanes.
4. Place furniture zones.
5. Add mugs, bottles, plates, candles, papers, and clutter on surfaces.
6. Add wall lights, signs, shelves, windows, and pictures.

For the pub specifically, the bar/service zone, seating pockets, entrance lane, and beer punchline must read before decorative clutter.

## 6. Define What Needs To Change In Our Project

Formalise tile size and player footprint.

`TILE_SIZE` is currently a runtime constant in `WorldScene`. The target should keep a default tile size but allow location data to declare tile size consistently. The player should have a documented footprint, roughly one tile wide and around one-and-a-half to two tiles tall visually.

Formalise terrain rows as the base map layer.

The current `map.tiles` layer is doing the real terrain work. The project should converge on one canonical terrain shape, either by promoting `terrain.rows` or by wrapping existing `map.tiles` into a clearer `layers.terrain` model.

Add edge/corner terrain support.

Paths, water, walls, and foundations need edge/corner concepts so they read as connected surfaces. This can start with colored/line fallback rendering before true tilesets exist.

Add a walkability/collision grid.

Blocked terrain, blocking object footprints, door triggers, and walkable decoration should be separated. Do not rely only on visual props to imply collision.

Add object footprint definitions.

Production assets need metadata. At minimum: role, default width/height or tile footprint, blocking behavior, and preferred layer.

Separate boundary props from decorative props.

Trees, hedges, fences, building walls, water edges, and cliffs are not just decoration. They define map shape and route readability.

Separate above-player visual layer if needed.

Wall tops, tree tops, archways, and door frames should have a place to render above the player without turning every prop into a manual depth puzzle.

Update validation.

`validate-content` should eventually catch:

- non-rectangular terrain rows;
- missing terrain legends;
- actor paths outside the map;
- actor paths on blocked cells;
- exits outside the map;
- exits that target missing locations;
- invalid asset packs;
- raw `object_###.png` usage in runtime locations;
- props missing known roles once roles exist;
- large terrain-like assets placed in the prop layer.

Stop treating path/building/floor as loose prop images.

Path, floor, sand, water, walls, shoreline, and foundation should be terrain or boundary layers. Props should be signs, lamps, tables, clutter, and similar objects.

Create a location authoring pattern every scene follows.

Each location should be authored in the same order:

1. terrain;
2. edges;
3. boundaries;
4. triggers;
5. actors/spawns;
6. props;
7. detail;
8. camera/display settings.

This would make Town, Pub, Beach, Park, and Cafe feel like the same engine rather than separate one-off compositions.

## 7. Recommended Migration Plan

1. Write `TARGET_MAP_ARCHITECTURE.md` from this review.

Turn the comparison into the project-specific target contract: fields, layer names, roles, examples, and compatibility rules.

2. Add or refine the location schema for layers, footprints, collision, and triggers.

Keep existing `map` and `props` valid during migration. Add the new fields as optional first.

3. Convert Town Edge Route to the target architecture.

Town is closest because its path is already grid terrain. Move from implicit `map.tiles` plus flat `props` toward explicit terrain, edge, boundary, prop, trigger, and actor-spawn sections.

4. Build a small terrain tile renderer that handles connected paths/edges better.

This does not need final tilesets. Start with fallback shapes and edge hints. The important part is that terrain is connected and grid-aware.

5. Convert Pub interior to the target architecture.

Make room shell, floor, walkable lanes, bar/service zone, seating zones, wall decoration, and surface props explicit. Keep the broken mixed-size tilemap path disabled.

6. Apply the same system to Beach.

Move sand, water, shoreline, and blocked water out of large props and into terrain/edge/collision layers. Then re-add beach objects as props.

7. Apply to Park and Cafe.

Park and cafe asset packs exist in the workflow, but reusable locations are not currently in the manifest. Build them from the target layer model, not from scattered props.

8. Only then continue visual polish.

After maps follow the same architecture, polish passes can improve warmth and detail without fighting scale, terrain, and route readability every time.

## 8. Risks And Constraints

Current assets are object-sheet based, not perfect tilesets.

The promoted PNGs are useful, but many are mixed-size objects. They may not align cleanly to strict 16x16 terrain grids. The architecture should support object atlases while keeping terrain grid-first.

AI-generated assets may not align perfectly to grid.

Some assets will need metadata, scale clamps, footprint overrides, or eventual replacement with cleaner tiles.

Current scenes should keep working during migration.

`Pub Friend`, `Beach Day`, and `Gym Friend` should not break while new layer fields are introduced. Backward compatibility with `map.tiles` and `props` is important.

Backward compatibility may be needed for a while.

The renderer can support old and new location formats during migration. The target architecture should be introduced gradually.

Avoid overengineering into a full RPG engine.

The goal is not a general RPG map editor. It is a short-form video scene engine. Add architecture only where it improves fast scene authoring, visual readability, and reusable locations.

Tilemap support should remain cautious.

The pub tilemap path failed because `pub_mvp_tileset.png` is not a clean grid tileset. Do not assume traditional tileset tooling will solve object-sheet assets without a proper atlas/metadata layer.

## 9. Immediate Next Recommendation

The smallest useful next change is to write `TARGET_MAP_ARCHITECTURE.md` as the project contract for map layers and roles.

Scope:

1. Define the target location JSON shape for `layers.terrain`, `layers.edges`, `layers.boundaries`, `layers.props`, `layers.overPlayer`, `collision`, `triggers`, `spawns`, and `display`.
2. Include one small Town Edge Route example and one small Pub interior example.
3. Define asset roles and object footprint metadata in prose, not code.
4. State backward compatibility rules for existing `map.tiles` and `props`.
5. Do not change runtime code or scene JSON yet.

That gives the project a stable target before any implementation. After that, the first code task should be schema/validation support for rectangular terrain rows and explicit layer fields, still without changing visual output.

## Honest Uncertainty

This document compares practical public map-design principles, not proprietary Pokemon or Stardew implementation details.

The current repo has promoted asset workflows for park and cafe, but `public/locations/park.json` and `public/locations/cafe.json` were not present during the previous architecture audit.

The current `terrain` field is documented and present in Town, but `WorldScene` still renders from `map.tiles` as the active generated map layer.

Local command execution has recently been blocked by a Windows sandbox ACL error, so this review is based on GitHub-side file inspection rather than local runtime testing.
