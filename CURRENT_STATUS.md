# Current Status

## What Currently Works By Static Review

- The app boots through `BootScene`, loads `public/scenes/manifest.json`, then opens the DS-era `MenuScene`.
- `Pub Friend` is listed in the manifest and is the current priority MVP test scene.
- The menu can display scene title, description, starting location, and placeholder/custom asset status.
- Selecting `Pub Friend` starts `WorldScene` with the pub scene ID.
- The title card is loaded from `public/scenes/pub.json` and appears at the start of the town scene.
- The town location loads from `public/locations/town.json`.
- The player spawns at the town default spawn.
- Jack spawns at the `townCenter` NPC spawn point.
- Dialogue comes from the pub scene `dialogueSequence`.
- Jack's dialogue colour and generated portrait data come from `public/characters/friend-jack.json`.
- Jack's scripted path leads along the road toward the pub door.
- The pub door exit points to the `pub` location.
- Entering the pub switches to `public/locations/pub.json`.
- The pub interior has placeholder bar, table, and beer props for the punchline.
- The camera remains player-follow only and is constrained to the active map bounds.
- `Escape` returns from gameplay to the scene selector.
- `R` restarts the current gameplay scene while gameplay is active.
- `H` hides or shows the recording overlay and persists that setting.
- `?` opens the controls screen.

## Pub Visual Pass Before/After

Before:

- The Pub Friend loop was readable mostly through text labels like `BEER`, `TABLE`, and `DOOR`.
- The pub punchline worked conceptually, but it looked like a debug layout rather than a DS-era RPG scene.

After:

- Beer props render as simple generated pint-glass placeholders.
- Tables render as table silhouettes with beer props on top.
- The bar renders as a warm counter with beer shapes.
- The pub door renders as a door shape instead of a text-labelled rectangle.

Visual problem solved:

The main Pub Friend punchline now reads more visually and less textually. This matters because short-form video viewers should understand the pub reveal quickly, especially in 9:16 recording mode.

## Untested Due To Sandbox Command Issue

The local command runner is still blocked before npm can start with:

```text
helper_unknown_error: apply deny-read ACLs
```

Because of that, these have not been verified by command execution in this session:

- `npm run validate-content`
- `npm run build`
- Browser/manual Phaser runtime behaviour
- Actual keyboard feel in the canvas
- Exact camera framing in 9:16 mode

## Manual Test Checklist

1. Run `npm install` if dependencies are not installed.
2. Run `npm run validate-content`.
3. Run `npm run build`.
4. Run `npm run dev`.
5. Open the local Vite URL.
6. Confirm the scene selector appears before gameplay.
7. Confirm `Pub Friend` is selectable.
8. Confirm the menu shows the Pub Friend title, description, starting location, and asset status.
9. Press `Space` or `Enter` to start Pub Friend.
10. Confirm the title card appears.
11. Press `Space` or wait for the title card duration.
12. Confirm town loads and the player appears.
13. Confirm Jack appears near the player.
14. Walk around town and confirm the camera follows the player without showing outside the map.
15. Stand near Jack and press `Space` or `Enter`.
16. Confirm the DS-era dialogue box opens.
17. Confirm the typewriter effect runs.
18. Press `Space` mid-line and confirm the line completes instantly.
19. Press `Space` again and confirm dialogue closes.
20. Confirm Jack starts walking toward the pub door.
21. Follow Jack and confirm the player can move freely along the route.
22. Walk into the highlighted pub door.
23. Confirm the pub interior loads.
24. Confirm the beer punchline is visually obvious.
25. Press `Escape` and confirm the scene selector returns.
26. Start Pub Friend again and confirm the scene still loads.
27. Start Pub Friend, press `R`, and confirm the scene restarts.
28. Press `H` and confirm the recording overlay hides/shows.
29. Press `?` and confirm the controls screen opens.
30. Toggle 9:16 canvas mode and repeat the key checks for readability.

## Next Recommended Task

Run the manual checklist above, then fix only the issues found in the Pub Friend loop before expanding beach or gym content.
