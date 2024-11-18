// main.ts

import { GUIController } from "./gui/controller.js";
import { SNN } from "./snn/snn.js";

/**
 * 主模块入口，用于初始化图形控制器并绑定到页面上的 SVG 元素。
 */

// 获取页面上的 SVG 元素
const svg: SVGSVGElement | null = document.querySelector("#graphCanvas");
if (!svg) {
  throw new Error("SVG element with id 'graphCanvas' not found."); // 如果未找到，抛出错误
}

// 初始化图形控制器
const controller: GUIController = new GUIController(svg);
const snn: SNN = new SNN(controller.getGraph());

document.addEventListener("submit", (e) => {
  e.preventDefault(); // 阻止默认提交行为
  console.log("Form submission prevented globally.");
});
