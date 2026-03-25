import AppConfig from "./AppConfig.js";
import MazeModel from "./MazeModel.js";
import MazeGenerator from "./MazeGenerator.js";
import MazeSolver from "./MazeSolver.js";
import DelphiMazeCodec from "./DelphiMazeCodec.js";
import CanvasRenderer from "./CanvasRenderer.js";

export default class MazeApp {
  constructor() {
    this.elements = this.getElements();
    this.model = new MazeModel();
    this.generator = new MazeGenerator(this.model);
    this.solver = new MazeSolver(this.model);
    this.codec = new DelphiMazeCodec();
    this.renderer = new CanvasRenderer(this.elements.canvas, this.model);
    this.timerId = null;
    this.dragToggled = new Set();
    this.dragButton = null;
  }

  getElements() {
    return {
      canvas: document.getElementById("mazeCanvas"),
      dimensionInput: document.getElementById("dimensionInput"),
      speedInput: document.getElementById("speedInput"),
      generateBtn: document.getElementById("generateBtn"),
      solveBtn: document.getElementById("solveBtn"),
      stopBtn: document.getElementById("stopBtn"),
      moveMinotaurBtn: document.getElementById("moveMinotaurBtn"),
      emptyBtn: document.getElementById("emptyBtn"),
      loadBundledBtn: document.getElementById("loadBundledBtn"),
      loadBtn: document.getElementById("loadBtn"),
      saveBtn: document.getElementById("saveBtn"),
      fileInput: document.getElementById("fileInput"),
      statusText: document.getElementById("statusText"),
      wallColorInput: document.getElementById("wallColorInput"),
      forwardColorInput: document.getElementById("forwardColorInput"),
      backtrackColorInput: document.getElementById("backtrackColorInput"),
      minotaurOutlineInput: document.getElementById("minotaurOutlineInput"),
      minotaurFillInput: document.getElementById("minotaurFillInput"),
      wallSwatch: document.getElementById("wallSwatch"),
      forwardSwatch: document.getElementById("forwardSwatch"),
      backtrackSwatch: document.getElementById("backtrackSwatch"),
      minotaurSwatch: document.getElementById("minotaurSwatch")
    };
  }

  async init() {
    this.elements.dimensionInput.max = String(AppConfig.MAX_SIZE);
    this.syncControlsFromModel();
    this.bindEvents();
    this.renderer.resize();

    try {
      await this.loadBundledMaze();
    } catch (_error) {
      this.generateMaze();
    }
  }

  bindEvents() {
    this.elements.generateBtn.addEventListener("click", () => this.generateMaze());
    this.elements.solveBtn.addEventListener("click", () => this.toggleSolve());
    this.elements.stopBtn.addEventListener("click", () => this.finishSolve(true));
    this.elements.moveMinotaurBtn.addEventListener("click", () => {
      this.model.chooseRandomMinotaur();
      this.stopAndClearPath();
      this.updateStatus("Minotaur moved to a random cell.");
      this.renderer.draw();
    });
    this.elements.emptyBtn.addEventListener("click", () => {
      this.stopTimer();
      this.model.emptyMaze();
      this.updateStatus("Maze walls cleared.");
      this.updateSolveButtons();
      this.renderer.draw();
    });
    this.elements.loadBundledBtn.addEventListener("click", async () => {
      try {
        await this.loadBundledMaze();
      } catch (error) {
        this.updateStatus(`Could not load bundled lab.dat: ${error.message}`);
      }
    });
    this.elements.loadBtn.addEventListener("click", () => this.elements.fileInput.click());
    this.elements.saveBtn.addEventListener("click", () => this.saveMaze());
    this.elements.fileInput.addEventListener("change", async (event) => this.handleFileInput(event));
    this.elements.speedInput.addEventListener("input", () => this.handleSpeedChange());
    this.elements.dimensionInput.addEventListener("change", () => this.handleDimensionChange());

    this.elements.wallColorInput.addEventListener("input", (event) => this.setColor("zdi", event.target.value));
    this.elements.forwardColorInput.addEventListener("input", (event) => this.setColor("tam", event.target.value));
    this.elements.backtrackColorInput.addEventListener("input", (event) => this.setColor("zpet", event.target.value));
    this.elements.minotaurOutlineInput.addEventListener("input", (event) => this.setColor("mino1", event.target.value));
    this.elements.minotaurFillInput.addEventListener("input", (event) => this.setColor("mino2", event.target.value));

    this.elements.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    this.elements.canvas.addEventListener("mousedown", (event) => this.handleMouseDown(event));
    this.elements.canvas.addEventListener("mousemove", (event) => this.handleMouseMove(event));

    window.addEventListener("mouseup", () => {
      this.dragButton = null;
      this.dragToggled.clear();
    });
    window.addEventListener("resize", () => this.renderer.resize());
  }

