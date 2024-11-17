// main.ts

import { GraphController } from "./controller.js";

/**
 * 主模块入口，用于初始化图形控制器并绑定到页面上的 SVG 元素。
 */

// 获取页面上的 SVG 元素
const svg: SVGSVGElement | null = document.querySelector("#graphCanvas");
if (!svg) {
  throw new Error("SVG element with id 'graphCanvas' not found."); // 如果未找到，抛出错误
}

// 初始化图形控制器
const controller: GraphController = new GraphController(svg);
