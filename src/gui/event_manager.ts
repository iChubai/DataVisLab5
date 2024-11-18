import * as d3 from "d3";
import { Graph, Node, Edge } from "../infrastructure/graph";
import { DragHandler, ClickHandler, HoldHandler } from "./event_handlers";
import { GUIController } from "./controller";

const NODE_DEFAULT_RADIUS = 20; // 节点的默认半径

/**
 * 鼠标事件管理器，负责处理与鼠标相关的操作，包括点击、拖拽和按住操作。
 */
export class MouseEventManager {
  private readonly HOLD_THRESHOLD = 300; // 按住判定阈值（毫秒）

  private controller: GUIController; // 图形控制器实例
  private graph: Graph; // 图数据结构
  private container: SVGSVGElement; // SVG 容器
  private dragHandler: DragHandler; // 拖拽处理器
  private clickHandler: ClickHandler; // 单击处理器
  private holdHandler: HoldHandler; // 按住处理器

  private isMouseDown: boolean = false; // 记录鼠标按下状态
  private mouseDownStartTime: number = 0; // 记录鼠标按下的时间
  private startNode: Node | null = null; // 记录鼠标按下时的节点

  /**
   * 构造函数，初始化鼠标事件管理器。
   * @param {GUIController} controller - 图形控制器实例。
   */
  constructor(controller: GUIController) {
    this.controller = controller;
    this.graph = controller.getGraph();
    this.container = controller.getSVG();
    this.dragHandler = new DragHandler(controller);
    this.clickHandler = new ClickHandler(controller);
    this.holdHandler = new HoldHandler(controller);

    // 绑定鼠标事件
    this.container.addEventListener("mousedown", (event: MouseEvent) => this.onMouseDown(event));
    this.container.addEventListener("mousemove", (event: MouseEvent) => this.onMouseMove(event));
    this.container.addEventListener("mouseup", (event: MouseEvent) => this.onMouseUp(event));
  }

  /**
   * 鼠标按下事件处理。
   * @param {MouseEvent} event - 鼠标事件对象。
   */
  private onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.mouseDownStartTime = Date.now();
    this.startNode = this.findNodeUnderCursor(event);
  }

  /**
   * 鼠标移动事件处理。
   * @param {MouseEvent} event - 鼠标事件对象。
   */
  private onMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown) return;
    if (Date.now() - this.mouseDownStartTime < this.HOLD_THRESHOLD) return;

    if (!this.startNode) {
      this.holdHandler.onHolding(
        event,
        this.findNodeUnderCursor(event),
        this.findEdgeUnderCursor(event)
      );
    }
  }

  /**
   * 鼠标松开事件处理。
   * @param {MouseEvent} event - 鼠标事件对象。
   */
  private onMouseUp(event: MouseEvent): void {
    let clickDuration = Date.now() - this.mouseDownStartTime;

    if (clickDuration < this.HOLD_THRESHOLD) {
      const node = this.findNodeUnderCursor(event);
      const edge = this.findEdgeUnderCursor(event);

      this.onMouseClick(event, node, edge);
    }

    this.isMouseDown = false;
  }

  onMouseClick(event: MouseEvent, node: Node | null, edge: Edge | null): void {
    this.clickHandler.onClick(event, node, edge);
    console.log("Click: ", node, edge);
  }

  /**
   * 拖拽结束事件处理。
   * @param {d3.D3DragEvent<SVGCircleElement, Node, Node>} event - D3 拖拽事件对象。
   * @param {Node} startNode - 开始拖拽的节点。
   */
  onDragEnd(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, startNode: Node): void {
    this.dragHandler.onDragEnd(event, startNode, this.findNodeUnderPlace(event.x, event.y), 1);
  }

  /**
   * 查找鼠标当前位置下的节点。
   * @param {MouseEvent} event - 鼠标事件对象。
   * @returns {Node | null} 鼠标下的节点（如果存在）。
   */
  private findNodeUnderCursor(event: MouseEvent): Node | null {
    const nodes = this.graph.getNodes();
    const [x, y] = d3.pointer(event, this.container);
    for (let node of nodes) {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      if (distance < NODE_DEFAULT_RADIUS) {
        return node;
      }
    }
    return null;
  }

  /**
   * 查找指定位置下的节点。
   * @param {number} x - 指定位置的 x 坐标。
   * @param {number} y - 指定位置的 y 坐标。
   * @returns {Node | null} 指定位置下的节点（如果存在）。
   */
  private findNodeUnderPlace(x: number, y: number): Node | null {
    const nodes = this.graph.getNodes();
    for (let node of nodes) {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      if (distance < NODE_DEFAULT_RADIUS) {
        return node;
      }
    }
    return null;
  }

  /**
   * 查找鼠标当前位置下的边。
   * @param {MouseEvent} event - 鼠标事件对象。
   * @returns {Edge | null} 鼠标下的边（如果存在）。
   */
  private findEdgeUnderCursor(event: MouseEvent): Edge | null {
    const [x, y] = d3.pointer(event, this.container);
    let foundEdge: Edge | null = null;

    d3.select(this.controller.getSVG())
      .select(".edges")
      .selectAll<SVGPathElement, Edge>("path")
      .each(function (edge) {
        const pathElement = this as SVGPathElement;
        const totalLength = pathElement.getTotalLength();
        for (let i = 0; i <= totalLength; i += 1) {
          const point = pathElement.getPointAtLength(i);
          const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
          if (distance < 5) {
            foundEdge = edge;
            return;
          }
        }
      });

    return foundEdge;
  }
}
