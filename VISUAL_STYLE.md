# Pixel RPG Video Engine Visual Style Guide

## Purpose

This guide defines the intended visual direction for Pixel RPG Video Engine.

The project should feel like a Nintendo DS-era top-down RPG built for short-form video recording. It should be readable on a phone, warm, expressive, and immediately understandable during a quick social media clip.

The goal is not visual realism. The goal is a stylised, reusable pixel RPG world that can support funny, recordable scenes.

## Core Visual Direction

Inspired by:

- Pokemon Platinum
- Pokemon HeartGold / SoulSilver
- Nintendo DS-era town and interior RPG scenes

The game should feel:

- Warm
- Clear
- Playful
- Slightly exaggerated
- Readable at phone size
- Built from reusable pixel locations

Avoid:

- Realistic graphics
- Modern dashboard UI styling
- Overly detailed animation
- Dark, low-contrast scenes
- Environments that only work for one joke

## Character Scale

Characters should be small but readable, similar to DS-era top-down RPG sprites.

Target feel:

- Larger than strict realism
- Simple head/body silhouette
- Clear outfit colours
- Easy to identify in vertical video
- Readable against grass, roads, pub floors, beach sand, and interiors

Characters should not become tiny dots in the frame. If the camera is vertical, the player and NPC should still read clearly near the centre of the screen.

## Character Style

Characters can be inspired by real people, but should be stylised rather than realistic.

Keep people recognisable through:

- Hair shape
- Outfit colour
- Broad silhouette
- Signature accessories
- General vibe

Avoid:

- Realistic facial features
- Photo tracing
- High-detail portraits
- Detailed anatomy

Walking sprites can be created later as simple four-direction pixel sheets.

## Map Scale

Maps should be large enough for the player-follow camera to scroll and reveal new areas.

Each location should have:

- Clear paths
- Obvious exits
- Readable landmarks
- Enough space to follow an NPC
- Boundaries that keep the camera inside the world

Town and beach maps should feel wider than a single screen, especially in 9:16 vertical mode.

Interior maps such as the pub can be smaller, but should still be visually readable and not feel empty.

## Environment Detail

Environment detail should communicate function quickly.

Good placeholder detail:

- Signs
- Roads
- Doors
- Tables
- Counters
- Water edges
- Sand areas
- Simple props arranged in readable groups

Avoid clutter. Props should support the scene joke or location identity.

## Pub Direction

The pub should be the first complete visual test.

It should clearly communicate:

- This is a pub
- This is the entrance
- This is the interior
- The punchline is absurd beer quantity

Useful placeholder elements:

- Pub sign
- Highlighted door
- Bar counter
- Tables
- Rows or clusters of beer props
- Warm brown/gold palette

The beer punchline should be readable instantly in a short clip.

## Town Direction

The town should be a reusable hub for many videos.

It should include:

- Roads or paths
- Clear building fronts
- Obvious exits to other locations
- Simple landmarks
- Enough open walking space for following NPCs

The town should stay generic enough to support pub, beach, gym, cafe, supermarket, and other scenes.

## Beach Direction

The beach should be a scenic reveal location.

It should include:

- Sand
- Water
- A strong ocean shape
- Simple beach props
- High contrast between walkable sand and blocked water

The beach should eventually support a large visual reveal.

## UI Direction

UI should feel like a DS-era RPG, not a modern web app.

Use:

- Simple bordered panels
- Pixel-style typography
- Speaker name plates
- Large bottom dialogue box
- Clear menu cursor
- Minimal controls visible during recording

Avoid:

- Glassy app-like panels where the game should feel diegetic
- Overly modern gradients
- Complex menus during recording

## Vertical Video Readability

The game is designed for TikTok, Reels, and Shorts.

In 9:16 mode:

- Player and NPC should remain readable
- Dialogue should fit comfortably
- Title cards should be centred and legible
- UI should not cover important action
- Paths and doors should be obvious without zooming in manually

## Placeholder Policy

Placeholders are allowed while the engine is being built.

Good placeholders:

- Communicate layout clearly
- Use simple colour coding
- Show where final art will go
- Make jokes readable

Bad placeholders:

- Look like random debug rectangles
- Hide exits or character routes
- Make location identity unclear
- Make the punchline hard to understand

## Visual Priorities

Highest priority:

1. Pub Friend MVP loop clarity
2. Player/NPC readability
3. Clear pub door and route
4. Beer punchline readability
5. DS-era dialogue/menu feel
6. Vertical video framing
7. Reusable town and location layouts

Lower priority for now:

- Final character art
- Final tilesets
- Music and sound
- Animation polish
- Cinematic camera effects
