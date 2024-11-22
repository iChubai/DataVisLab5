import { Graph } from "../core/Graph";
import { ForceSimulator } from "../logic/Force/Simulator";
import { CanvasEventAnalyst } from "./Canvas/Event/Analyst";
import { PanelRender } from "./Panel/Render";

import * as d3 from "d3";
import { GraphEventManager } from "../core/Graph/EventManager";
import { CanvasEventManager } from "./Canvas/Event/Manager";
import { ParameterManager } from "../core/ParameterManager";
import { SNNModel } from "../logic/SNN/Model";
import { SNNSimulator } from "../logic/SNN/Simulator";
import { ChartRender } from "./Chart/Renderer";
import { SNNEventManager } from "../logic/SNN/Event/Manager";

/**
 * 控制图形的主要类，负责图形的管理、力学仿真和事件处理。
 */
export class GUIController {
  private canvas: SVGSVGElement; // SVG容器
  private chart: d3.Selection<SVGGElement, unknown, any, any>; // 参数可视化容器

  private forceSimulation: ForceSimulator; // 力学仿真器
  private canvasEventManager: CanvasEventManager; // 鼠标事件管理器
  private canvasEventAnalyst: CanvasEventAnalyst; // 鼠标事件管理器
  private panelRender: PanelRender; // 参数可视化绘制器
  private graphEventManager: GraphEventManager; // 图形事件管理器
  private graph: Graph;
  private params: ParameterManager;
  private snn: SNNModel;
  private snnSimulator: SNNSimulator;
  private snnEventManager: SNNEventManager;
  private chartRender: ChartRender;
  // private panel: SVGSVGElement;

  /**
   * 构造函数，初始化图形控制器。
   * @param {SVGSVGElement} canvas - 用于渲染的SVG容器。
   */
  constructor(
    canvas: SVGSVGElement,
    chart: d3.Selection<SVGGElement, unknown, any, any>,
    // panel: SVGSVGElement,
    params: ParameterManager
  ) {
    this.canvas = d3.select(canvas).style("background-color", "#f9f9f9").node() as SVGSVGElement;
    this.chart = chart.select("#chart-container") as d3.Selection<SVGGElement, unknown, any, any>;
    // this.panel = panel

    this.params = params;

    this.graphEventManager = new GraphEventManager();
    this.canvasEventManager = new CanvasEventManager(this.canvas);
    this.snnEventManager = new SNNEventManager();

    this.panelRender = new PanelRender(this.params);
    this.chartRender = new ChartRender(this.params, this.chart);

    this.graph = new Graph(this.graphEventManager, canvas);
    this.forceSimulation = new ForceSimulator(
      this.graph,
      this.params,
      this.canvas,
      this.canvasEventManager
    );
    this.forceSimulation.applyDragBehavior(d3.select(this.canvas).selectAll("circle"));
    this.snn = new SNNModel(this.graph, this.params, this.snnEventManager, "LIF", "Hebbian");
    this.snnSimulator = new SNNSimulator(this.snn, this.chartRender);
    this.snnSimulator.run();
    this.canvasEventAnalyst = new CanvasEventAnalyst(
      this.canvasEventManager,
      this.graph,
      this.canvas
    );

    this.panelRender.registerCallbacks(this.canvasEventManager);
    this.chartRender.registerCallbacks(this.canvasEventManager);
    this.params.registerCallbacks(this.graphEventManager);
    this.graph.registerCallbacks(this.canvasEventManager);
    this.forceSimulation.registerCallbacks(this.graphEventManager, this.snnEventManager);
    this.snn.registerCallbacks(this.graphEventManager);
  }
}
