import { Graph, Node, Edge, GraphEventCallback } from "../infrastructure/graph";
import { ForceSimulator } from "./force";
import { MouseEventManager } from "./event_manager";

import * as d3 from "d3";

/**
 * 控制图形的主要类，负责图形的管理、力学仿真和事件处理。
 */
export class GUIController {
  private svg: SVGSVGElement; // SVG容器
  private graph: Graph; // 图数据结构
  private forceSimulation: ForceSimulator; // 力学仿真器
  private eventManager: MouseEventManager; // 鼠标事件管理器

  /**
   * 构造函数，初始化图形控制器。
   * @param {SVGSVGElement} svg - 用于渲染的SVG容器。
   */
  constructor(svg: SVGSVGElement) {
    // 初始化SVG，设置背景颜色。
    this.svg = d3.select(svg).style("background-color", "#f9f9f9").node() as SVGSVGElement;

    // 初始化图结构。
    this.graph = new Graph();

    // 初始化力学仿真并添加拖拽行为。
    this.forceSimulation = new ForceSimulator(this);
    this.forceSimulation.applyDragBehavior(d3.select(this.svg).selectAll("circle"));

    // 初始化事件管理器。
    this.eventManager = new MouseEventManager(this);
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

  /**
   * 获取事件管理器。
   * @returns {MouseEventManager} 当前的事件管理器实例。
   */
  public getEventManager(): MouseEventManager {
    return this.eventManager;
  }
  public addNode(node: Node): string {
    return this.graph.addNode(node);
  }

  public addEdge(edge: Edge): void {
    this.graph.addEdge(edge);
  }
  public removeNode(node: Node): void {
    this.graph.removeNode(node.id);
  }

  public removeEdge(edge: Edge): void {
    this.graph.removeEdge(edge);
  }

  public onNodeAdded(callback: GraphEventCallback<Node>): void {
    this.graph.onNodeAdded(callback);
  }

  public onNodeRemoved(callback: GraphEventCallback<Node>): void {
    this.graph.onNodeRemoved(callback);
  }

  public onEdgeAdded(callback: GraphEventCallback<Edge>): void {
    this.graph.onEdgeAdded(callback);
  }

  public onEdgeRemoved(callback: GraphEventCallback<Edge>): void {
    this.graph.onEdgeRemoved(callback);
  }
}
