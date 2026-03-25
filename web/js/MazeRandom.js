export default class MazeRandom {
  static randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  static randomPermutation() {
    const result = [1, 2, 3, 4];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = MazeRandom.randomInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
