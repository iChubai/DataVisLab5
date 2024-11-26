// main.ts

import * as d3 from "d3";

import { GUIController } from "./gui/controller.js";
import {
  NodeParameterRegistry,
  EdgeParameterRegistry,
  ParameterManager,
} from "./core/ParameterManager.js";

/**
 * 主模块入口，用于初始化图形控制器并绑定到页面上的 SVG 元素。
 */
document.addEventListener("submit", (e) => {
  e.preventDefault(); // 阻止默认提交行为
  console.log("Form submission prevented globally.");
});

const svg = document.querySelector("#graphCanvas") as SVGSVGElement;
const chart = d3.select("#chart") as d3.Selection<SVGGElement, unknown, any, any>;

const controller: GUIController = new GUIController(svg, chart);
