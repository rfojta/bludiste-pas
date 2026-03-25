# Web SPA Structure

This folder contains the browser version of the original Delphi maze application.

## Layout

- `index.html`
  The browser entry point. It defines the DOM structure only and loads the stylesheet and JavaScript modules.
- `css/styles.css`
  All page styling for the SPA.
- `js/`
  ES module source code. Each class lives in its own file.

## JavaScript Classes

- `AppConfig`
  Static application configuration. It holds limits such as `MIN_SIZE`, `MAX_SIZE`, the Delphi file size calculation, the bundled `lab.dat` path, the default colors, and the movement direction table.
- `MazeRandom`
  Stateless random helpers. It provides `randomInt()` and `randomPermutation()` for maze generation and search traversal.
- `MazeModel`
  The central state container. It stores the maze arrays, colors, Minotaur position, animation state, and low-level maze operations such as `canMove()`, `openWall()`, `toggleWall()`, and path reset.
- `MazeGenerator`
  Maze construction logic. It uses an iterative depth-first traversal to carve a connected maze without relying on the JavaScript call stack.
- `MazeSolver`
  Path search logic. It reproduces the Pascal behavior by recording forward steps and backtracking steps, again using an iterative stack instead of recursion.
- `DelphiMazeCodec`
  Binary file import/export. It reads and writes the Delphi-compatible `.dat` layout, converts between Delphi color integers and CSS hex colors, and accepts older files whose stored array size is smaller than the current `MAX_SIZE`.
- `CanvasRenderer`
  Rendering layer. It owns the `<canvas>` context, resize logic, coordinate mapping, and all drawing of walls, path segments, and the Minotaur.
- `MazeApp`
  Application coordinator. It wires DOM events to the model, invokes the generator/solver/codec/renderer, manages the timer used for animation, updates the UI text and controls, and handles editing interactions.

## Class Relationships

- `MazeApp` is the top-level orchestrator.
- `MazeApp` creates one `MazeModel` instance and shares it with `MazeGenerator`, `MazeSolver`, `DelphiMazeCodec`, and `CanvasRenderer`.
- `MazeGenerator` and `MazeSolver` mutate or read `MazeModel` state, but they do not touch the DOM directly.
- `CanvasRenderer` reads from `MazeModel` and draws the current state to the canvas.
- `DelphiMazeCodec` translates between the in-memory `MazeModel` representation and the binary `.dat` file representation.
- `AppConfig` and `MazeRandom` are support modules used by the other classes.

## Runtime Flow

1. `js/app.js` waits for `DOMContentLoaded`, then creates `MazeApp`.
2. `MazeApp.init()` binds UI events, sizes the canvas, and tries to load the bundled `../lab.dat`.
3. User actions trigger `MazeApp` methods.
4. `MazeApp` delegates domain logic to `MazeGenerator`, `MazeSolver`, or `DelphiMazeCodec`.
5. After every meaningful state change, `MazeApp` asks `CanvasRenderer` to redraw.

## Notes

- The bundled maze file is still expected at the repository root as `lab.dat`, so `web/index.html` fetches it via `../lab.dat`.
- Imports are backward-compatible with smaller historical `.dat` files, so the original `50x50` data file can still be opened even when `MAX_SIZE` is larger.
- The iterative generator and solver were kept specifically to support larger `MAX_SIZE` values without stack overflow.
