# Town Route Tile Kit Spec

## Purpose

This document audits the current promoted `outside-route` and `outside-route-additional` assets and defines the minimum tile vocabulary needed for Town Edge Route to read closer to a Pokemon Platinum / Stardew Valley-style route.

This is a specification only. It does not modify runtime code, schemas, location JSON, scene JSON, gameplay, or assets.

## Audit Scope And Limitation

This audit is based on:

- promoted production asset names in `public/assets/props/outside-route/selected-props.json`;
- promoted production asset names in `public/assets/props/outside-route-additional/selected-props.json`;
- current usage in `public/locations/town.json`;
- the target layered architecture and current renderer behavior.

It is not a pixel-level visual inspection of every PNG. Before any final asset metadata is written, the next pass should open the contact sheets and individual promoted PNGs to confirm exact padding, crop quality, and tileability.

## 1. Current Asset Audit

### True Tile Candidates

These are the current assets most likely to work as repeated terrain or edge pieces after visual verification.

From `outside-route`:

- `grass_light.png`: likely usable as a light grass terrain tile.
- `grass_dark.png`: likely usable as a darker grass terrain variation.
- `grass_light_alt.png`: likely usable as alternate grass variation.
- `grass_dark_alt.png`: likely usable as alternate dark grass variation.
- `dirt_tile.png`: possible dirt terrain tile, but should be checked against the current route palette.
- `sand_path_tile.png`: currently used as the Town path tile, but the name suggests sand/path rather than true town dirt. It may be a temporary path centre tile.
- `sand_path_tile_alt.png`: possible alternate path tile.
- `sand_path_square.png`: possible small path fill, but may read as a square patch rather than connected terrain.
- `dirt_path_vertical.png`: possible vertical path tile, but likely too directional for general path fill.
- `pavement_tiles.png`: useful for stone foundation or paved doorstep terrain.
- `stone_path_vertical.png`: possible stone path tile.
- `stone_path_corner.png`: possible foundation or path corner candidate.
- `tall_grass_tile.png`: possible terrain variation, probably better as edge/detail than base terrain.
- `tall_grass_dense.png`: possible dense grass boundary/detail tile, not base grass.

From `outside-route-additional`:

- `path_edge_thin_left.png`: path edge candidate.
- `path_edge_thin_mid.png`: current path edge accent; likely usable as an edge strip.
- `path_edge_thin_alt.png`: alternate edge strip candidate.
- `path_edge_vertical.png`: vertical edge candidate.
- `path_edge_tall.png`: vertical/tall edge candidate, but may be too heavy for subtle path blending.
- `path_corner_soft_tl.png`: top-left corner candidate.
- `path_corner_soft_tr.png`: top-right corner candidate.
- `path_corner_soft_br.png`: bottom-right corner candidate.
- `path_corner_soft_bl.png`: bottom-left corner candidate.
- `path_curve_soft.png`: curve candidate.
- `path_cross_soft.png`: possible junction tile.
- `path_end_soft.png`: possible path end cap.
- `path_round_soft.png`: possible rounded patch, likely decorative rather than structural.
- `path_star_patch.png`: likely a scatter/detail patch rather than structural path.
- `dirt_patch_large.png`, `dirt_patch_medium.png`, `dirt_patch_small.png`, `dirt_patch_leaf.png`, `dirt_patch_round.png`, `dirt_patch_tiny.png`: useful as worn transition/scatter accents, not main terrain.
- `ground_shadow_patch.png` and `small_shadow_patch.png`: useful as detail overlays, not terrain.
- `stone_corner.png`, `stone_wall_low.png`, `stone_block_small.png`: possible foundation/edge candidates, but likely boundary/detail props unless visually tileable.

### Prop Candidates

These should remain placed objects rather than terrain.

From `outside-route`:

