# Development Rules For Agents

## Project Purpose

This project is a pixel RPG video engine for creating short-form social media videos. It is not a traditional RPG.

Every development decision should support fast creation of funny, screen-recordable RPG scenes.

## Primary Rule

Prioritise video creation over game depth.

Build features that help create short scenes with dialogue, movement, reveals, and visual punchlines. Avoid systems that make the project feel like a full RPG unless they directly improve video production.

## Do Build

- JSON-driven scenes
- Reusable maps and locations
- Data-driven characters
- Dialogue tools
- Scripted NPC movement
- Camera and framing tools
- Vertical recording mode
- Simple recording controls
- Visual reveal mechanics
- Placeholder-friendly content workflows

## Do Not Build Unless Explicitly Requested

- Combat
- Levelling
- Inventory systems
- Crafting
- Complex quest systems
- Economy systems
- Realistic graphics
- High-detail animation
- Modern app-style UI that clashes with the DS-era RPG feel

## Scene System Constraints

New video ideas should usually be added through JSON scene files, not by rewriting game logic.

Use the formal content system:

- Scenes live in `public/scenes/`
- Characters live in `public/characters/`
- Locations live in `public/locations/`
- JSON schemas live in `public/schemas/`

Scene JSON should be the preferred home for:

- NPC names
- Dialogue
- Starting locations
- Destinations
- Walking routes
- Camera behaviour
- Punchline props
- Title cards
- Scene-specific setup

Only change core game code when a scene needs a reusable engine capability.

## Content Workflow Goal

The project should move toward a workflow where a new social media RPG video can be created in under 15 minutes by editing scene files.

When adding functionality, prefer tools and data structures that reduce the amount of code needed for future videos.

## Art Direction

Maintain a Nintendo DS-era pixel RPG feel inspired by Pokemon Platinum and HeartGold / SoulSilver.

Use:

- Pixel art
- Warm colours
- Clear silhouettes
- Phone-readable visuals
- Slightly exaggerated proportions

Avoid:

- Realistic visuals
- Overly detailed animation
- UI that feels like a modern dashboard rather than an RPG screen

## Recording Constraints

The engine should remain easy to screen record.

Recording features should stay simple and direct:

- Hide or show UI
- Reset or restart scenes
- Skip dialogue
- Pause NPC movement
- Teleport for setup
- Vertical 9:16 framing

Controls should not require complicated menus during recording.

## Map And World Rules

Prefer reusable locations over one-off maps.

Core reusable locations include:

- Bedroom
- House
- Street
- Town
- Pub
- Beach
- Supermarket
- Park
- Gym
- Cafe

Future content should reuse these locations where possible, with scene-specific props or reveals layered on top.

## Technical Stack

Use the existing stack unless the project owner asks otherwise:

- Phaser 3
- Vite
- JavaScript
- JSON scene files

Potential future integrations:

- Tiled map editor
- Aseprite assets
- GitHub deployment

## Implementation Guidance

Keep engine code reusable and scene content data-driven.

When adding a new capability:

1. Check whether it belongs in JSON first.
2. Add the smallest reusable engine feature needed.
3. Keep controls simple for recording.
4. Preserve the pixel RPG feel.
5. Avoid adding traditional RPG complexity.

## Current Roadmap

Phase 1:

- Movement
- Dialogue
- NPC pathing
- Scene loading

Phase 2:

- Vertical video mode
- Camera improvements
- Character system

Phase 3:

- Multiple maps
- More scenes
- Better pixel art

Phase 4:

- Content creation tools
- Scene editor
- Character editor

Phase 5:

- Full video production workflow
