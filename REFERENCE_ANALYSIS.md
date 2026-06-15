# Reference Analysis

## Access Note

The `references/` image folder could not be inspected in this session because local file commands are blocked by the Windows sandbox ACL issue before they can enumerate or open files.

This analysis is therefore based on the written reference direction in:

- `ART_DIRECTION.md`
- `VISUAL_STYLE.md`
- `VISUAL_AUDIT.md`
- `PROJECT_VISION.md`
- `AGENTS.md`
- `ASSET_PIPELINE.md`

Once the reference images can be viewed, this file should be updated with image-specific observations.

## Character Scale

The written direction makes character scale secondary to the world. Characters should feel small inside the environment and should generally occupy about 5-10% of the visible play space.

Current implementation:

- Player and NPC are readable, but they are still blocky generated placeholders.
- The camera zoom makes characters feel easy to see, but they may still feel visually dominant because the environment lacks detail.

Gap:

- Characters need DS-era silhouettes, but the environment should become richer before characters receive heavy polish.

## Environment Scale

The world should feel larger than the player. Town, pub, beach, gym, cafe, supermarket, and other locations should be memorable spaces.

Current implementation:

- Town and beach maps are large enough to scroll.
- Pub is compact and functional for the punchline.
- Pub is the clearest MVP location.

Gap:

- Maps are structurally scaled but not yet visually rich.
- The current environment still reads as a prototype grid rather than a place.

## Environmental Density

Every location should feel lived in. Empty floors, empty walls, large unused spaces, and giant colour blocks should be avoided.

Current implementation:

- Pub has gained generated beer, bar, table, and door placeholders.
- Town still has broad open areas and simple labelled props.
- Beach and gym remain broad placeholders.

Gap:

- Pub needs more useful density: stools, shelves, taps, wall signs, floor texture, and grouped drink clusters.
- Town needs landmarks and ground detail.

## Prop Density

Props should communicate how people use the space.

Current implementation:

- Pub props now communicate the joke better than before.
- Many non-pub props are still simple rectangles or text labels.

Gap:

- Prop density should increase only where it improves readability, humour, or location identity.

## Colour Palettes

The intended palette is warm, inviting, nostalgic, and phone-readable.

Use:

- warm browns
- soft greens
- sandy yellows
- muted blues
- amber highlights

Avoid:

- harsh saturation
- neon colours
- pure black shadows

Current implementation:

- Pub uses warm browns and golds.
- Town uses bright greens and greys.
- Beach uses sand and blue.

Gap:

- Colours need harmonising and less flatness.
- Pub is closest to the intended palette.

## Interior Design Patterns

Interiors should be cosy, warm, and full of environmental storytelling.

Expected patterns:

- wood tones
- bar counters
- varied furniture
- shelves
- posters
- stools
- glasses
- warm lighting

Current implementation:

- Pub has the beginning of this pattern with bar, table, and beer placeholder shapes.

Gap:

- Pub still needs wall/floor texture, stool variation, shelves, taps, and clustered drinks.

## Exterior Design Patterns

Exterior locations should feel inspired by real life, especially Adelaide suburbs, local beaches, shopping strips, parks, cafes, pubs, and gyms.

Current implementation:

- Town has functional exits and signs.
- Pub exterior is obvious but still simplified.

Gap:

- Exterior landmarks need stronger silhouettes and more grounded real-life inspiration.
- Town needs building fronts, windows, paths, greenery, and small landmark props.

## Camera Framing

The camera should be simple DS-era player-follow only.

Current implementation:

- Camera follows the player.
- Camera is constrained to map bounds.
- No cinematic camera beats are active.

Gap:

- Needs visual QA in 9:16 mode once commands/browser testing works.

## World-To-Character Ratio

The environment should dominate the screen. The player should never dominate the screen.

Recommended target:

- Player should occupy no more than 10% of screen height.
- Environment should supply the main visual interest.

Current implementation:

- Ratio is structurally close, but the low-detail environment makes characters feel more important than intended.

Gap:

- Improve environmental density before increasing character detail.

## Lighting Style

Lighting should create atmosphere.

Expected lighting:

- Pub: warm orange light, dark wood, amber highlights
- Beach: bright sunlight, warm sand, soft blue water
- Town: daylight, greenery, subtle contrast
- Night: cool blue shadows, warm windows

Current implementation:

- Lighting is represented mostly by flat colours.

Gap:

- Add simple highlight/shadow colour bands in future tile and prop assets.

## Visual Storytelling Techniques

The environment should deliver the joke.

For Pub Friend:

1. Normal request
2. Journey through town
3. Pub reveal
4. Exaggerated beer quantity

Current implementation:

- The sequence exists.
- Pub interior has a visual punchline.

Gap:

- The screenshot should be understandable without dialogue. Pub is closer, but town and beach are not there yet.

## Comparison Against Current Implementation

The current game has the correct structure and interaction flow. The largest visual gap is that the world does not yet feel like the main character.

The current implementation is strongest in:

- player-follow camera
- scene selector
- dialogue system
- Pub Friend loop structure
- generated pub beer/table/bar placeholders

The current implementation is weakest in:

- environmental density
- location landmarks
- tile texture
- cosy interior storytelling
- Adelaide-inspired exterior specificity
- phone-size visual QA

## Immediate Takeaway

The next art work should not be broad polish. It should be a focused Pub Friend environment pack that makes the pub and its route readable without relying on labels.
