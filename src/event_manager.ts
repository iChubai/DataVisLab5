import * as d3 from "d3";
import { Graph, Node, Edge } from "./graph";
import { DragHandler, ClickHandler, HoldHandler } from "./event_handlers";

export class MouseEventManager {
  // 常量
  private readonly HOLD_THRESHOLD = 300; // 按住判定阈值（毫秒）

  // 初始化常量
  private graph: Graph;
  private container: SVGSVGElement;
  private dragHandler: DragHandler;
  private clickHandler: ClickHandler;
  private holdHandler: HoldHandler;

  // 变量
  private isMouseDown: boolean = false; // 记录鼠标按下状态
  private mouseDownStartTime: number = 0; // 记录鼠标按下的时间
  private startNode: Node | null = null; // 记录鼠标按下时的节点

  constructor(graph: Graph, container: SVGSVGElement) {
    this.graph = graph;
    this.container = container;
    this.dragHandler = new DragHandler(graph, container);
    this.clickHandler = new ClickHandler(graph, container);
    this.holdHandler = new HoldHandler(graph, container);

    this.container.addEventListener("mousedown", (event: MouseEvent) => this.onMouseDown(event));
    this.container.addEventListener("mousemove", (event: MouseEvent) => this.onMouseMove(event));
    this.container.addEventListener("mouseup", (event: MouseEvent) => this.onMouseUp(event));
  }

  // 鼠标按下事件处理
  onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.mouseDownStartTime = Date.now();
    this.startNode = this.findNodeUnderCursor(event);

    console.log("mousedown", event); // FIXME
  }

  // 鼠标移动事件处理
  onMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown) return;
    if (Date.now() - this.mouseDownStartTime < this.HOLD_THRESHOLD) return;

    if (this.startNode) this.dragHandler.onDragging(event, this.startNode);
    else
      this.holdHandler.onHolding(
        event,
        this.findNodeUnderCursor(event),
        this.findEdgeUnderCursor(event)
      );

    console.log("mousemove", event); // FIXME
  }

  // 鼠标松开事件处理
  onMouseUp(event: MouseEvent): void {
    let clickDuration = Date.now() - this.mouseDownStartTime;

    if (clickDuration < this.HOLD_THRESHOLD) {
      this.clickHandler.onClick(
        event,
        this.findNodeUnderCursor(event),
        this.findEdgeUnderCursor(event)
      );
      console.log("click", event); // FIXME
    } else if (this.startNode) {
      this.dragHandler.onDragEnd(event, this.startNode, this.findNodeUnderCursor(event), 1);
      console.log("dragend", event); // FIXME
    }

    this.isMouseDown = false;

    console.log("mouseup", event); // FIXME
    console.log("clickDuration", clickDuration); // FIXME
  }

  // // 获取鼠标移动距离（用于判定拖拽）
  // private getMouseMovementDistance(event: MouseEvent): number {
  //   const movementX = event.movementX || 0;
  //   const movementY = event.movementY || 0;
  //   return Math.sqrt(movementX ** 2 + movementY ** 2);
  // }

  private findNodeUnderCursor(event: MouseEvent): Node | null {
    const nodes = this.graph.getNodes();
    const [x, y] = d3.pointer(event, this.container);
    for (let node of nodes) {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      if (distance < node.radius) {
        return node;
      }
    }
    return null;
  }

  private findEdgeUnderCursor(event: MouseEvent): Edge | null {
    const edges = this.graph.getEdges();
    const [x, y] = d3.pointer(event, this.container);
    for (let edge of edges) {
      const sourceNode = this.graph.getNodeById(edge.source);
      const targetNode = this.graph.getNodeById(edge.target);
      // 如果鼠标到两个端点的连线距离小于阈值, 则判定为该边
      if (sourceNode && targetNode) {
        const distance = Math.sqrt(
          Math.pow(sourceNode.x - x, 2) +
            Math.pow(sourceNode.y - y, 2) +
            Math.pow(targetNode.x - x, 2) +
            Math.pow(targetNode.y - y, 2)
        );
        if (distance < 5) {
          return edge;
        }
      }
    }
    return null;
  }
}
