# Pixel RPG Video Engine Vision

## Overview

Pixel RPG Video Engine is a browser-based pixel RPG inspired by Pokemon Platinum and Nintendo DS-era games.

The goal is not to build a traditional RPG. The goal is to create short-form video content by screen recording interactive scenes inside a reusable RPG world.

Each video should feel like a small adventure where the player explores a situation, follows a character, and reaches a visual punchline.

Example:

- A friend says, "We need to go to the pub."
- The player follows them through town.
- They enter the pub.
- The pub contains an absurd amount of beer.

Another example:

- A partner says, "Let's go to the beach."
- The player walks with them through town.
- They reach the beach.
- A giant ocean scene is revealed.

The game acts as a storytelling engine for social media content.

## Core Design Principles

### 1. Videos First

Every feature should support content creation.

Do not build RPG systems that do not improve videos.

Avoid:

- Combat
- Levelling
- Inventory systems
- Crafting
- Complex quests

Prioritise:

- Dialogue
- Character movement
- Visual reveals
- Funny scenes
- Simple interactions

### 2. Reusable World

The same maps should support many videos.

Core locations:

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

New videos should mostly reuse existing locations.

### 3. Scene Driven

All videos should be defined by JSON files.

Example scene file: `pub-quest.json`

Scene files should contain:

- NPC name
- Dialogue
- Starting location
- Destination
- Walking route
- Camera behaviour
- Punchline props

The goal is for new videos to require minimal coding.

## Technical Architecture

Current stack:

- Phaser 3
- Vite
- JavaScript
- JSON scene system

Formal content types:

- Scene: the short video idea, including title, starting location, cast, dialogue, movement, destination, punchline, and camera settings
- Character: reusable cast data, including name, sprite, movement speed, dialogue colour, and future emotes
- Location: reusable world data, including map name, exits, props, and NPC spawn points

Future possibilities:

- Tiled map editor
- Aseprite assets
- GitHub deployment

## MVP

### Player

- Top-down movement
- WASD controls
- Arrow key controls
- Simple sprite

### NPCs

- Dialogue
- Scripted movement
- Follow routes

### Dialogue

Dialogue should use a Pokemon-style dialogue box.

It should support:

- Character name
- Multiple pages
- Typewriter effect

## Maps

Initial maps:

### Town

Contains:

- Road
- Pub entrance
- Beach path

### Pub

Contains:

- Tables
- Beer props

### Beach

Contains:

- Water
- Sand
- Scenic reveal

## Video Mode

The engine should support a vertical layout for short-form social video.

Target resolution:

- 1080 x 1920

Designed for:

- TikTok
- Instagram Reels
- YouTube Shorts

## Recording Features

Recording mode should support:

- Hide UI key
- Reset scene key
- Restart scene key
- Instant teleport key
- Pause NPC movement
- Dialogue skip

## Character System

Characters should be data-driven.

Example: `friend-jack.json`

Contains:

- Name
- Sprite
- Dialogue style

Example: `beth.json`

Contains:

- Name
- Sprite
- Dialogue style

## Future Content Ideas

### Pub Friend

Follow a friend to the pub.

Reveal: a ridiculous amount of beer.

### Beach Day

Follow a partner to the beach.

Reveal: a huge ocean.

### Gym Friend

Friend says: "Quick session."

Reveal: a massive gym.

### Coffee Friend

Friend says: "Just grabbing coffee."

Reveal: an entire city filled with cafes.

### Adelaide Mode

Explore recognisable Adelaide-inspired locations.

This could become a future content series.

## Art Style

Inspired by:

- Pokemon Platinum
- HeartGold / SoulSilver
- Nintendo DS RPGs

Requirements:

- Pixel art
- Warm colours
- Readable on phones
- Slightly exaggerated proportions

Avoid:

- Realistic graphics
- Modern UI styling
- High-detail animation

## Audio, Art, and Asset Direction

The project should use placeholders until the content engine is stable.

Future art should turn real-world inspiration into stylised DS-era pixel characters and reusable locations. Real photos can guide colour, silhouette, and layout, but final assets should remain exaggerated, readable, and non-realistic.

Future audio should support short-form video production with loopable music, small sound effects, dialogue blips, transition sounds, and punchline stings. Copyrighted music or sound should not be committed unless it is licensed for this project.

Asset paths should stay optional in JSON so scenes continue working with generated placeholders.

## Development Roadmap

### Phase 1

- Movement
- Dialogue
- NPC pathing
- Scene loading

### Phase 2

- Vertical video mode
- Camera improvements
- Character system

### Phase 3

- Multiple maps
- More scenes
- Better pixel art

### Phase 4

- Content creation tools
- Scene editor
- Character editor

### Phase 5

- Full video production workflow

## Long-Term Goal

The long-term goal is to create new social media RPG videos in under 15 minutes by editing scene files rather than writing new code.
