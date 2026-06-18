# Target Map Architecture

## Purpose

This document defines the target map architecture for Pixel RPG Video Engine.

The goal is not to build a full RPG engine. The goal is to make short-form Pokemon / Nintendo DS-era RPG-inspired video scenes fast to author, visually readable, and consistent across reusable locations.

The target architecture should support the core video loop:

1. NPC says something.
2. Player follows them through a readable route.
3. Route leads to a destination.
4. Destination reveals a visual punchline or story moment.

Maps should feel like small playable RPG places, not flat backgrounds with props scattered over them.

## Design Principles

- Grid first.
- Terrain before props.
- Routes before decoration.
- Doors and exits must read as destinations.
- Collision must be data, not visual guesswork.
- Props need roles and footprints.
- Empty space is part of composition.
- Visual warmth comes from layered small details after the structure works.
- The system must stay JSON-first and video-first.

## Non-Goals

This architecture should not introduce:

- combat;
- inventory;
- levelling;
- economy;
- complex quest systems;
- a general-purpose RPG map editor;
- proprietary Pokemon or Stardew implementation assumptions;
- mandatory perfect tilesets before the current object-sheet workflow can remain useful.

## Core Content Model

### Scene

A scene is the video beat.

Scene JSON should answer: what happens in this short video?

Scene files own:

- scene title and description;
- starting location;
- destination location;
- participating character roles;
- dialogue;
- scripted NPC movement;
- title cards;
- punchline reveal;
- future camera/reveal beats if needed.

Scene files should not own reusable terrain, room shell, or location layout.

### Location

A location is the reusable playable map.

Location JSON should answer: what kind of place is this, where can the player walk, and what does the map communicate visually?

Location files own:

- tile size;
- map dimensions;
- terrain;
- edges;
- boundaries;
- props;
- over-player visuals;
- collision and walkability;
- triggers and exits;
- player/NPC spawn points;
- camera/display settings;
- asset pack references.

### Asset Pack

An asset pack is a named group of promoted production PNGs.

Current packs include:

- `pub`;
- `outside-route`;
- `beach`;
- `park`;
- `cafe`;
- `pub-accessory`;
- `outside-route-additional`.

Raw `object_###.png` files must remain review artifacts. Runtime map data should only reference named production PNGs.

## Target Location Shape

The target location format should move toward this shape while keeping existing `map` and `props` valid during migration:

```json
{
  "id": "town",
  "mapName": "Town Edge Route",
  "tileSize": 16,
  "assetPacks": ["outside-route", "outside-route-additional"],
  "display": {
    "cameraZoom": 1.45,
    "playerScale": 0.9,
    "propScaleMultiplier": 0.78
  },
  "layers": {
    "terrain": {},
    "edges": {},
    "boundaries": [],
    "props": [],
    "overPlayer": []
  },
  "collision": {},
  "triggers": [],
  "spawns": {
    "player": {},
    "npcs": {}
  }
}
```

The exact implementation can be incremental. The important contract is the separation of map roles.

## Layer Definitions

### Terrain Layer

Terrain is the base surface of the map.

Terrain includes:

- grass;
- dirt path;
- sand;
- floor;
- water;
- walls when represented as grid blockers;
- foundations;
- doorstep tiles;
- interior floor zones.

Terrain must be grid-based. It should be authored as rows of symbols with a legend.

Example:

```json
"terrain": {
  "tileSize": 16,
  "legend": {
    "G": { "role": "grass", "color": "#86efac", "walkable": true },
    "P": { "role": "path", "color": "#d9b77d", "walkable": true },
    "S": { "role": "stone", "color": "#c7b7a3", "walkable": true },
    "W": { "role": "water", "color": "#0ea5e9", "walkable": false },
    "#": { "role": "wall", "color": "#31572c", "walkable": false }
  },
  "rows": [
    "########",
    "#GGGGGG#",
    "#GPPPPG#",
    "#GGGGGG#",
    "########"
  ]
}
```

Terrain should be rendered before all object layers.

### Edge Layer

Edges make terrain transitions readable.