  syncControlsFromModel() {
    this.elements.dimensionInput.value = String(this.model.dimension);
    this.elements.speedInput.value = String(this.model.speedMs);
    this.elements.wallColorInput.value = this.model.colors.zdi;
    this.elements.forwardColorInput.value = this.model.colors.tam;
    this.elements.backtrackColorInput.value = this.model.colors.zpet;
    this.elements.minotaurOutlineInput.value = this.model.colors.mino1;
    this.elements.minotaurFillInput.value = this.model.colors.mino2;
    this.elements.wallSwatch.style.background = this.model.colors.zdi;
    this.elements.forwardSwatch.style.background = this.model.colors.tam;
    this.elements.backtrackSwatch.style.background = this.model.colors.zpet;
    this.elements.minotaurSwatch.style.background =
      `linear-gradient(135deg, ${this.model.colors.mino1} 0%, ${this.model.colors.mino1} 48%, ${this.model.colors.mino2} 48%, ${this.model.colors.mino2} 100%)`;
    this.updateSolveButtons();
  }

  updateStatus(message) {
    this.elements.statusText.textContent = message;
  }

  updateSolveButtons() {
    this.elements.stopBtn.disabled = this.model.solveState === "idle";
    if (this.model.solveState === "running") {
      this.elements.solveBtn.textContent = "Pause";
    } else if (this.model.solveState === "paused") {
      this.elements.solveBtn.textContent = "Continue";
    } else {
      this.elements.solveBtn.textContent = "Solve";
    }
  }

  stopTimer() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  stopAndClearPath() {
    this.stopTimer();
    this.model.clearPath();
    this.updateSolveButtons();
  }

  generateMaze() {
    this.stopTimer();
    const requestedDimension = Number(this.elements.dimensionInput.value) || this.model.dimension;
    this.generator.generate(requestedDimension);
    this.syncControlsFromModel();
    this.updateStatus("Generated a new maze. Left-drag edits walls, right-click moves the Minotaur.");
    this.renderer.draw();
  }

  toggleSolve() {
    if (this.model.solveState === "running") {
      this.pauseSolve();
      return;
    }
    if (this.model.solveState === "paused") {
      this.resumeSolve();
      return;
    }
    this.startSolve();
  }

  startSolve() {
    this.model.pathSteps = this.solver.buildSolvePath();
    this.model.pathIndex = 0;
    this.model.solveState = "running";
    this.model.editing = false;
    this.updateSolveButtons();
    this.updateStatus("Searching for the Minotaur with the original randomized depth-first walk.");
    this.stopTimer();
    this.timerId = window.setInterval(() => {
      if (this.model.pathIndex < this.model.pathSteps.length) {
        this.model.pathIndex += 1;
        this.renderer.draw();
        return;
      }
      this.finishSolve(false);
    }, this.model.speedMs);
    this.renderer.draw();
  }

  pauseSolve() {
    this.stopTimer();
    this.model.solveState = "paused";
    this.model.editing = false;
    this.updateSolveButtons();
    this.updateStatus("Search paused.");
  }

  resumeSolve() {
    this.model.solveState = "running";
    this.model.editing = false;
    this.updateSolveButtons();
    this.updateStatus("Search resumed.");
    this.stopTimer();
    this.timerId = window.setInterval(() => {
      if (this.model.pathIndex < this.model.pathSteps.length) {
        this.model.pathIndex += 1;
        this.renderer.draw();
        return;
      }
      this.finishSolve(false);
    }, this.model.speedMs);
  }

  finishSolve(stoppedEarly) {
    this.stopTimer();
    if (stoppedEarly) {
      this.model.pathIndex = this.model.pathSteps.length;
    }
    this.model.solveState = "idle";
    this.model.editing = true;
    this.updateSolveButtons();
    this.updateStatus(stoppedEarly ? "Search stopped. Full recorded path remains visible." : "Search completed.");
    this.renderer.draw();
  }

  setColor(key, value) {
    this.model.setColor(key, value);
    this.syncControlsFromModel();
    this.renderer.draw();
  }

