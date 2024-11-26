import * as d3 from "d3";
import { Graph, Node, Edge } from "../../../core/Graph";
import { GUIController } from "../../controller";
import { CanvasEvent, CanvasEventCallback, CanvasEventManager } from "./Manager";

const NODE_DEFAULT_RADIUS = 20; // 节点的默认半径

/**
 * 鼠标事件管理器，负责处理与鼠标相关的操作，包括点击、拖拽和按住操作。
 */
export class CanvasEventAnalyst {
  private readonly HOLD_THRESHOLD = 200; // 按住判定阈值（毫秒）

  private isMouseDown: boolean = false; // 记录鼠标按下状态
  private mouseDownStartTime: number = 0; // 记录鼠标按下的时间
  private startNode: Node | null = null; // 记录鼠标按下时的节点

  /**
   * 构造函数，初始化鼠标事件管理器。
   * @param {GUIController} controller - 图形控制器实例。
   */
  constructor(
    private eventManager: CanvasEventManager,
    private graph: Graph,
    private canvas: SVGSVGElement
  ) {
    this.canvas.addEventListener("mousedown", (event: MouseEvent) => this.analyzeMouseDown(event));
    this.canvas.addEventListener("mousemove", (event: MouseEvent) => this.analyzeMouseMove(event));
    this.canvas.addEventListener("mouseup", (event: MouseEvent) => this.analyzeMouseUp(event));
  }

  on(event: CanvasEvent, callback: CanvasEventCallback) {
    this.eventManager.on(event, callback);
  }

  /**
   * 鼠标按下事件处理。
   * @param {MouseEvent} event - 鼠标事件对象。
   */
  private analyzeMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.mouseDownStartTime = Date.now();
    this.startNode = this.findNodeUnderCursor(event);
  }

  /**
   * 鼠标移动事件处理。
   * @param {MouseEvent} event - 鼠标事件对象。
   */
  private analyzeMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown) return;
    if (Date.now() - this.mouseDownStartTime < this.HOLD_THRESHOLD) return;

    if (!this.startNode) {
      const node = this.findNodeUnderCursor(event);
      const edge = this.findEdgeUnderCursor(event);
      if (node) {
        this.graph.removeNode(node._id);
        console.log(`Node removed: ${node._id}`);
      }
      if (edge) {
        this.graph.removeEdge(edge);
        console.log(`Edge removed: from ${edge.source} to ${edge.target}`);
      }
    }
  }

  /**
   * 鼠标松开事件处理。
   * @param {MouseEvent} event - 鼠标事件对象。
   */
  private analyzeMouseUp(event: MouseEvent): void {
    let clickDuration = Date.now() - this.mouseDownStartTime;

    if (clickDuration < this.HOLD_THRESHOLD) {
      const node = this.findNodeUnderCursor(event);
      const edge = this.findEdgeUnderCursor(event);

      if (node) {
        this.eventManager.trigger("NodeClicked", { event, id: node._id });
        console.log("Node clicked: ", node);
      } else if (edge) {
        this.eventManager.trigger("EdgeClicked", { event, id: edge._id });
        console.log("Edge clicked: ", edge);
      } else {
        this.eventManager.trigger("CanvasClicked", { event });
        console.log("Background clicked");
      }
    }

    this.isMouseDown = false;
  }

  /**
   * 查找鼠标当前位置下的节点。
   * @param {MouseEvent} event - 鼠标事件对象。
   * @returns {Node | null} 鼠标下的节点（如果存在）。
   */
  private findNodeUnderCursor(event: MouseEvent): Node | null {
    const nodes = this.graph.getNodes();
    const [x, y] = d3.pointer(event, this.canvas);
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
    const [x, y] = d3.pointer(event, this.canvas);
    let foundEdge: Edge | null = null;

    d3.select(this.canvas)
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