Edges include:

- path edges;
- path corners;
- shoreline edges;
- water corners;
- cliff edges;
- foundation borders;
- wall trims;
- interior floor trim.

Edges are still map structure, not random decoration.

A practical first version can be another grid layer:

```json
"edges": {
  "legend": {
    " ": null,
    "h": { "asset": "path_edge_thin_mid.png", "assetPack": "outside-route-additional" },
    "c": { "asset": "path_corner_soft_tl.png", "assetPack": "outside-route-additional" }
  },
  "rows": [
    "        ",
    "  hhhh  ",
    " c    c ",
    "        "
  ]
}
```

Edges may also be generated automatically later, but explicit rows are enough for the first contract.

### Boundary Layer

Boundaries shape the playable route and composition.

Boundary examples:

- trees;
- hedges;
- fences;
- building walls;
- cliffs;
- large rocks;
- water borders;
- interior walls if represented as object pieces.

Boundary objects should usually have collision or support a collision region.

Example:

```json
"boundaries": [
  {
    "role": "boundary",
    "assetPack": "outside-route",
    "asset": "pine_tree.png",
    "x": 3,
    "y": 2,
    "footprint": { "w": 1, "h": 1, "blocks": true },
    "visual": { "w": 32, "h": 54, "anchor": "bottom" }
  }
]
```

### Prop Layer

Props are placed objects that communicate story, navigation, atmosphere, or use.

Prop examples:

- signs;
- lamps;
- tables;
- stools;
- mugs;
- bottles;
- flowers;
- benches;
- barrels;
- towels;
- umbrellas;
- crates;
- plants;
- clutter.

Props should not define the main terrain. A beach umbrella is a prop. Sand is terrain. A pub mug is a prop. Pub floor is terrain.

Example:

```json
"props": [
  {
    "role": "routeCue",
    "assetPack": "outside-route",
    "asset": "route_sign_201.png",
    "x": 16,
    "y": 6,
    "footprint": { "w": 1, "h": 1, "blocks": false },
    "visual": { "w": 17, "h": 23, "anchor": "bottom" }
  }
]
```

### Over-Player Layer

The over-player layer is for visuals that should draw above actors.

Examples:

- tree canopies;
- wall tops;
- archways;
- door frames;
- hanging signs;
- overhead lamps;
- foreground trim.

This layer should be used sparingly. It exists to avoid manual depth hacks when the map needs readable overlap.

Example:

```json
"overPlayer": [
  {
    "role": "overhead",
    "assetPack": "pub",
    "asset": "pub_sign.png",
    "x": 10,
    "y": 1,
    "visual": { "w": 34, "h": 19, "anchor": "center" }
  }
]
```

## Collision And Walkability

Collision should be represented as map data.

The target collision model should combine:

1. terrain walkability;
2. object footprints;
3. explicit collision rectangles where needed;
4. trigger zones that can be walkable.

Terrain symbols should define whether they are walkable.

Object footprints should define whether they block movement.

Example:

```json
"collision": {
  "fromTerrain": true,
  "fromFootprints": true,
  "rects": [
    { "x": 18, "y": 4, "w": 3, "h": 2, "reason": "pubBuilding" }
  ]
}
```

The first migration does not need complex collision generation. It only needs the data model to make collision explicit.

## Triggers

Triggers are interactive or automatic map zones.

Triggers include:

- doors;
- transitions;
- story beats;
- punchline zones;
- future reveal/camera cues.

Current `exits` should become or mirror transition triggers.

Example:

```json
"triggers": [
  {
    "id": "pubDoor",
    "type": "transition",
    "x": 19,
    "y": 6,
    "w": 1,
    "h": 1,
    "targetLocation": "pub",
    "spawnPoint": "door",
    "visibleCue": "door"
  }
]
```

Triggers should not be mixed with decorative props. A door image can be a prop or boundary object; the transition zone is a trigger.

## Actor Spawns And Routes

Spawns should stay tile-coordinate based.

Target shape:

