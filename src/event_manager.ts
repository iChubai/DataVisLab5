import * as d3 from "d3";
import { Graph, Node, Edge } from "./graph";
import { DragHandler, ClickHandler, HoldHandler } from "./event_handlers";
import { GraphController } from "./controller";

export class MouseEventManager {
  // 常量
  private readonly HOLD_THRESHOLD = 300; // 按住判定阈值（毫秒）

  // 初始化常量
  private controller: GraphController;
  private graph: Graph;
  private container: SVGSVGElement;
  private dragHandler: DragHandler;
  private clickHandler: ClickHandler;
  private holdHandler: HoldHandler;

  // 变量
  private isMouseDown: boolean = false; // 记录鼠标按下状态
  private mouseDownStartTime: number = 0; // 记录鼠标按下的时间
  private startNode: Node | null = null; // 记录鼠标按下时的节点

  constructor(controller: GraphController) {
    this.controller = controller;
    this.graph = controller.getGraph();
    this.container = controller.getSVG();
    this.dragHandler = new DragHandler(controller);
    this.clickHandler = new ClickHandler(controller);
    this.holdHandler = new HoldHandler(controller);

    this.container.addEventListener("mousedown", (event: MouseEvent) => this.onMouseDown(event));
    this.container.addEventListener("mousemove", (event: MouseEvent) => this.onMouseMove(event));
    this.container.addEventListener("mouseup", (event: MouseEvent) => this.onMouseUp(event));
  }

  // 鼠标按下事件处理
  onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.mouseDownStartTime = Date.now();
    this.startNode = this.findNodeUnderCursor(event);

    // console.log("mousedown", event); // FIXME
    console.log(this.controller.getGraph().toString()); // FIXME
  }

  // 鼠标移动事件处理
  onMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown) return;
    if (Date.now() - this.mouseDownStartTime < this.HOLD_THRESHOLD) return;

    if (!this.startNode)
      this.holdHandler.onHolding(
        event,
        this.findNodeUnderCursor(event),
        this.findEdgeUnderCursor(event)
      );

    // console.log("mousemove", event); // FIXME
    console.log(this.controller.getGraph().toString()); // FIXME
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
      // console.log("click", event); // FIXME
    }

    this.isMouseDown = false;

    // console.log("mouseup", event); // FIXME
    // console.log("clickDuration", clickDuration); // FIXME
    console.log(this.controller.getGraph().toString()); // FIXME
  }

  onDragEnd(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, startNode: Node) {
    this.dragHandler.onDragEnd(event, startNode, this.findNodeUnderPlace(event.x, event.y), 1);
    // console.log("dragend", event); // FIXME
    console.log(this.controller.getGraph().toString()); // FIXME
  }

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

  private findNodeUnderPlace(x: number, y: number): Node | null {
    const nodes = this.graph.getNodes();
    for (let node of nodes) {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      if (distance < node.radius) {
        return node;
      }
    }
    return null;
  }

  private findEdgeUnderCursor(event: MouseEvent): Edge | null {
    const [x, y] = d3.pointer(event, this.container); // 获取鼠标位置
    let foundEdge: Edge | null = null;

    // 遍历所有的检测路径
    d3.select(this.controller.getSVG())
      .select(".edges")
      .selectAll<SVGPathElement, Edge>("path")
      .each(function (edge) {
        const pathElement = this as SVGPathElement;

        // 使用 getTotalLength 和 getPointAtLength 检测鼠标是否靠近路径
        const totalLength = pathElement.getTotalLength();
        for (let i = 0; i <= totalLength; i += 1) {
          const point = pathElement.getPointAtLength(i); // 获取路径上的点
          const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
          if (distance < 5) {
            foundEdge = edge; // 找到边
            return; // 停止循环
          }
        }
      });

    return foundEdge;
  }
}
