// main.ts

import * as d3 from "d3";

import { GUIController } from "./gui/controller.js";
import { SNNModel } from "./snn/snn_model.js";
import { SNNSimulator } from "./snn/simulator.js";
import { ChartDrawer } from "./chart/drawer.js";
import { NodeParameterRegistry, EdgeParameterRegistry } from "./infrastructure/parameter.js";

/**
 * 主模块入口，用于初始化图形控制器并绑定到页面上的 SVG 元素。
 */

// 获取页面上的 SVG 元素
const svg: SVGSVGElement | null = document.querySelector("#graphCanvas");
if (!svg) {
  throw new Error("SVG element with id 'graphCanvas' not found."); // 如果未找到，抛出错误
}

document.addEventListener("submit", (e) => {
  e.preventDefault(); // 阻止默认提交行为
  console.log("Form submission prevented globally.");
});

// 初始化图形控制器
const controller: GUIController = new GUIController(svg);

const nodeParamRegistry: NodeParameterRegistry = new NodeParameterRegistry(
  controller.getGraph(),
  controller.getGraph().getParamManager()
);
nodeParamRegistry.registerAll(); // 注册节点参数

const edgeParamRegistry: EdgeParameterRegistry = new EdgeParameterRegistry(
  controller.getGraph(),
  controller.getGraph().getParamManager()
);
edgeParamRegistry.registerAll(); // 注册边参数

const snn: SNNModel = new SNNModel(
  controller.getGraph(),
  controller.getGraph().getParamManager(),
  "LIF",
  "Hebbian"
);

const svgChart = d3.select("#chart");
const container = svgChart.select("#chart-container") as d3.Selection<
  SVGGElement,
  unknown,
  any,
  any
>;
const chartDrawer = new ChartDrawer(controller.getGraph().getParamManager(), container); // 初始化图表绘制器
chartDrawer.registerCallbacks(controller);
const snnSimulator = new SNNSimulator(snn, chartDrawer); // 初始化 SNN 模拟器
snnSimulator.run(); // 运行 SNN 模拟器