```json
"spawns": {
  "player": {
    "default": { "x": 2, "y": 7 }
  },
  "npcs": {
    "townCenter": { "x": 4, "y": 7 }
  }
}
```

Current `playerSpawns` and `npcSpawnPoints` can remain during migration.

NPC routes should remain in scene JSON because they are video-specific story flow, but validation should eventually check that route points:

- are inside the map;
- land on walkable terrain;
- do not run through blocking footprints;
- align with the visible path when the scene expects a guided route.

## Camera And Display Settings

Camera and scale settings should be grouped as display data.

Target shape:

```json
"display": {
  "cameraZoom": 1.45,
  "playerScale": 0.9,
  "propScaleMultiplier": 0.78,
  "cameraMode": "playerFollow"
}
```

The project should keep player-follow as the default. Camera settings should frame an already readable map; they should not be used to compensate for oversized props or unclear terrain.

## Object Roles

Every placed object should eventually have a role.

Recommended roles:

- `terrainDetail`: small tile-like variation that belongs on terrain but does not define the base surface;
- `edge`: path, shoreline, wall, cliff, or foundation transition;
- `boundary`: blocks or frames movement;
- `destination`: marks the target location or reveal endpoint;
- `routeCue`: helps the player/viewer understand where to go;
- `furniture`: tables, chairs, stools, counters, rugs when used as furnishing;
- `surfaceProp`: mugs, plates, bottles, papers, candles;
- `wallDecoration`: shelves, windows, signs, pictures, wall lights;
- `clutter`: small atmosphere detail that does not drive navigation;
- `overhead`: draws above the player;
- `punchline`: destination/reveal-specific exaggeration.

Roles are useful even before they affect runtime behavior. They make validation, reviews, and future tooling possible.

## Object Footprint Metadata

A footprint describes the object's relationship to the grid.

Target footprint fields:

```json
"footprint": {
  "w": 2,
  "h": 1,
  "blocks": true,
  "origin": "bottom-center"
}
```

Target visual fields:

```json
"visual": {
  "w": 32,
  "h": 24,
  "anchor": "bottom",
  "layer": "props"
}
```

Why both exist:

- footprint controls map logic;
- visual controls drawing size and placement.

A tree may visually be tall but only block one or two ground tiles. A hanging sign may visually overlap the player but not block movement. A rug may be visually large but walkable.

## Asset Metadata

Promoted assets should eventually have pack-level metadata.

Possible file:

```text
public/assets/props/<pack>/asset-metadata.json
```

Example:

```json
{
  "table_round.png": {
    "role": "furniture",
    "defaultFootprint": { "w": 2, "h": 2, "blocks": true },
    "defaultVisual": { "w": 30, "h": 28, "anchor": "center" }
  },
  "beer_mug.png": {
    "role": "surfaceProp",
    "defaultFootprint": { "w": 0, "h": 0, "blocks": false },
    "defaultVisual": { "w": 8, "h": 8, "anchor": "center" }
  }
}
```

This should be added after the layer model is accepted. It does not need to block the first layer/schema pass.

## Backward Compatibility

Current locations must keep working during migration.

Existing fields remain valid:

- `map.legend`;
- `map.tiles`;
- `terrain`;
- `props`;
- `exits`;
- `playerSpawns`;
- `npcSpawnPoints`;
- `propAssetPack`;
- per-prop `assetPack`;
- `cameraZoom`;
- `playerScale`;
- `propScaleMultiplier`.

Migration rule:

- If `layers.terrain` exists, new renderers should prefer it.
- If `layers.terrain` does not exist, existing `map.tiles` remains the source of generated terrain.
- If `triggers` exists, it can mirror or eventually replace `exits`.
- If `spawns` exists, it can mirror or eventually replace `playerSpawns` and `npcSpawnPoints`.
- Old flat `props` should continue to render until each location is converted.

The first implementation should add support without changing visual output.

## Town Edge Route Example

A target Town Edge Route should express the route as terrain first.

