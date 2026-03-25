import AppConfig from "./AppConfig.js";

export default class DelphiMazeCodec {
  detectStorageSize(byteLength) {
    const payloadBytes = byteLength - 24;
    if (payloadBytes < 0 || payloadBytes % 2 !== 0) {
      throw new Error("Unexpected file size.");
    }

    const side = Math.sqrt(payloadBytes / 2);
    if (!Number.isInteger(side)) {
      throw new Error("Unexpected file size.");
    }

    return side;
  }

  delphiColorToCss(value) {
    const normalized = value >>> 0;
    const r = normalized & 0xff;
    const g = (normalized >>> 8) & 0xff;
    const b = (normalized >>> 16) & 0xff;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  cssColorToDelphi(value) {
    const raw = value.replace("#", "");
    const normalized = raw.length === 3
      ? raw.split("").map((part) => part + part).join("")
      : raw;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return (r | (g << 8) | (b << 16)) >>> 0;
  }

  importFromBuffer(buffer, model) {
    const storageSize = this.detectStorageSize(buffer.byteLength);
    if (storageSize > AppConfig.MAX_SIZE) {
      throw new Error("Unexpected file size.");
    }

    const view = new DataView(buffer);
    const dimension = model.clamp(view.getInt32(0, true), AppConfig.MIN_SIZE, Math.min(AppConfig.MAX_SIZE, storageSize));
    model.dimension = dimension;
    let offset = 4;
    model.colors.tam = this.delphiColorToCss(view.getInt32(offset, true));
    offset += 4;
    model.colors.zpet = this.delphiColorToCss(view.getInt32(offset, true));
    offset += 4;
    model.colors.zdi = this.delphiColorToCss(view.getInt32(offset, true));
    offset += 4;
    model.colors.mino1 = this.delphiColorToCss(view.getInt32(offset, true));
    offset += 4;
    model.colors.mino2 = this.delphiColorToCss(view.getInt32(offset, true));
    offset += 4;

    model.clearGrid(model.horiz, false);
    model.clearGrid(model.vert, false);
    model.clearGrid(model.visited, false);

    for (let x = 1; x <= storageSize; x += 1) {
      for (let y = 1; y <= storageSize; y += 1) {
        model.horiz[x][y] = view.getUint8(offset) !== 0;
        offset += 1;
      }
    }

    for (let x = 1; x <= storageSize; x += 1) {
      for (let y = 1; y <= storageSize; y += 1) {
        model.vert[x][y] = view.getUint8(offset) !== 0;
        offset += 1;
      }
    }

    model.chooseRandomMinotaur();
    model.clearPath();
  }

  exportToBuffer(model) {
    const buffer = new ArrayBuffer(AppConfig.FILE_SIZE);
    const view = new DataView(buffer);
    view.setInt32(0, model.dimension, true);
    let offset = 4;
    view.setUint32(offset, this.cssColorToDelphi(model.colors.tam), true);
    offset += 4;
    view.setUint32(offset, this.cssColorToDelphi(model.colors.zpet), true);
    offset += 4;
    view.setUint32(offset, this.cssColorToDelphi(model.colors.zdi), true);
    offset += 4;
    view.setUint32(offset, this.cssColorToDelphi(model.colors.mino1), true);
    offset += 4;
    view.setUint32(offset, this.cssColorToDelphi(model.colors.mino2), true);
    offset += 4;

    for (let x = 1; x <= AppConfig.MAX_SIZE; x += 1) {
      for (let y = 1; y <= AppConfig.MAX_SIZE; y += 1) {
        view.setUint8(offset, model.horiz[x][y] ? 1 : 0);
        offset += 1;
      }
    }

    for (let x = 1; x <= AppConfig.MAX_SIZE; x += 1) {
      for (let y = 1; y <= AppConfig.MAX_SIZE; y += 1) {
        view.setUint8(offset, model.vert[x][y] ? 1 : 0);
        offset += 1;
      }
    }

    return buffer;
  }
}