- `route_sign_201.png`
- `lamp_post.png`
- `wooden_signpost.png`
- `notice_board.png`
- `stone_post.png`
- `flat_rock.png`
- `large_rock.png`
- `small_rock.png`
- `medium_rock.png`
- `pebble_1.png`
- `pebble_2.png`
- `barrel.png`
- `green_bin.png`
- `red_mailbox.png`
- `bench.png`
- `crate.png`
- `wooden_box.png`
- `flower_planter.png`
- `tree_stump.png`
- `hollow_stump.png`
- `sapling_1.png`
- `sapling_2.png`
- `small_sprout_1.png` through `small_sprout_5.png`
- `tiny_leaf_1.png` through `tiny_leaf_3.png`
- `white_flower_single.png`
- `yellow_flower_single.png`
- `purple_flower_single.png`
- `white_flower_patch.png`
- `flower_patch_white.png`
- `flower_patch_yellow.png`
- `flower_patch_pink.png`
- `flower_patch_purple.png`

From `outside-route-additional`:

- `grass_tuft_1.png` through `grass_tuft_6.png`
- `flower_tiny_pink.png`
- `flower_tiny_white.png`
- `flower_tiny_yellow.png`
- `flower_tiny_blue.png`
- `flower_stem_white.png`
- `flower_yellow_pair.png`
- `grass_clump_medium.png`
- `round_bush_small.png`
- `round_bush.png`
- `bush_small.png`
- `bush_round_alt.png`
- `stone_flower_planter.png`
- `route_lamp.png`
- `notice_board.png`
- `direction_sign.png`
- `door_small.png`
- `window_small.png`
- `doorway_shadow.png`
- `building_shadow_strip.png`

### Boundary Candidates

These are useful for map edges, blockers, visual framing, or destination structure.

From `outside-route`:

- `hedge_edge_left.png` and `hedge_edge_right.png`: possible hedge side/border pieces.
- `hedge_long.png`: useful boundary guide, currently used in Town.
- `bush_large.png`: useful 1x1 or 2x1 soft boundary.
- `round_bush.png` and `round_bush_white_flowers.png`: useful soft boundary/detail.
- `small_bush.png`: useful lower boundary/detail.
- `pine_tree.png`: useful tree wall or corner anchor.
- `small_tree.png`: useful tree wall or corner anchor.
- `wooden_fence_section.png`: useful fence boundary, currently used in Town.
- `fence_posts.png`: possible fence support/end cap.
- `low_stone_wall.png`: possible boundary or raised edge.
- `brick_wall.png`, `brick_post_left.png`, `brick_post_right.png`: current pub destination building/front candidates.
- `arched_doorway.png`: current visible destination door.
- `window_flowerbox.png`: destination/building detail.
- `red_roof_tiles.png`, `red_roof_ridge.png`, `red_roof_corner.png`: possible over-player/building top candidates.
- `stone_wall_vines.png`, `wood_wall_vertical.png`, `wood_wall_corner.png`: possible destination/building wall candidates.
- `grass_cliff_arch_left.png`, `grass_cliff_arch_right.png`, `grass_cliff_wall_tall.png`, `grass_cliff_edge_small.png`, `grass_cliff_column.png`, `grass_cliff_horizontal.png`: possible future route boundary set, but do not use until edge consistency is verified.

From `outside-route-additional`:

- `hedge_corner_small.png`: useful hedge corner candidate.
- `hedge_long_low.png`: useful lower hedge boundary candidate.
- `fence_short.png`: useful short boundary segment.
- `fence_section.png`: useful boundary segment.
- `fence_post.png`: useful fence post/end cap.
- `stone_corner.png`, `stone_wall_low.png`, `stone_block_small.png`: possible stone boundary/foundation pieces.
- `door_small.png`, `window_small.png`, `doorway_shadow.png`, `building_shadow_strip.png`: useful destination/building support details.

### Problem Assets

These assets are not bad assets, but they are risky for terrain or need metadata before use.

Likely not tileable or too object-like for terrain:

- `sand_path_corner_large.png`: likely reads as a large patch/corner rather than a small edge/corner tile.
- `sand_path_square.png`: may read as a separate square pad instead of connected path terrain.
- `dirt_path_vertical.png`: likely only works in one orientation and may not connect cleanly to horizontal path tiles.
- `path_round_soft.png`: likely decorative patch, not structural path.
- `path_star_patch.png`: scatter detail, not a path tile.
- `dirt_patch_large.png`: useful as transition detail but too irregular for repeated terrain.
- `dirt_patch_medium.png`, `dirt_patch_round.png`: detail overlays, not terrain base.
- `grass_cliff_*` assets: likely useful later, but they introduce cliff/water/height language the current Town route does not yet support.
- `red_roof_*` assets: useful for building tops only after an over-player/building layer is defined.
- `brick_wall.png`: useful as destination facade, but it is not a terrain tile and should not be stretched as ground or path.
- `window_flowerbox.png`, `arched_doorway.png`, `door_small.png`, `window_small.png`: destination details, not terrain.
- `ground_shadow_patch.png`, `small_shadow_patch.png`, `building_shadow_strip.png`, `doorway_shadow.png`: overlays only; they should not define terrain shape.

