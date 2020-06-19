# eye
Attempt to build an VR/AR IDE using WebXR APIs. Goal is to improve productivity compared to monitors by a long shot. Fast enough to work on your mobile phone. Imagine if using just a keyboard and a VR headset, you could code 1.5x-2x faster. That's the goal, not saying it's achievable but I'm trying.

The devices to make the full use of this idea are not ready yet (something like Magic Leap but actually good i.e. higher resolution and FOV, or even VR headsets with 4k in each eye). But I want the software to be ready before the hardware catches up.

Productivity user interfaces in XR are still a very nascent field, nobody's solved the problem in substantial way yet. This project also aims to explore and implements in that area.

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
- Sane window management, thinking sort of a 360 degree flex box thing. You can put shit behind you.
  
## 1.0 ideas
- Multiple workspaces that you can move around in. You never close a project, you physically move from one to another.
- For front-end, connect the browser's elements to the actual code. In real time. Like when you focus on an element, it's highlighted in the browser.

# Architecture
I'm building it using react-three-fiber. The benefit of using React should be obvious, we can build something easily extendable, people just have to write their own components and that'll be our plugins (on the front-end side at least).
Parcel for the bundler (could change), but it supports React fast refresh which is awesome (in dev mode updates are reflected in the VR environment instantly without disrupting the camera).
For the back-end, I'll be using Theia IDE and their client-side websockets and webworker. Essentially this is a new front-end for Theia.