```json
{
  "id": "town",
  "tileSize": 16,
  "assetPacks": ["outside-route", "outside-route-additional"],
  "layers": {
    "terrain": {
      "legend": {
        "G": { "role": "grass", "color": "#86efac", "walkable": true },
        "P": { "role": "path", "color": "#d9b77d", "walkable": true },
        "S": { "role": "stone", "color": "#c7b7a3", "walkable": true },
        "B": { "role": "buildingFoundation", "color": "#8b5a2b", "walkable": false },
        "D": { "role": "doorstep", "color": "#facc15", "walkable": true },
        "#": { "role": "mapEdge", "color": "#31572c", "walkable": false }
      },
      "rows": [
        "########################",
        "#GGGGGGGGGGGGGGGGGGGGGG#",
        "#GGGGGGGGGGGGGGGGGBBBGG#",
        "#PPPPPPPPPPPPPPPPSSDBGG#",
        "#GPPPPPPPPPPPPPPPSSBBGG#",
        "#GGGGGGGGGGGGGGGGGGGGGG#",
        "########################"
      ]
    },
    "edges": {
      "legend": {
        " ": null,
        "h": { "assetPack": "outside-route-additional", "asset": "path_edge_thin_mid.png", "role": "edge" }
      },
      "rows": [
        "                        ",
        "                        ",
        "                        ",
        "  hhhhhhhhhhhh          ",
        "                        ",
        "                        ",
        "                        "
      ]
    },
    "boundaries": [
      { "role": "boundary", "assetPack": "outside-route", "asset": "pine_tree.png", "x": 3, "y": 2, "footprint": { "w": 1, "h": 1, "blocks": true } },
      { "role": "boundary", "assetPack": "outside-route", "asset": "wooden_fence_section.png", "x": 12, "y": 11, "footprint": { "w": 3, "h": 1, "blocks": true } }
    ],
    "props": [
      { "role": "routeCue", "assetPack": "outside-route", "asset": "route_sign_201.png", "x": 16, "y": 6 },
      { "role": "routeCue", "assetPack": "outside-route", "asset": "lamp_post.png", "x": 17, "y": 6 },
      { "role": "clutter", "assetPack": "outside-route-additional", "asset": "flower_tiny_yellow.png", "x": 15, "y": 9 }
    ]
  },
  "triggers": [
    { "id": "pubDoor", "type": "transition", "x": 19, "y": 6, "w": 1, "h": 1, "targetLocation": "pub", "spawnPoint": "door" }
  ],
  "spawns": {
    "player": { "default": { "x": 2, "y": 7 } },
    "npcs": { "townCenter": { "x": 4, "y": 7 } }
  }
}
```

This example intentionally makes path/foundation terrain, trees/fences boundaries, sign/lamp route cues, and the pub door a trigger.

## Pub Interior Example

A target pub interior should express room grammar directly.

```json
{
  "id": "pub",
  "tileSize": 16,
  "assetPacks": ["pub", "pub-accessory"],
  "layers": {
    "terrain": {
      "legend": {
        "F": { "role": "floor", "color": "#7c2d12", "walkable": true },
        "W": { "role": "wall", "color": "#211611", "walkable": false },
        "B": { "role": "barFloor", "color": "#854d0e", "walkable": true }
      },
      "rows": [
        "WWWWWWWWWWWWWWWWWWWW",
        "WFFFFFFFFFFFFFFFFFFW",
        "WFFBBBBBBBBBBBFFFFFW",
        "WFFFFFFFFFFFFFFFFFFW",
        "WFFFFFFFFFFFFFFFFFFW",
        "WWWWWWWWWWWWWWWWWWWW"
      ]
    },
    "boundaries": [
      { "role": "boundary", "assetPack": "pub", "asset": "wall_back_plain.png", "x": 10, "y": 1, "footprint": { "w": 12, "h": 1, "blocks": true } },
      { "role": "furniture", "assetPack": "pub", "asset": "bar_counter_straight.png", "x": 8, "y": 3, "footprint": { "w": 4, "h": 1, "blocks": true } }
    ],
    "props": [
      { "role": "wallDecoration", "assetPack": "pub", "asset": "bottle_shelf.png", "x": 8, "y": 2 },
      { "role": "furniture", "assetPack": "pub", "asset": "table_round.png", "x": 4, "y": 6, "footprint": { "w": 2, "h": 2, "blocks": true } },
      { "role": "surfaceProp", "assetPack": "pub-accessory", "asset": "beer_mug.png", "x": 4, "y": 6 }
    ],
    "overPlayer": [
      { "role": "overhead", "assetPack": "pub", "asset": "lamp_hanging.png", "x": 5, "y": 1 }
    ]
  },
  "spawns": {
    "player": { "door": { "x": 10, "y": 8 } },
    "npcs": {}
  }
}
```

