export default class AppConfig {
  static MIN_SIZE = 4;

  static MAX_SIZE = 500;

  static DEFAULT_DIMENSION = 20;

  static DEFAULT_SPEED_MS = 30;

  static FILE_SIZE = 4 + 20 + (AppConfig.MAX_SIZE * AppConfig.MAX_SIZE) + (AppConfig.MAX_SIZE * AppConfig.MAX_SIZE);

  static BUNDLED_LAB_PATH = "../lab.dat";

  static DIRECTIONS = [
    { code: 1, dx: 1, dy: 0 },
    { code: 2, dx: 0, dy: 1 },
    { code: 3, dx: -1, dy: 0 },
    { code: 4, dx: 0, dy: -1 }
  ];

  static DIRECTION_BY_CODE = Object.fromEntries(AppConfig.DIRECTIONS.map((dir) => [dir.code, dir]));

  static DEFAULT_COLORS = {
    tam: "#0000ff",
    zpet: "#008000",
    zdi: "#ff0000",
    mino1: "#800080",
    mino2: "#800080"
  };
}
