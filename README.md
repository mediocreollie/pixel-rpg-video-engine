# Pixel RPG Video Engine

A tiny Phaser 3 + Vite JavaScript project for making short, top-down pixel RPG video scenes.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local URL printed by Vite. Use arrow keys or WASD to move, and press Space near an NPC to talk.

## Current MVP

The current priority test scene is `Pub Friend`.

This is the first complete recording loop:

- Choose `Pub Friend` from the scene selector
- Walk around town with the player-follow camera
- Talk to Jack
- Follow Jack along the road to the pub
- Enter the obvious pub door
- Reveal the placeholder pub interior and beer punchline

- Top-down player movement with arrow keys and WASD
- Placeholder pixel player and NPC
- JSON-powered town scene
- Recording-friendly landscape and 9:16 portrait canvas modes
- Start/reset, title card, and debug UI controls
- Dialogue box
- NPC line: "Ollie, we need to go to the pub."
- NPC walks a scripted path after dialogue
- Pub door changes to the pub interior
- Pub interior contains a very sensible number of beer placeholders

## Current Architecture

The project is a reusable short-form video scene engine, not a traditional RPG.

The runtime starts in `src/main.js`, loads Phaser, then runs:

- `src/game/BootScene.js`: loads the content manifest and queues scene, character, and location JSON files
- `src/game/MenuScene.js`: shows the DS-era scene selector before gameplay starts
- `src/game/WorldScene.js`: connects the selected scene to reusable character and location data, builds the map, spawns actors, runs dialogue, handles scripted movement, and shows punchline/title overlays
- `src/game/ui/DialogueBox.js`: renders the simple RPG dialogue box

The current camera is intentionally simple: it always follows the player during gameplay, uses fixed DS-era smoothing, and stays constrained to the current location's map bounds. Scene JSON does not currently drive cinematic pans, camera beats, or cutscene-style movement.

Content lives in three linked JSON folders:

- `public/scenes/`: video scripts
- `public/characters/`: reusable cast members
- `public/locations/`: reusable maps, props, exits, and spawn points
- `public/assets/`: future sprites, location art, music, sound effects, and UI polish

Schemas live in:

- `public/schemas/scene.schema.json`
- `public/schemas/character.schema.json`
- `public/schemas/location.schema.json`

The runtime does lightweight validation for required fields and broken links. Missing optional fields fall back to safe defaults where practical. Missing core content shows content warnings and uses fallback data instead of intentionally crashing the game.

## Recording Controls

The game includes a recording-friendly overlay for short-form video capture. It shows the current scene, current location, and the most important keys while setting up a shot.

Use the buttons in the lower-left corner:

- `Restart Scene` restarts the current scene
- `Use 9:16 Canvas` switches to a vertical TikTok/Reels-friendly canvas
- `Replay Title Card` replays the JSON title card overlay
- `Hide Overlay` hides the recording overlay and setup buttons before recording. Press `H` to bring them back.

Keyboard shortcuts:

- `R` resets the current scene
- `T` replays the title card
- `H` hides or shows the recording overlay
- `F` toggles fullscreen
- `?` opens the controls screen

Overlay visibility is remembered between sessions.

The player controls stay simple for capture: move with arrow keys or WASD, then press Space or Enter to talk, advance dialogue, or dismiss a title card.

## Controls

The game has an always-visible `?` help button. Press it, or press the `?` key, to open the controls screen.

Movement:

- WASD
- Arrow Keys

Scene controls:

- `R` = Restart Scene
- `T` = Replay Title Card
- `H` = Hide/Show Recording Overlay
- `F` = Fullscreen
- `?` = Show Controls
- `Escape` = Return to Scene Select during gameplay

Future controls:

- Reserved for future features

## Choose A Scene

The game opens on a DS-era scene selector menu before gameplay starts.

Use:

- `Up` / `Down` or `W` / `S` to choose a scene
- `Space` or `Enter` to start the selected scene

The menu is loaded from `public/scenes/manifest.json`. Each listed scene can show:

