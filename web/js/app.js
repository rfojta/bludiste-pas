import MazeApp from "./MazeApp.js";

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", async () => {
    const app = new MazeApp();
    await app.init();
  });
}
