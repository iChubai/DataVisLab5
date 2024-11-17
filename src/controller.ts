import { Graph, Node, Edge } from "./graph";
import { ForceSimulation } from "./force";
import { MouseEventManager } from "./event_manager";

import * as d3 from "d3";

/**
 * 控制图形的主要类，负责图形的管理、力学仿真和事件处理。
 */
export class GraphController {
  private svg: SVGSVGElement; // SVG容器
  private graph: Graph; // 图数据结构
  private forceSimulation: ForceSimulation; // 力学仿真模块
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
    this.forceSimulation = new ForceSimulation(this);
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
  public EventManager(): MouseEventManager {
    return this.eventManager;
  }

  /**
   * 添加一个节点到图中。
   * @param {Node} node - 要添加的节点对象。
   * @returns {number} 节点的唯一标识符。
   */
  public addNode(node: Node): number {
    const id = this.graph.addNode(node);
    this.forceSimulation.addNode(node);
    return id;
  }

  /**
   * 添加一条边到图中。
   * @param {Edge} edge - 要添加的边对象。
   */
  public addEdge(edge: Edge): void {
    this.graph.addEdge(edge);
    this.forceSimulation.addEdge(edge);
  }

  /**
   * 从图中移除一个节点。
   * @param {Node} node - 要移除的节点对象。
   */
  public removeNode(node: Node): void {
    this.graph.removeNode(node.id);
    this.forceSimulation.removeNode(node.id);
  }

  /**
   * 从图中移除一条边。
   * @param {Edge} edge - 要移除的边对象。
   */
  public removeEdge(edge: Edge): void {
    this.graph.removeEdge(edge);
    this.forceSimulation.removeEdge(edge);
  }
}
