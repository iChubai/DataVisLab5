import { defineConfig } from "vite";

export default defineConfig({
  root: "./src", // 设置项目的根目录
  build: {
    outDir: "../dist", // 设置输出目录
  },
  server: {
    open: true, // 自动在浏览器中打开
  },
});