This example intentionally separates room shell/floor, bar/furniture boundaries, surface props, wall decoration, and overhead decoration.

## Validation Targets

Validation should grow in stages.

First validation pass:

- `layers.terrain.rows` must be rectangular;
- `layers.terrain.legend` must define every non-space symbol used;
- `tileSize` must be a positive number when present;
- triggers must stay inside map bounds;
- spawns must stay inside map bounds;
- raw `object_###.png` paths must not appear in runtime location data.

Second validation pass:

- actor routes should stay inside map bounds;
- actor routes should avoid non-walkable terrain;
- asset packs referenced by props should be known or resolvable;
- footprint widths/heights should be positive when present;
- blocking footprints should stay inside map bounds.

Later validation pass:

- terrain-like roles should not be placed in the prop layer;
- route cues should sit near paths, junctions, or entrances;
- wall decorations should sit near wall terrain or wall boundary objects;
- surface props should sit near furniture or counters;
- doors/triggers should align with visible destination cues.

The later grammar checks can be warnings rather than hard errors.

## Migration Sequence

1. Add schema support for the target fields.

Add optional `tileSize`, `assetPacks`, `display`, `layers`, `collision`, `triggers`, and `spawns`. Keep old fields valid.

2. Add validation for rectangular terrain rows.

This is the smallest useful code change after this document. It should not alter rendering.

3. Convert Town Edge Route to the target layer model.

Town is the safest first conversion because its route is already grid-first.

4. Add renderer support for `layers.terrain`.

The renderer should prefer `layers.terrain` when present and fall back to `map.tiles` when not present. Visual output should initially match the old map as closely as possible.

5. Add renderer support for layer-specific object arrays.

Render boundaries, props, and over-player visuals in stable order. Keep old flat `props` as fallback.

6. Convert Pub to the target layer model.

Make room shell, floor, walkable lanes, bar zone, seating zones, wall decorations, surface props, and over-player details explicit.

7. Convert Beach to the target layer model.

Move sand, water, shoreline, and blocked water into terrain/edge/collision layers. Keep beach chairs, towels, hut, signs, and props as prop/boundary objects.

8. Add asset metadata gradually.

Start with pub and outside-route because they are the active MVP packs.

9. Convert Park and Cafe when their location files are created.

Do not build them through scattered props. Start with the layer model.

## Rules For Future Location Work

- Do not place path, floor, sand, water, or wall surfaces as giant props.
- Do not add decoration until the terrain route or room shell works.
- Do not add water unless water edges make it readable.
- Do not use raw `object_###.png` files in runtime data.
- Do not rely on camera zoom to fix map scale problems.
- Do not mix story triggers with decorative props.
- Do not build a one-off scene layout when a reusable location layer can express it.

## Immediate Next Implementation Task

Add schema and validation support for the target fields without changing rendering.

Concrete scope:

1. Update `public/schemas/location.schema.json` to allow optional `tileSize`, `assetPacks`, `display`, `layers`, `collision`, `triggers`, and `spawns`.
2. Update `scripts/validate-content.js` to validate rectangular `layers.terrain.rows` when present.
3. Add validation that all symbols in `layers.terrain.rows` exist in `layers.terrain.legend` unless the symbol is a space.
4. Do not convert any location yet.
5. Do not change runtime rendering yet.

This is the smallest step that moves the project toward Pokemon/Stardew-style map architecture while keeping current scenes stable.
