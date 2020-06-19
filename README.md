# eye
Attempt to build an VR/AR IDE using WebXR APIs. Goal is to improve productivity compared to monitors by a long shot. Fast enough to work on your mobile phone. Imagine if using just a keyboard and a VR headset, you could code 1.5x-2x faster. That's the goal, not saying it's achievable but I'm trying.

## v0.1 roadmap
We need three things:
- A web browser with dev tools (working already, performance needs improvement).
- A great terminal (rendering working, raycasting and keyboard events in progress).
- A code editor with language server support that literally covers all your view and is a pleasure to use, not some pussy-ass 40-60 line length bullshit.
  - All the files you're importing in your active file should be open in the background with connections leading to them.
  - The type information for the active token should be visible always without covering the code. Not sure about the UI for this yet.
    - Always visible type information for other tokens in the same line but with less detail.
    - Always visible type information for nearby lines but with even less detail.
  - Constant autocomplete without blocking code. Not sure about the UI for this yet either.
  
## 1.0 ideas
- Multiple workspaces that you can move around in. You never close a project, you physically move from one to another.