- `title`
- `startingLocation`
- `description`
- asset status

Example:

```json
{
  "id": "pub",
  "title": "Pub Friend",
  "description": "Follow Jack through town to a pub with a deeply sensible amount of beer.",
  "startingLocation": "town"
}
```

`description` is optional. Missing descriptions show a simple fallback in the menu.

The menu also shows whether the selected scene is still using placeholder assets or has custom asset paths configured. This is based on optional character, location, and scene asset fields such as `sprite.path`, `portrait.path`, `musicPath`, `ambiencePath`, `revealSoundPath`, and `transitionSoundPath`.

## Validate Content

Run content validation before recording or publishing changes:

```bash
npm run validate-content
```

This checks every JSON file in:

- `public/scenes/`
- `public/characters/`
- `public/locations/`

It validates the files against the schemas in `public/schemas/` and checks cross-file references, including scene characters, locations, dialogue actor IDs, movement actor IDs, and location exits.

## Add A New Scene

Scene files live in `public/scenes/`. Characters live in `public/characters/`. Reusable maps live in `public/locations/`.

The content system is split into three schemas:

- `public/schemas/scene.schema.json`
- `public/schemas/character.schema.json`
- `public/schemas/location.schema.json`

To add a new video scene:

1. Create a new JSON file, for example `public/scenes/chippy.json`.
2. Add it to `public/scenes/manifest.json`.
3. Reuse an existing character from `public/characters/` or add a new one.
4. Reuse an existing location from `public/locations/` or add a new one.
5. Set `startingLocation`, `destinationLocation`, dialogue, movement path, and punchline reveal in the scene JSON.

## How Scene JSON Connects To Characters And Locations

`public/scenes/manifest.json` lists all loadable content. A scene can only use characters and locations that are listed in the manifest.

A scene connects to locations with:

- `startingLocation`: the map where the video begins
- `destinationLocation`: the map used for the visual punchline or reveal

A scene connects to characters with `participatingCharacters`.

Example:

```json
{
  "id": "jack",
  "character": "friend-jack",
  "spawnPoint": "townCenter"
}
```

In that example:

- `id` is the scene-local actor name used by dialogue and movement
- `character` points to `public/characters/friend-jack.json`
- `spawnPoint` must exist in the current location's `npcSpawnPoints`

Dialogue uses the scene-local actor ID:

```json
{
  "speaker": "jack",
  "text": "Ollie, we need to go to the pub."
}
```

Scripted movement also uses the scene-local actor ID:

```json
{
  "actor": "jack",
  "trigger": "afterDialogue",
  "path": [
    { "x": 9, "y": 6 },
    { "x": 11, "y": 6 }
  ]
}
```

Locations connect to other locations with `exits`. During a scene, exits are filtered so only the exit to the scene's `destinationLocation` is active.

## Dialogue JSON

Dialogue comes from a scene's `dialogueSequence` array. Each line uses a scene-local actor ID from `participatingCharacters`.

```json
{
  "dialogueSequence": [
    {
      "speaker": "jack",
      "text": "Ollie, we need to go to the pub."
    },
    {
      "speaker": "jack",
      "text": "No time to explain."
    }
  ]
}
```

The engine opens dialogue when the player presses Space or Enter near the matching NPC. The same keys also control the dialogue box:

- Press Space or Enter during a typewriter line to reveal the full line instantly.
- Press Space or Enter after the line finishes to advance to the next page.
- The dialogue closes after the final page, then any `afterDialogue` scripted movement can start.

Character files control the speaker display style:

```json
{
  "name": "Jack",
  "dialogueColor": "#facc15",
  "portrait": {
    "asset": "generated",
    "backgroundColor": "#1f2937",
    "shirtColor": "#ef4444",
    "faceColor": "#fde68a",
    "hairColor": "#111827"
  }
}
```

`portrait` is optional. If it is missing, the dialogue box generates a simple placeholder portrait from the character sprite colours.

Character JSON can also include future asset paths:

