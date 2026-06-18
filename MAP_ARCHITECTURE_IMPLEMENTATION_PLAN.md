# Map Architecture Implementation Plan

## 1. Current State

The project now has a real architectural direction instead of only local scene fixes.

What works now:

- `ARCHITECTURE_REVIEW.md`, `REFERENCE_MAP_ARCHITECTURE.md`, and `TARGET_MAP_ARCHITECTURE.md` define the problem and target map model.
- `public/schemas/location.schema.json` allows the first target fields: map metadata, layered map data, collision, triggers, spawns, and display settings.
- `src/game/WorldScene.js` can render a layered location when `layers.terrain.rows` exists.
- `public/locations/town.json` is the first proof location using `layers.terrain`, `layers.edges`, `layers.boundaries`, `layers.props`, `collision`, `triggers`, and `spawns`.
- Pub and beach still load through the older compatible map/prop structure.
- The object atlas workflow can extract, review, select, and promote named production PNG assets for the current scene packs and support packs.

What still does not look right:

- Town has a layered structure, but it does not yet have a proper route tile vocabulary.
- Grass is still mostly a large flat field with limited tile variation.
- The dirt path is grid-based, but visually it is still broad and simple rather than built from centre, edge, corner, and blend tiles.
- Path-edge accents exist, but they are not yet a complete connected edge/corner system.
- Trees, hedges, fences, signs, lamps, and building pieces are layered, but many still feel like placed images rather than grid-authored map objects.
- Footprints exist in a few placements, but there is no shared production asset footprint catalogue.
- Pub and beach remain old-style compatible maps, so the project still has multiple map-building patterns.

Why the current route still differs from the Pokemon/Stardew reference:

- Pokemon/Stardew-style maps get readability from a small, repeated tile vocabulary, not from a few large prop images.
- Connected paths need centre tiles, side edges, corners, end caps, scatter transitions, and arrival/foundation pieces.
- Boundaries need object footprints and predictable grid alignment.
- Decoration should soften an already readable route; it should not be responsible for defining the route.
- The current promoted outside-route assets are useful, but they have not yet been audited as a coherent tile kit.

## 2. Key Design Insight

The remaining gap is not just more assets or better placement.

The core issue is that the engine needs a true tile vocabulary.

Terrain needs to be painted on a grid. Path, grass, foundation, walls, water, and floors should be map surfaces first. Props should sit on top of that terrain. Objects need footprints so the renderer, validator, and scene author agree on what blocks movement, what decorates, and what can draw above the player.

The right order is:

1. Terrain.
2. Collision and walkability.
3. Destination structure.
4. Boundaries.
5. Props.
6. Small decoration.

If the route is unclear at step 3, adding more flowers, signs, or lamps will not fix it. Decoration should be the final pass after the map already reads.

## 3. Starting-From-Scratch Ideal Workflow

The ideal map-building workflow for this project is:

1. Decide tile size.

   Use one map tile size for the location, currently 16 pixels unless a location explicitly proves it needs something else.

2. Define player/NPC footprint.

   The player should behave like a roughly 1 tile wide actor with a small collision body and a visual height of about 1.5 to 2 tiles.

3. Build terrain tile kit.

   Prepare terrain tiles for grass, dirt, floor, sand, water, foundation, and other base surfaces before placing objects.

4. Build edge/corner tile kit.

   Prepare path edges, corners, transitions, water edges, wall trim, foundation borders, and end caps.

5. Define collision/walkability.

   Decide which terrain symbols are walkable, blocked, water, wall, foundation, or trigger approach.

6. Define object footprints.

   Give each production object a grid footprint and blocking rule before relying on it in a scene.

7. Paint map terrain.

   Build the playable route or room floor as rows of terrain symbols.

8. Place boundaries.

   Add trees, hedges, fences, building walls, cliffs, counters, or interior walls to shape movement.

9. Place destination.

   Add the door, pub front, hut, bar, punchline object, or destination landmark so the viewer understands where the route is going.

10. Add triggers.

   Add transition, reveal, or story zones aligned with visible destination tiles.

11. Add actors/NPC routes.

   Place spawns and scripted movement routes on walkable cells that match the visible route.

12. Add decoration last.

   Add flowers, tufts, bottles, mugs, small shadows, papers, and other atmosphere only after the route and destination already read.

## 4. Town Route Tile Kit Plan

The Town Edge Route needs a minimum tile vocabulary before it can really match the DS-era RPG reference.

### Grass

- Base grass.
- Darker grass variation.
- Lighter grass variation.
- Grass tuft.
- Small flower patch.
- Medium flower patch.

Purpose:

Grass should stop reading as a flat green fill. Variation should be subtle and placed near boundaries, path edges, bushes, and corners.

### Path

- Dirt centre.
- Path edge top.
- Path edge bottom.
- Path edge left.
- Path edge right.
- Outer corners.
- Inner corners.
- Worn/scatter transition.
- Narrow path variant.
- Widened arrival path variant.

Purpose:

The path should be a continuous terrain surface. It should support a mostly left-to-right route, a gentle curve, and a wider arrival area near the pub entrance without looking like separate carpet blocks.

### Foundation

- Stone foundation centre.
- Stone edge.
- Doorstep.
- Door approach tile.

Purpose:

The pub should sit on a believable foundation. The door should have a readable approach tile that aligns with the transition trigger.

### Boundaries

- Hedge straight.
- Hedge end cap.
- Hedge corner.
- Fence straight.
- Fence post.
- Bush 1x1.
- Tree footprint variants.

Purpose:

Boundaries should frame the route and guide movement. Hedges and fences need ends/corners so they stop feeling like isolated images.