  handleSpeedChange() {
    this.model.setSpeed(this.elements.speedInput.value);
    if (this.model.solveState === "running") {
      this.resumeSolve();
    }
  }

  handleDimensionChange() {
    const value = Number(this.elements.dimensionInput.value) || this.model.dimension;
    this.elements.dimensionInput.value = String(this.model.clamp(value, AppConfig.MIN_SIZE, AppConfig.MAX_SIZE));
  }

  async handleFileInput(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      this.codec.importFromBuffer(buffer, this.model);
      this.syncControlsFromModel();
      this.updateStatus(`Loaded maze from ${file.name}. The Minotaur position is randomized, matching the Delphi program.`);
      this.renderer.draw();
    } catch (error) {
      this.updateStatus(`Failed to open ${file.name}: ${error.message}`);
    } finally {
      this.elements.fileInput.value = "";
    }
  }

  async loadBundledMaze() {
    const response = await fetch(AppConfig.BUNDLED_LAB_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    this.stopTimer();
    this.codec.importFromBuffer(buffer, this.model);
    this.syncControlsFromModel();
    this.updateStatus("Loaded maze from lab.dat. The Minotaur position is randomized, matching the Delphi program.");
    this.renderer.draw();
  }

  saveMaze() {
    const blob = new Blob([this.codec.exportToBuffer(this.model)], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bludiste.dat";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
    this.updateStatus("Saved maze as a Delphi-compatible .dat file.");
  }

  handleMouseDown(event) {
    this.dragToggled.clear();
    this.dragButton = event.button;
    if (event.button === 2) {
      this.placeMinotaur(event);
      return;
    }
    if (event.button === 0) {
      this.handleWallGesture(event, 4);
    }
  }

  handleMouseMove(event) {
    if (this.dragButton === 0 && (event.buttons & 1) === 1) {
      this.handleWallGesture(event, Math.max(8, Math.round(this.renderer.getCellMetrics().h)));
    }
  }

  handleWallGesture(event, strictness) {
    if (!this.model.editing) {
      return;
    }
    const rect = this.elements.canvas.getBoundingClientRect();
    const px = this.model.clamp(event.clientX - rect.left, 0, this.renderer.canvasCssWidth);
    const py = this.model.clamp(event.clientY - rect.top, 0, this.renderer.canvasCssHeight);
    const { w, h } = this.renderer.getCellMetrics();
    const col = Math.min(this.model.dimension - 1, Math.floor(px / w));
    const row = Math.min(this.model.dimension - 1, Math.floor(py / h));
    const offsetX = px - (col * w);
    const offsetY = py - (row * h);
    const thresholdX = w / strictness;
    const thresholdY = h / strictness;

    const candidates = [];
    if (offsetX < thresholdX && col > 0) {
      candidates.push({ kind: "vert", x: col, y: row + 1 });
    }
    if (offsetX > w - thresholdX && col < this.model.dimension - 1) {
      candidates.push({ kind: "vert", x: col + 1, y: row + 1 });
    }
    if (offsetY < thresholdY && row > 0) {
      candidates.push({ kind: "horiz", x: col + 1, y: row });
    }
    if (offsetY > h - thresholdY && row < this.model.dimension - 1) {
      candidates.push({ kind: "horiz", x: col + 1, y: row + 1 });
    }

    let changed = false;
    for (const candidate of candidates) {
      const key = `${candidate.kind}:${candidate.x}:${candidate.y}`;
      if (this.dragToggled.has(key)) {
        continue;
      }
      this.dragToggled.add(key);
      changed = this.model.toggleWall(candidate.kind, candidate.x, candidate.y) || changed;
    }

    if (changed) {
      this.stopAndClearPath();
      this.renderer.draw();
    }
  }

  placeMinotaur(event) {
    if (!this.model.editing) {
      return;
    }
    const rect = this.elements.canvas.getBoundingClientRect();
    const px = this.model.clamp(event.clientX - rect.left, 0, this.renderer.canvasCssWidth - 1);
    const py = this.model.clamp(event.clientY - rect.top, 0, this.renderer.canvasCssHeight - 1);
    const { w, h } = this.renderer.getCellMetrics();
    this.model.setMinotaur(Math.floor(px / w) + 1, Math.floor(py / h) + 1);
    this.stopAndClearPath();
    this.updateStatus(`Minotaur moved to cell ${this.model.minotaur.x},${this.model.minotaur.y}.`);
    this.renderer.draw();
  }
}
