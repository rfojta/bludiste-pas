export default class CanvasRenderer {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.model = model;
    this.ctx = this.canvas.getContext("2d");
    this.canvasCssWidth = 0;
    this.canvasCssHeight = 0;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvasCssWidth = rect.width;
    this.canvasCssHeight = rect.height;
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  getCellMetrics() {
    return {
      w: this.canvasCssWidth / this.model.dimension,
      h: this.canvasCssHeight / this.model.dimension
    };
  }

  cellCenter(x, y) {
    const { w, h } = this.getCellMetrics();
    return {
      x: (x - 0.5) * w,
      y: (y - 0.5) * h
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvasCssWidth, this.canvasCssHeight);

    const { w, h } = this.getCellMetrics();
    this.ctx.fillStyle = "#fffaf2";
    this.ctx.fillRect(0, 0, this.canvasCssWidth, this.canvasCssHeight);

    this.ctx.strokeStyle = this.model.colors.zdi;
    this.ctx.lineWidth = 1;
    for (let x = 1; x < this.model.dimension; x += 1) {
      for (let y = 1; y <= this.model.dimension; y += 1) {
        if (this.model.vert[x][y]) {
          this.ctx.beginPath();
          this.ctx.moveTo(x * w, (y - 1) * h);
          this.ctx.lineTo(x * w, y * h);
          this.ctx.stroke();
        }
        if (this.model.horiz[y][x]) {
          this.ctx.beginPath();
          this.ctx.moveTo((y - 1) * w, x * h);
          this.ctx.lineTo(y * w, x * h);
          this.ctx.stroke();
        }
      }
    }

    this.ctx.strokeStyle = this.model.colors.zdi;
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeRect(0, 0, this.model.dimension * w, this.model.dimension * h);

    const radius = Math.min(w, h) * 0.34;
    const minotaurCenter = this.cellCenter(this.model.minotaur.x, this.model.minotaur.y);
    this.ctx.beginPath();
    this.ctx.fillStyle = this.model.colors.mino2;
    this.ctx.strokeStyle = this.model.colors.mino1;
    this.ctx.lineWidth = 2;
    this.ctx.arc(minotaurCenter.x, minotaurCenter.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    if (this.model.pathIndex > 0) {
      const visibleSteps = this.model.pathSteps.slice(0, this.model.pathIndex);
      if (visibleSteps.length > 0) {
        const first = this.cellCenter(visibleSteps[0].x, visibleSteps[0].y);
        this.ctx.lineWidth = 3;
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.ctx.beginPath();
        this.ctx.moveTo(first.x, first.y);
        for (let i = 1; i < visibleSteps.length; i += 1) {
          const previous = visibleSteps[i - 1];
          const current = visibleSteps[i];
          const currentPoint = this.cellCenter(current.x, current.y);
          this.ctx.strokeStyle = this.model.colors[current.color];
          this.ctx.lineTo(currentPoint.x, currentPoint.y);
          this.ctx.stroke();
          this.ctx.beginPath();
          this.ctx.moveTo(currentPoint.x, currentPoint.y);
          if (previous.x === current.x && previous.y === current.y) {
            this.ctx.lineTo(currentPoint.x, currentPoint.y);
          }
        }
      }
    }
  }
}
