import { Graph, Node, Edge } from "../core/Graph";
import { ForceSimulator } from "../logic/Force/Simulator";
import { CanvasEventAnalyst } from "./Canvas/Event/Analyst";
import { PanelRender } from "./Panel/Render";

import * as d3 from "d3";
import { GraphEvent, GraphEventCallback, GraphEvents } from "../core/Graph/EventManager";
import {
  CanvasEvent,
  CanvasEventCallback,
  CanvasEventManager,
  CanvasEvents,
} from "./Canvas/Event/Manager";

/**
 * 控制图形的主要类，负责图形的管理、力学仿真和事件处理。
 */
export class GUIController {
  private graph: Graph; // 图数据结构
  private forceSimulation: ForceSimulator; // 力学仿真器
  private canvasEventManager: CanvasEventManager; // 鼠标事件管理器
  private canvasEventAnalyst: CanvasEventAnalyst; // 鼠标事件管理器
  private parameterExplorer: PanelRender; // 参数可视化绘制器

  /**
   * 构造函数，初始化图形控制器。
   * @param {SVGSVGElement} svg - 用于渲染的SVG容器。
   */
  constructor(
    private svg: SVGSVGElement // 用于渲染的SVG容器。 // private chartDrawer: ChartDrawer // 用于绘制图表。不应当直接被此类调用，后续应该写一个整体框架，通过框架调用这个模块 // TODO
  ) {
    // 初始化SVG，设置背景颜色。
    this.svg = d3.select(svg).style("background-color", "#f9f9f9").node() as SVGSVGElement;

    // 初始化各模块。
    this.graph = new Graph(this);
    this.forceSimulation = new ForceSimulator(this);
    this.forceSimulation.applyDragBehavior(d3.select(this.svg).selectAll("circle"));
    this.canvasEventManager = new CanvasEventManager(this.svg);
    this.canvasEventAnalyst = new CanvasEventAnalyst(this.canvasEventManager, this.graph, this.svg);
    this.parameterExplorer = new PanelRender(this.getGraph().getParamManager(), this);

    // **在所有模块初始化结束后**，注册回调函数。
    this.graph.registerCallbacks();
    this.forceSimulation.registerCallbacks();
    this.parameterExplorer.registerCallbacks();
  }

  /**
   * 获取当前图结构。
   * @returns {Graph} 当前的图对象。
   */
  public getGraph(): Graph {
    return this.graph;
  }

  /**
   * 获取SVG容器。
   * @returns {SVGSVGElement} 当前的SVG容器。
   */
  public getSVG(): SVGSVGElement {
    return this.svg;
  }

  public getCanvasEventManager(): CanvasEventManager {
    return this.canvasEventManager;
  }

  public addNode(node: Node): string {
    return this.graph.addNode(node);
  }

  public addEdge(edge: Edge): void {
    this.graph.addEdge(edge);
  }

  public removeNode(node: Node): void {
    this.graph.removeNode(node._id);
  }

  public removeEdge(edge: Edge): void {
    this.graph.removeEdge(edge);
  }

  public on(event: GraphEvent | CanvasEvent, callback: GraphEventCallback | CanvasEventCallback) {
    if (GraphEvents.has(event as GraphEvent)) {
      this.graph.on(event as GraphEvent, callback as GraphEventCallback);
    } else if (CanvasEvents.has(event as CanvasEvent)) {
      this.canvasEventAnalyst.on(event as CanvasEvent, callback as CanvasEventCallback);
    }
  }
}
