# Building Windows desktop for EaglyMC (Electron)

This repository now includes an Electron scaffold to wrap the existing `EaglyMC` static folder into a desktop application.

Local build notes
- To run the app locally on Linux for testing the UI (will download Linux Electron binary):

```bash
npm ci
npm start
```

- To build a Windows portable executable you can use GitHub Actions (recommended) — a workflow `build-windows` is included and runs on `windows-latest`.

Build on Windows (local)
1. On a Windows machine (or a Windows CI runner) install Node.js (v18+ recommended).
2. Run:

```bash
npm ci
npm run build-win
```

This will produce artifacts under `dist/`.

Why CI? Building Windows installers/portable builds on Linux requires additional cross-compilation tooling (Wine/Mono) and is often simpler and more reliable when built on a Windows runner.
