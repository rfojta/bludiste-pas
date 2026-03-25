import AppConfig from "./AppConfig.js";
import MazeRandom from "./MazeRandom.js";

export default class MazeSolver {
  constructor(model) {
    this.model = model;
  }

  buildSolvePath() {
    this.model.clearGrid(this.model.visited, false);
    const steps = [];
    this.model.visited[1][1] = true;
    steps.push({ x: 1, y: 1, color: "tam" });
    if (this.model.minotaur.x === 1 && this.model.minotaur.y === 1) {
      return steps;
    }

    const stack = [{ x: 1, y: 1, order: MazeRandom.randomPermutation(), nextIndex: 0 }];
    while (stack.length > 0) {
      const frame = stack[stack.length - 1];

      if (frame.nextIndex >= frame.order.length) {
        stack.pop();
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          steps.push({ x: parent.x, y: parent.y, color: "zpet" });
        }
        continue;
      }

      const direction = frame.order[frame.nextIndex];
      frame.nextIndex += 1;
      if (!this.model.canMove(frame.x, frame.y, direction)) {
        continue;
      }

      const dir = AppConfig.DIRECTION_BY_CODE[direction];
      const nextX = frame.x + dir.dx;
      const nextY = frame.y + dir.dy;
      if (this.model.visited[nextX][nextY]) {
        continue;
      }

      this.model.visited[nextX][nextY] = true;
      steps.push({ x: nextX, y: nextY, color: "tam" });
      if (nextX === this.model.minotaur.x && nextY === this.model.minotaur.y) {
        return steps;
      }

      stack.push({ x: nextX, y: nextY, order: MazeRandom.randomPermutation(), nextIndex: 0 });
    }

    return steps;
  }
}