```json
{
  "sprite": {
    "asset": "placeholder",
    "path": "/assets/characters/friend-jack-walk.png"
  },
  "portrait": {
    "asset": "generated",
    "path": "/assets/characters/friend-jack-portrait.png"
  }
}
```

These fields are optional. Missing paths do not crash the game.

## Title Cards

Title cards are optional and come from scene JSON. If `titleCard` is missing, the game still runs.

```json
{
  "titleCard": {
    "showOnStart": true,
    "title": "Beach Day",
    "subtitle": "A quick walk to the world's largest scenic reveal",
    "duration": 2400,
    "background": "#0f172a",
    "alpha": 0.9,
    "color": "#f8fafc",
    "subtitleColor": "#bae6fd"
  }
}
```

`duration` is measured in milliseconds. Press `T` to replay the current scene's title card.

Scene JSON can also include optional future sound paths:

```json
{
  "revealSoundPath": "/assets/sfx/punchline-sting.wav",
  "transitionSoundPath": "/assets/sfx/scene-transition.wav"
}
```

Location JSON can include optional future audio paths:

```json
{
  "musicPath": "/assets/music/town-loop.mp3",
  "ambiencePath": "/assets/music/pub-ambience.mp3"
}
```

The current game still uses placeholders if these paths are missing.

## Asset Folders

Assets are planned but not final yet. The game currently uses generated placeholder characters, placeholder props, and no committed final music or sound effects.

Use these folders when final assets are added:

- `public/assets/characters/`: character sprites, portraits, walking sheets, emotes
- `public/assets/locations/`: tiles, reusable backgrounds, location art
- `public/assets/music/`: loopable background tracks
- `public/assets/sfx/`: dialogue blips, footsteps, doors, transitions, reveal stings, menu sounds
- `public/assets/ui/`: dialogue textures, title card frames, menu cursors, fade overlays

Use lowercase kebab-case filenames:

- `friend-jack-walk.png`
- `friend-jack-portrait.png`
- `pub-tiles.png`
- `town-loop.mp3`
- `door-enter.wav`
- `dialogue-box-texture.png`

Do not commit copyrighted assets unless they are licensed for this project. Private reference photos should stay outside the public repo when needed.

Example scene entry:

```json
{
  "id": "chippy",
  "file": "/scenes/chippy.json"
}
```

## Known Limitations

- Runtime validation is intentionally lightweight. The JSON schema files document the content shape, but there is not yet a full schema validator in the browser build.
- Placeholder rectangle sprites are still used instead of real pixel art assets.
- Dialogue supports multiple pages, a typewriter effect, speaker colours, and generated placeholder portraits.
- Scene selection is currently controlled by `manifest.json` start scene rather than an in-game scene picker.
- Recording controls are simple and useful, but pause NPC movement and teleport still need a formal implementation.
- Build validation may be blocked in this local environment by the Windows sandbox command ACL issue.

## Next Recommended Task

Add a dedicated scene picker or launch setting so creators can choose between `pub`, `beach`, and `gym` videos without editing the manifest each time.

Minimal scene file:

```json
{
  "id": "chippy",
  "title": "Chippy Run",
  "startingLocation": "town",
  "destinationLocation": "chippy",
  "participatingCharacters": [
    {
      "id": "mate",
      "character": "friend-jack",
      "spawnPoint": "townCenter"
    }
  ],
  "dialogueSequence": [
    {
      "speaker": "mate",
      "text": "We should probably go somewhere else now."
    }
  ],
  "scriptedMovements": [
    {
      "actor": "mate",
      "trigger": "afterDialogue",
      "path": [
        { "x": 4, "y": 3 },
        { "x": 5, "y": 4 }
      ]
    }
  ],
  "punchlineReveal": {
    "text": "The chippy was somehow bigger than expected."
  },
  "titleCard": {
    "showOnStart": true,
    "title": "Chippy Run",
    "subtitle": "A new short scene",
    "background": "#111827",
    "alpha": 0.9
  }
}
```
