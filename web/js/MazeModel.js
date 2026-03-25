import AppConfig from "./AppConfig.js";
import MazeRandom from "./MazeRandom.js";

export default class MazeModel {
  constructor() {
    this.dimension = AppConfig.DEFAULT_DIMENSION;
    this.speedMs = AppConfig.DEFAULT_SPEED_MS;
    this.colors = { ...AppConfig.DEFAULT_COLORS };
    this.horiz = this.createGrid(false);
    this.vert = this.createGrid(false);
    this.visited = this.createGrid(false);
    this.minotaur = { x: 1, y: 1 };
    this.pathSteps = [];
    this.pathIndex = 0;
    this.solveState = "idle";
    this.editing = true;
  }

  createGrid(fillValue) {
    return Array.from({ length: AppConfig.MAX_SIZE + 1 }, () => Array(AppConfig.MAX_SIZE + 1).fill(fillValue));
  }

  clearGrid(grid, fillValue) {
    for (let x = 0; x <= AppConfig.MAX_SIZE; x += 1) {
      grid[x].fill(fillValue);
    }
  }

  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  setDimension(value) {
    this.dimension = this.clamp(value, AppConfig.MIN_SIZE, AppConfig.MAX_SIZE);
  }

  setSpeed(value) {
    this.speedMs = Number(value);
  }

  setColor(key, value) {
    this.colors[key] = value;
  }

  prepareFreshMaze() {
    this.clearGrid(this.horiz, false);
    this.clearGrid(this.vert, false);
    this.clearGrid(this.visited, false);
  }

  clearPath() {
    this.pathSteps = [];
    this.pathIndex = 0;
    this.solveState = "idle";
    this.editing = true;
  }

  chooseRandomMinotaur() {
    this.minotaur = {
      x: MazeRandom.randomInt(this.dimension) + 1,
      y: MazeRandom.randomInt(this.dimension) + 1
    };
  }

  setMinotaur(x, y) {
    this.minotaur = {
      x: this.clamp(x, 1, this.dimension),
      y: this.clamp(y, 1, this.dimension)
    };
  }

  canMove(x, y, direction) {
    switch (direction) {
      case 1:
        return x < this.dimension && !this.vert[x][y];
      case 2:
        return y < this.dimension && !this.horiz[x][y];
      case 3:
        return x > 1 && !this.vert[x - 1][y];
      case 4:
        return y > 1 && !this.horiz[x][y - 1];
      default:
        return false;
    }
  }

  openWall(x, y, direction) {
    switch (direction) {
      case 1:
        if (x < this.dimension) {
          this.vert[x][y] = false;
        }
        break;
      case 2:
        if (y < this.dimension) {
          this.horiz[x][y] = false;
        }
        break;
      case 3:
        if (x > 1) {
          this.vert[x - 1][y] = false;
        }
        break;
      case 4:
        if (y > 1) {
          this.horiz[x][y - 1] = false;
        }
        break;
      default:
        break;
    }
  }

  toggleWall(kind, x, y) {
    if (kind === "vert") {
      if (x < 1 || x >= this.dimension || y < 1 || y > this.dimension) {
        return false;
      }
      this.vert[x][y] = !this.vert[x][y];
      return true;
    }

    if (x < 1 || x > this.dimension || y < 1 || y >= this.dimension) {
      return false;
    }
    this.horiz[x][y] = !this.horiz[x][y];
    return true;
  }

  emptyMaze() {
    for (let x = 1; x <= AppConfig.MAX_SIZE; x += 1) {
      for (let y = 1; y <= AppConfig.MAX_SIZE; y += 1) {
        this.horiz[x][y] = false;
        this.vert[x][y] = false;
      }
    }
    this.clearGrid(this.visited, false);
    this.clearPath();
  }
}
