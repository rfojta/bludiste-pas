import AppConfig from "./AppConfig.js";
import MazeRandom from "./MazeRandom.js";

export default class MazeGenerator {
  constructor(model) {
    this.model = model;
  }

  generate(dimension) {
    this.model.setDimension(dimension);
    this.model.prepareFreshMaze();

    for (let x = 1; x <= this.model.dimension; x += 1) {
      for (let y = 1; y <= this.model.dimension; y += 1) {
        if (y < this.model.dimension) {
          this.model.horiz[x][y] = MazeRandom.randomInt(10) > 0;
        }
        if (x < this.model.dimension) {
          this.model.vert[x][y] = MazeRandom.randomInt(10) > 0;
        }
      }
    }

    this.model.visited[1][1] = true;
    const stack = [{ x: 1, y: 1, order: MazeRandom.randomPermutation(), nextIndex: 0 }];
    while (stack.length > 0) {
      const frame = stack[stack.length - 1];
      if (frame.nextIndex >= frame.order.length) {
        stack.pop();
        continue;
      }

      const direction = frame.order[frame.nextIndex];
      frame.nextIndex += 1;
      const dir = AppConfig.DIRECTION_BY_CODE[direction];
      const nextX = frame.x + dir.dx;
      const nextY = frame.y + dir.dy;

      if (
        nextX < 1 ||
        nextX > this.model.dimension ||
        nextY < 1 ||
        nextY > this.model.dimension ||
        this.model.visited[nextX][nextY]
      ) {
        continue;
      }

      this.model.visited[nextX][nextY] = true;
      this.model.openWall(frame.x, frame.y, direction);
      stack.push({ x: nextX, y: nextY, order: MazeRandom.randomPermutation(), nextIndex: 0 });
    }

    this.model.clearGrid(this.model.visited, false);
    this.model.chooseRandomMinotaur();
    this.model.clearPath();
  }
}
