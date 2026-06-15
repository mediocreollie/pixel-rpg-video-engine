# Visual Audit

This audit compares the current game implementation against the visual direction in `VISUAL_STYLE.md`, `ART_DIRECTION.md`, `PROJECT_VISION.md`, `AGENTS.md`, and `ASSET_PIPELINE.md`.

No gameplay changes are recommended here.

## Reference Access Limitation

The `references/` image folder could not be inspected in this session because local command execution is blocked by the Windows sandbox ACL issue before files can be listed or opened.

The rules below are derived from the written art direction and should be updated with image-specific findings once reference images can be viewed.

## What Already Aligns

- The project is focused on short-form video creation, not RPG systems.
- The camera is player-follow only, matching DS-era top-down RPG expectations.
- Pub Friend is correctly treated as the current MVP recording test.
- Scene, character, and location data are JSON-driven.
- The dialogue box, menu, and title card structure support DS-era RPG presentation.
- The pub now uses generated placeholder beer, table, bar, and door shapes instead of relying only on labels.
- Town and beach maps are large enough for scrolling.

## What Conflicts With The Visual Style

### The World Is Not Yet The Main Character

The art direction says the environment should be remembered more than individual sprites.

Current gap:

- Town, beach, and gym still read as prototype maps.
- Pub is improving, but still needs stronger environmental storytelling.
- Many areas use flat colour blocks.

### Environmental Density Is Too Low

The art direction says every location should feel lived in.

Current gap:

- Town has broad open areas with limited points of interest.
- Pub has beer/table/bar placeholders but still needs shelves, stools, taps, wall details, floor variation, and lighting.
- Beach and gym are intentionally not polished yet.

### Character Sprites Are Still Debug-Like

Current gap:

- Player and NPC use generated rectangle people.
- They are readable but not DS-era.
- They have no walk-cycle charm or recognisable silhouettes.

However, character polish should not outrank world readability.

### Location Identity Relies Too Much On Labels

Current gap:

- Pub has improved, but several town/location props still use labels.
- Locations should be understood from silhouettes, layout, landmarks, and colour.

### Vertical Recording Needs Real QA

Current gap:

- 9:16 mode exists, but it has not been visually verified due to command/browser testing limits.
- Overlay placement, dialogue coverage, and punchline readability still need phone-format review.

## Specific Visual Gaps

### Pub

- Needs more cosy interior detail.
- Needs stronger bar identity.
- Needs stools, shelves, taps, and drink clusters.
- Needs floor/wall texture.
- Beer punchline is clearer after the generated prop pass, but could still be more abundant and compositionally staged.

### Town

- Needs clearer Adelaide-inspired suburban identity.
- Needs paths, building fronts, windows, greenery, street furniture, and landmarks.
- Needs fewer debug-like labels.
- Needs route readability from environment shapes rather than text.

### Beach

- Needs sand/water edge design.
- Needs scenic reveal composition.
- Needs beach props and scale.
- Should feel bright, open, and recognisable without dialogue.

### Gym

- Needs gym equipment silhouettes.
- Needs interior density.
- Needs visual escalation for the "quick session" joke.

### Characters

- Need smaller, more sprite-like DS-era silhouettes.
- Need readable hair/outfit/accessory cues.
- Should not dominate the screen.

## Reference-Derived Rules

These are hard rules for future development until superseded by direct reference-image analysis.

1. The player should generally occupy no more than 10% of screen height during gameplay.
2. The environment should always be the dominant visual element.
3. Every room should contain at least 5 points of interest before it is considered visually usable.
4. Important joke/reveal rooms should contain at least 8 points of interest.
5. Interiors should not contain large unused floor spaces.
6. Every location needs at least one recognisable landmark.
7. Important exits should be visible through shape, contrast, and placement, not text labels alone.
8. Props should suggest how people use the space.
9. Repeated props are acceptable only when repetition supports the joke.
10. Pub scenes should use warm browns, amber highlights, and dark wood tones.
11. Beach scenes should use warm sand, bright light, and soft blue water.
12. Town scenes should use soft greens, muted roads, and suburban landmarks.
13. Characters should be recognisable through silhouette, hair, outfit colour, or accessories, not facial detail.
14. A two-frame readable walk cycle is preferable to complex weak animation.
15. A screenshot should communicate location and joke without dialogue.

## Revised Improvement Priorities

### 1. Pub Environment Density Pack

Highest impact because Pub Friend is the MVP recording loop.

Add:

- bar shelves
- taps
- stools
- wall signs
- floor texture
- clustered drinks
- warm light accents

### 2. Town Route Readability Pack

Make the journey to the pub visually clear.

Add:

- better road/path tiles
- pub exterior silhouette
- building fronts
- greenery
- sign/door shapes

### 3. Character Sprite Scale Pass

Make player and Jack feel more DS-era without over-polishing.

Add:

- smaller sprite-like bodies
- clearer silhouette
- simple hair/outfit cues
- optional two-frame walking pose later

### 4. Vertical Video Readability Pass

Run visual QA in 9:16 mode once the environment has enough detail.

Check:

- player/NPC scale
- dialogue coverage
- overlay placement
- pub reveal visibility
- door readability

### 5. Beach Scenic Reveal Foundation

Do this only after Pub Friend is visually strong.

Add:

- shoreline
- ocean mass
- beach props
- reveal composition

### 6. Gym Interior Foundation

Do this after Pub and Beach direction are clearer.

Add:

- equipment silhouettes
- mats
- mirrors
- exaggerated visual punchline props

## Recommended First Asset Pack

The first asset pack should be `Pub Friend Environment Pack`.

It should make the pub route and pub reveal readable without final art polish.

See `FIRST_ART_PASS.md` for exact assets, dimensions, order, and expected impact.