Assets that may have scale/footprint ambiguity:

- `pine_tree.png`, `small_tree.png`: need separate visual footprint and collision footprint; the canopy may belong in an over-player layer later.
- `hedge_long.png`, `hedge_long_low.png`: need a clear tile footprint so hedges align to the grid instead of floating.
- `wooden_fence_section.png`, `fence_section.png`, `fence_short.png`, `fence_post.png`: need segment lengths and end/corner rules.
- `bench.png`: likely 2x1 or 2x2 blocking footprint, but current placement uses visual dimensions manually.
- `lamp_post.png`, `route_lamp.png`: likely 1x1 blocking footprint with a taller visual.
- `route_sign_201.png`, `direction_sign.png`, `wooden_signpost.png`: 1x1 route cue objects, not terrain.

## 2. Missing Tile Vocabulary

### Grass

Needed:

- `grass_base.png`: clean 16x16 base grass tile.
- `grass_dark_variant.png`: subtle darker 16x16 grass variation.
- `grass_light_variant.png`: subtle lighter 16x16 grass variation.
- `grass_scatter_01.png`: sparse texture detail, non-blocking.
- `grass_scatter_02.png`: alternate sparse texture detail.
- `grass_tuft_small.png`: small non-blocking tuft.
- `flower_patch_small.png`: small non-blocking flower detail.
- `flower_patch_medium.png`: medium flower detail for edges and bushes.

Current candidates exist, but they should be confirmed for crop/padding/tileability before being promoted into a dedicated tile pack.

### Path

Needed:

- `dirt_center.png`: clean repeatable 16x16 dirt path centre.
- `dirt_edge_top.png`: top edge transition from dirt to grass.
- `dirt_edge_bottom.png`: bottom edge transition from dirt to grass.
- `dirt_edge_left.png`: left edge transition from dirt to grass.
- `dirt_edge_right.png`: right edge transition from dirt to grass.
- `dirt_corner_outer_tl.png`
- `dirt_corner_outer_tr.png`
- `dirt_corner_outer_br.png`
- `dirt_corner_outer_bl.png`
- `dirt_corner_inner_tl.png`
- `dirt_corner_inner_tr.png`
- `dirt_corner_inner_br.png`
- `dirt_corner_inner_bl.png`
- `dirt_transition_scatter_01.png`
- `dirt_transition_scatter_02.png`
- `dirt_narrow_horizontal.png`
- `dirt_narrow_vertical.png`
- `dirt_arrival_wide.png`

The current path asset names suggest partial coverage, but the set is not complete enough to make a connected route with clean corners and widened arrival space.

### Foundation

Needed:

- `stone_foundation_center.png`
- `stone_foundation_edge_top.png`
- `stone_foundation_edge_bottom.png`
- `stone_foundation_edge_left.png`
- `stone_foundation_edge_right.png`
- `stone_foundation_corner_tl.png`
- `stone_foundation_corner_tr.png`
- `stone_foundation_corner_br.png`
- `stone_foundation_corner_bl.png`
- `stone_doorstep.png`
- `door_approach_tile.png`
- `pub_wall_base_trim.png`

`pavement_tiles.png`, `stone_path_vertical.png`, and `stone_path_corner.png` may help, but they do not yet define a complete foundation vocabulary.

### Boundaries

Needed:

- `hedge_straight_horizontal.png`
- `hedge_straight_vertical.png`
- `hedge_end_left.png`
- `hedge_end_right.png`
- `hedge_end_top.png`
- `hedge_end_bottom.png`
- `hedge_corner_tl.png`
- `hedge_corner_tr.png`
- `hedge_corner_br.png`
- `hedge_corner_bl.png`
- `fence_straight_horizontal.png`
- `fence_straight_vertical.png`
- `fence_post.png`
- `fence_corner_tl.png`
- `fence_corner_tr.png`
- `fence_corner_br.png`
- `fence_corner_bl.png`
- `bush_1x1_a.png`
- `bush_1x1_b.png`
- `tree_small_trunk.png`
- `tree_small_canopy.png`
- `tree_pine_trunk.png`
- `tree_pine_canopy.png`

Current hedge/fence/tree assets are useful, but they need consistent footprints and possibly split trunk/canopy metadata for a proper over-player system.

### Destination / Pub

Needed:

- `pub_foundation_center.png`
- `pub_foundation_edge.png`
- `pub_doorstep.png`
- `pub_door.png`
- `pub_wall_front.png`
- `pub_wall_side.png`
- `pub_roof_front.png` or `pub_upper_wall.png`
- `pub_sign.png`
- `pub_lamp.png`
- `pub_barrel.png`
- `pub_crate.png`
- `pub_flower_box.png`
- `pub_window.png`

Current `brick_wall.png`, `arched_doorway.png`, `window_flowerbox.png`, `lamp_post.png`, `barrel.png`, and `crate.png` can communicate the destination, but they are object-sheet props rather than a coherent pub building kit.

## 3. Recommended Tile Size And Scale

Recommended Town tile size: 16 pixels.

Why:

- `WorldScene` already defaults to `TILE_SIZE = 16`.
- `public/locations/town.json` declares `tileSize: 16`.
- Scene movement paths and triggers are already authored in tile coordinates.
- A 16px base fits the Nintendo DS-era feel and keeps maps compact enough for vertical video.

Recommended actor footprints:

- Player collision footprint: about 0.45 to 0.6 tile wide and 0.45 to 0.6 tile deep.
- Player visual footprint: about 1 tile wide and 1.5 to 2 tiles tall.
- NPC collision footprint: same as player.
- NPC visual footprint: same as player unless a character-specific override is later needed.

Recommended route scale:

- Main path width: 2 to 3 tiles.
- Narrow path: 1 to 2 tiles for small branch/detail, not the main Pub Friend route.
- Pub arrival area: 3 to 4 tiles wide near the door so the entrance reads as a destination.
- Door/trigger footprint: 1x1 tile initially; can become 1x2 if the final pub doorway is wider.

Recommended object footprints:

- Tree trunk: 1x1 blocking footprint.
- Tree canopy: visual can extend 2x2 or 2x3 and may move to over-player later.
- Hedge: 1 tile deep, variable width; usually blocking.
- Fence: 1 tile segment or 2 tile visual segment, blocking or semi-blocking depending placement.
- Bush: 1x1 blocking or decorative depending size.
- Sign: 1x1, usually blocking.
- Lamp: 1x1 blocking with taller visual.
- Bench: 2x1 or 2x2 blocking depending sprite dimensions.
- Pub building: approximately 5x4 to 6x5 blocking footprint in the current 24x14 Town map.
- Pub doorway: 1x1 transition trigger aligned to the doorstep tile.

Honest fit note:

The current outside-route assets are object-sheet crops, not a clean 16x16 tileset. Some can be used as temporary tiles, but they should not be treated as a final tile kit until padding, dimensions, repeatability, and edge alignment are verified.

## 4. Asset Metadata Proposal

Each production tile or object should eventually have metadata like this:

- `id`: stable logical id used by map data.
- `file`: production PNG path or filename.
- `category`: terrain, edge, boundary, prop, destination, detail, overPlayer.
- `layer`: terrain, edges, boundaries, props, overPlayer.
- `footprintW`: footprint width in tiles.
- `footprintH`: footprint height in tiles.
- `blocking`: true or false.
- `anchor`: center, bottom-center, top-left, or tile.
- `tileable`: true or false.
- `allowedRoles`: list of allowed map grammar roles.
- `notes`: placement guidance or known caveats.

Example entries:

```json
{
  "grass_base": {
    "file": "grass_base.png",
    "category": "terrain",
    "layer": "terrain",
    "footprintW": 1,
    "footprintH": 1,
    "blocking": false,
    "anchor": "tile",
    "tileable": true,
    "allowedRoles": ["grass"],
    "notes": "Default Town grass terrain. Should be quiet enough to repeat across the map."
  },
  "dirt_edge_top": {
    "file": "dirt_edge_top.png",
    "category": "edge",
    "layer": "edges",
    "footprintW": 1,
    "footprintH": 1,
    "blocking": false,
    "anchor": "tile",
    "tileable": true,
    "allowedRoles": ["pathEdge"],
    "notes": "Top transition from dirt path to grass. Use only beside dirt centre tiles."
  },
  "pine_tree": {
    "file": "pine_tree.png",
    "category": "boundary",
    "layer": "boundaries",
    "footprintW": 1,
    "footprintH": 1,
    "blocking": true,
    "anchor": "bottom-center",
    "tileable": false,
    "allowedRoles": ["treeWall", "cornerFrame"],
    "notes": "Visual canopy may extend above the blocking trunk and may need over-player support later."
  },
  "route_sign": {
    "file": "route_sign_201.png",
    "category": "prop",
    "layer": "props",
    "footprintW": 1,
    "footprintH": 1,
    "blocking": true,
    "anchor": "bottom-center",
    "tileable": false,
    "allowedRoles": ["routeCue", "destinationCue"],
    "notes": "Place beside paths, bends, junctions, or destination entrances."
  },
  "pub_door_trigger": {
    "file": "pub_door.png",
    "category": "destination",
    "layer": "boundaries",
    "footprintW": 1,
    "footprintH": 1,
    "blocking": false,
    "anchor": "bottom-center",
    "tileable": false,
    "allowedRoles": ["destination", "transitionCue"],
    "notes": "Visual door should align with a separate transition trigger tile."
  }
}
```

## 5. Proposed Dedicated Tile Kit

Recommended future folder:

```text
public/assets/tiles/town-route/
```

This should be a dedicated tile kit, separate from `public/assets/props/outside-route/`, because terrain tiles and prop objects need different rules.

### Required For Minimum Viable Town Route

Grass:

- `grass_base.png`
- `grass_dark_variant.png`
- `grass_light_variant.png`
- `grass_scatter_01.png`

Path:

- `dirt_center.png`
- `dirt_edge_top.png`
- `dirt_edge_bottom.png`
- `dirt_edge_left.png`
- `dirt_edge_right.png`
- `dirt_corner_outer_tl.png`
- `dirt_corner_outer_tr.png`
- `dirt_corner_outer_br.png`
- `dirt_corner_outer_bl.png`
- `dirt_transition_scatter_01.png`
- `dirt_transition_scatter_02.png`

Foundation:

- `stone_foundation_center.png`
- `stone_foundation_edge_top.png`
- `stone_foundation_edge_bottom.png`
- `stone_doorstep.png`
- `door_approach_tile.png`

Boundaries:

- `hedge_straight_horizontal.png`
- `hedge_end_left.png`
- `hedge_end_right.png`
- `fence_straight_horizontal.png`
- `fence_post.png`
- `bush_1x1.png`
- `tree_small.png`
- `tree_pine.png`

Destination:

- `pub_wall_front.png`
- `pub_door.png`
- `pub_window.png`
- `pub_sign.png`
- `pub_lamp.png`

### Nice-To-Have For Polish

Grass/detail:

- `grass_tuft_small.png`
- `grass_tuft_medium.png`
- `flower_patch_small_white.png`
- `flower_patch_small_yellow.png`
- `flower_patch_medium_mixed.png`
- `leaf_scatter_01.png`

Path:

- `dirt_corner_inner_tl.png`
- `dirt_corner_inner_tr.png`
- `dirt_corner_inner_br.png`
- `dirt_corner_inner_bl.png`
- `dirt_narrow_horizontal.png`
- `dirt_narrow_vertical.png`
- `dirt_arrival_wide.png`
- `dirt_end_left.png`
- `dirt_end_right.png`

Foundation/destination:

- `stone_foundation_edge_left.png`
- `stone_foundation_edge_right.png`
- `stone_foundation_corner_tl.png`
- `stone_foundation_corner_tr.png`
- `stone_foundation_corner_br.png`
- `stone_foundation_corner_bl.png`
- `pub_wall_side.png`
- `pub_upper_wall.png`
- `pub_roof_front.png`
- `pub_flower_box.png`
- `pub_barrel.png`
- `pub_crate.png`

Boundaries:

- `hedge_straight_vertical.png`
- `hedge_corner_tl.png`
- `hedge_corner_tr.png`
- `hedge_corner_br.png`
- `hedge_corner_bl.png`
- `fence_straight_vertical.png`
- `fence_corner_tl.png`
- `fence_corner_tr.png`
- `fence_corner_br.png`
- `fence_corner_bl.png`
- `tree_canopy_overplayer.png`

### Not Needed Yet

- Water tiles.
- Pond edges.
- Cliff edges.
- Stairs.
- Roof variants beyond one simple pub front.
- Road/asphalt tiles.
- Seasonal variants.
- Animated tiles.
- Full Tiled editor export.

Water and cliffs should wait until edge/corner assets exist. Adding them early will recreate the current layout problem in another form.

## 6. How This Affects Town Edge Route

After the tile kit exists, Town should be rebuilt like this:

1. Paint terrain from small tiles.

   Use `grass_base` as the map base, then paint dirt path centre tiles from the left-middle entrance to the pub door. Use dark/light grass variants sparingly near boundaries.

2. Apply path edges and corners consistently.

   Use edge/corner tiles for every visible grass-to-dirt transition. Avoid single large path patches. The path should read as one continuous surface.

3. Build the pub destination from foundation and door tiles.

   Use stone foundation centre/edge tiles, a doorstep, and a visible door that aligns with the `pubDoor` trigger.

4. Place boundaries by footprint.

   Trees, hedges, fences, bushes, and the pub building should use blocking footprints. Their visuals can extend beyond the footprint, but movement logic should stay grid-readable.

5. Add story cues.

   Place the sign and lamp near the pub approach after the route and door already read. They should reinforce the destination rather than carry the whole destination read.

6. Add decoration last.

   Flowers, tufts, small rocks, dirt scatter, and shadows should sit near path edges, bushes, fences, and building edges. They should not occupy the centre of open grass or define the route.

7. Keep large path/floor props out of terrain.

   Do not use `sand_path_corner_large.png`, `sand_path_square.png`, or large stretched images as the route surface. Terrain should come from repeated small tile assets.

## 7. Immediate Next Recommendation

Can we build a better Town Edge Route with existing assets?

Partially, but not enough to reach the target reference cleanly.

The existing promoted assets can support a better interim route because they include grass variants, path fills, soft path edges, corners, hedges, fences, trees, signs, lamps, flowers, and building pieces. However, they are object-sheet crops, not a coherent 16x16 town route tileset. The missing pieces are a clean dirt centre tile, matched edge/corner tiles, matched foundation tiles, and consistent footprint metadata.

Recommendation:

Create a new dedicated Town Route tile sheet before the next major Town rebuild.

Suggested generation prompt:

```text
Create a transparent PNG pixel-art tile sheet for a Nintendo DS-era top-down RPG town route, inspired by Pokemon Platinum and Stardew Valley readability but original. Use a strict 16x16 grid with no uneven spacing. Include warm soft-green grass, subtle grass variations, small grass scatter, dirt path centre tile, dirt path top/bottom/left/right edges, outer and inner dirt path corners, worn dirt-to-grass transition scatter, narrow path variants, widened arrival path tile, stone foundation centre and edges, doorstep tile, simple pub wall base trim, hedge straight/end/corner pieces, fence straight/post/corner pieces, 1x1 bushes, small tree and pine tree with clear 1x1 trunk footprint, pub front wall, pub door, pub window, pub sign, pub lamp, small barrel, crate, and flower/window-box support pieces. Keep the palette warm, readable on phone video, low-detail but charming, with clean silhouettes and consistent scale. Do not include characters. Do not include UI. Do not include random large props. All tiles and objects should align to a 16x16 grid and be suitable for a Pokemon-style route map.
```

After that sheet exists, the next task should be to extract or slice it into `public/assets/tiles/town-route/`, create metadata for the required tiles, and then rebuild Town Edge Route using the dedicated tile kit.