### Destination / Pub

- Pub wall/base footprint.
- Pub door trigger tile.
- Pub sign.
- Lamp.
- Barrel/crate.
- Flower strip/window box.

Purpose:

The pub should be the strongest destination read on the right side of the route. Sign, lamp, foundation, doorway, and small supporting detail should all point to the same endpoint.

Do not generate or replace these assets in this planning phase. This is the vocabulary that the next asset/spec task should classify or request.

## 5. Object Footprint Plan

Production assets need footprint metadata so scene authors are not guessing scale and collision by eye every time.

Target metadata should distinguish visual size from map footprint.

Examples:

- Flower: decorative, non-blocking, 1 tile or smaller.
- Grass tuft: decorative, non-blocking, 1 tile or smaller.
- Sign: route cue prop, usually blocking or semi-blocking, 1x1.
- Lamp: route cue prop, blocking, 1x1.
- Bench: prop, blocking, 2x1 or 2x2 depending on sprite shape.
- Hedge: boundary, blocking, variable width, usually 1 tile deep.
- Fence: boundary, blocking, 1 tile segments with posts/corners.
- Tree: boundary, blocking trunk, larger visual top, possible over-player canopy layer.
- Pub building: destination/boundary, multi-tile blocking footprint.
- Pub door: trigger, walkable or interactable tile aligned with visible doorway.

Target footprint fields:

```json
{
  "footprint": {
    "w": 1,
    "h": 1,
    "blocks": true,
    "origin": "bottom-center"
  },
  "visual": {
    "w": 24,
    "h": 36,
    "anchor": "bottom"
  }
}
```

The footprint tells the map how the object behaves. The visual tells the renderer how it looks. A tree can be visually tall but block only its trunk. A pub sign can draw above the player while not blocking movement. A flower can have no collision at all.

## 6. Renderer / System Requirements

The smallest useful future engine changes are:

- True tile rendering using each location's `tileSize`.
- Terrain rows painted cell-by-cell from the canonical `layers.terrain` model.
- Terrain legend support for asset-backed tiles, not only color-backed fallback cells.
- Optional edge/corner selection through explicit `layers.edges.rows` first, with auto-edge generation later only if useful.
- Object footprints rendered into collision when `footprint.blocks` is true.
- Collision/walkability grid that can combine terrain rules, object footprints, and explicit collision rectangles.
- Trigger grid for doors, transitions, punchlines, and later reveal beats.
- Over-player layer for tree canopies, wall tops, door frames, hanging signs, and similar tall pieces.
- Validation for asset size assumptions, row widths, invalid layer names, missing asset packs, missing assets, footprints, trigger bounds, spawn bounds, and collision consistency.

Keep this small. The goal is not a full RPG engine or a map editor. The goal is enough structure that short video scenes can be authored quickly without rebuilding visual logic one screenshot at a time.

## 7. Migration Sequence

1. Audit current promoted town/outside-route assets for true tiles vs prop-like assets.

   Review `public/assets/props/outside-route/` and `public/assets/props/outside-route-additional/`. Classify what can act as terrain tile, edge/corner tile, boundary object, prop, or decoration.

2. Create `TOWN_ROUTE_TILE_KIT_SPEC.md`.

   Document usable tiles, usable props, scale/padding problems, missing tiles, and the minimum asset requests needed to match the reference look.

3. Generate or assemble the minimum tile kit.

   Only after the spec exists, create or promote the missing terrain and edge pieces. Prefer fewer clean tiles over many vague objects.

4. Add asset metadata for tile size, category, footprint, blocking, and render layer.

   Start with outside-route and outside-route-additional assets used by Town. Do not try to catalogue every pack at once.

5. Update the renderer only enough to paint tile terrain properly.

   Support asset-backed terrain tiles, edge rows, footprint collision, and fallback color cells. Avoid unrelated refactors.

6. Rebuild Town Edge Route with the tile kit.

   Keep the existing route story: spawn on the left, follow the path, reach the pub on the right. Replace broad path symbols and ad hoc edges with the audited tile vocabulary.

7. Confirm Town visually.

   Check that the route reads in vertical video, the player/NPC scale feels correct, Jack follows the visible path, and the pub door is clearly reachable.

8. Convert Pub interior to the same model.

   Use room shell, continuous floor, wall/trim edge layers, bar boundary, furniture footprints, surface props, wall decorations, and an over-player layer if needed.

9. Convert Beach.

   Move sand, water, shoreline, and blocked water into terrain and edge layers before placing umbrellas, towels, hut pieces, signs, and props.

10. Only then continue Park/Cafe.

   Park and cafe should start from the target layer model, not from scattered props.

## 8. Stop-Doing List

- Stop using large path images as terrain.
- Stop using props to fake terrain.
- Stop adding ponds or water before edge and corner tiles exist.
- Stop screenshot-fixing one object at a time when the terrain vocabulary is missing.
- Stop creating new object sheets before tile, scale, and footprint rules are defined.
- Stop converting more scenes before Town proves the system.
- Stop relying on camera zoom to solve map scale problems.
- Stop mixing route, boundary, destination, terrain, and decoration in one flat prop list.
- Stop using raw `object_###.png` files in runtime map data.

## 9. Immediate Next Task

Next Codex task:

Audit the existing outside-route and outside-route-additional promoted assets and create `TOWN_ROUTE_TILE_KIT_SPEC.md`.

That task should classify:

- usable tile assets;
- usable prop assets;
- assets with scale or padding problems;
- missing tiles required for the reference look.

It should not modify runtime code, schemas, scenes, locations, or gameplay. It should only establish the concrete tile vocabulary needed before the next Town visual rebuild.
