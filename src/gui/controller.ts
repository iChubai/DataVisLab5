import { Graph } from "../core/Graph";
import { ForceSimulator } from "../logic/Force/Simulator";
import { CanvasEventAnalyst } from "./Canvas/Event/Analyst";
import { PanelRender } from "./Panel/Renderer";

import * as d3 from "d3";
import { GraphEventManager } from "../core/Graph/EventManager";
import { CanvasEventManager } from "./Canvas/Event/Manager";
import {
  EdgeParameterRegistry,
  NodeParameterRegistry,
  ParameterManager,
} from "../core/ParameterManager";
import { SNNModel } from "../logic/SNN/Model";
import { SNNSimulator } from "../logic/SNN/Simulator";
import { ChartRender } from "./Chart/Renderer";
import { SNNEventManager } from "../logic/SNN/Event/Manager";
import { PanelEventManager } from "./Panel/Event/Manager";
import { HeatmapRender } from "./Heatmap/Renderer";

/**
 * 控制图形的主要类，负责图形的管理、力学仿真和事件处理。
 */
export class GUIController {
  private canvas: SVGSVGElement; // SVG容器
  private chart: d3.Selection<SVGGElement, unknown, any, any>; // 参数可视化容器
  private heatmap: SVGSVGElement; // 热力图容器

  private params: ParameterManager;
  private graph: Graph;
  private snn: SNNModel;

  private canvasEventManager: CanvasEventManager; // 鼠标事件管理器
  private canvasEventAnalyst: CanvasEventAnalyst; // 鼠标事件管理器。虽然这里提示这个东西没用过但是这个用来监听鼠标事件的
  private graphEventManager: GraphEventManager; // 图形事件管理器
  private panelEventManager: PanelEventManager;
  private snnEventManager: SNNEventManager;

  private panelRender: PanelRender; // 参数可视化绘制器
  private chartRender: ChartRender;
  private heatmapRender: HeatmapRender;
  private forceSimulation: ForceSimulator; // 力学仿真器
  private snnSimulator: SNNSimulator;

  // private panel: SVGSVGElement;

  /**
   * 构造函数，初始化图形控制器。
   * @param {SVGSVGElement} canvas - 用于渲染的SVG容器。
   */
  constructor(
    canvas: SVGSVGElement,
    chart: d3.Selection<SVGGElement, unknown, any, any>,
    heatmap: SVGSVGElement
  ) {
    this.params = new ParameterManager(this);
    const nodeParamRegistry: NodeParameterRegistry = new NodeParameterRegistry(this.params);
    nodeParamRegistry.registerAll(); // 注册节点参数
    const edgeParamRegistry: EdgeParameterRegistry = new EdgeParameterRegistry(this.params);
    edgeParamRegistry.registerAll(); // 注册边参数

    this.canvas = d3.select(canvas).style("background-color", "#f9f9f9").node() as SVGSVGElement;
    this.chart = chart.select("#chart-container") as d3.Selection<SVGGElement, unknown, any, any>;
    this.heatmap = heatmap;

    this.panelRender = new PanelRender(this.params);
    this.chartRender = new ChartRender(this.params, this.chart);
    this.heatmapRender = new HeatmapRender(this.params, this.heatmap);

    this.graphEventManager = new GraphEventManager();
    this.canvasEventManager = new CanvasEventManager(this.canvas);
    this.panelEventManager = new PanelEventManager(this.panelRender);
    this.snnEventManager = new SNNEventManager();

    this.graph = new Graph(this.graphEventManager, canvas);
    this.forceSimulation = new ForceSimulator(
      this.graph,
      this.params,
      this.canvas,
      this.canvasEventManager
    );
    this.forceSimulation.applyDragBehavior(d3.select(this.canvas).selectAll("circle"));
    this.snn = new SNNModel(this.graph, this.params, this.snnEventManager, "LIF", "Hebbian");
    this.snnSimulator = new SNNSimulator(this.snn, this.chartRender, this.heatmapRender);
    this.snnSimulator.run();
    this.canvasEventAnalyst = new CanvasEventAnalyst(
      this.canvasEventManager,
      this.graph,
      this.canvas
    );

    this.panelRender.registerCallbacks(this.canvasEventManager, this.panelEventManager);
    this.chartRender.registerCallbacks(this.canvasEventManager, this.graphEventManager);
    this.heatmapRender.registerCallbacks(this.graphEventManager);
    this.params.registerCallbacks(this.graphEventManager);
    this.graph.registerCallbacks(this.canvasEventManager);
    this.forceSimulation.registerCallbacks(this.graphEventManager, this.snnEventManager);
    this.snn.registerCallbacks(this.graphEventManager);
  }

  graphEvent(): GraphEventManager {
    return this.graphEventManager;
  }
  canvasEvent(): CanvasEventManager {
    return this.canvasEventManager;
  }
  panelEvent(): PanelEventManager {
    return this.panelEventManager;
  }
  snnEvent(): SNNEventManager {
    return this.snnEventManager;
  }
}
