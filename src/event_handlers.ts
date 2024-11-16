import * as d3 from "d3";
import { Node, Edge, Graph } from "./graph";
import { GraphController } from "./controller";

// 常量
const FORCE_MULTIPLIER = 0.1; // 力的系数，用于调节拖拽的强度

// 定义拖拽处理器
export class DragHandler {
  private controller: GraphController;

  constructor(controller: GraphController) {
    this.controller = controller;
  }

  // 结束拖拽
  onDragEnd(
    event: d3.D3DragEvent<SVGCircleElement, Node, Node>,
    node: Node,
    targetNode: Node | null,
    info: number
  ): void {
    if (targetNode && targetNode.id !== node.id) {
      const newEdge = { source: node.id, target: targetNode.id, info: 1 };
      this.controller.addEdge(newEdge);
    }
  }
}

// 定义单击处理器
export class ClickHandler {
  private controller: GraphController;

  constructor(controller: GraphController) {
    this.controller = controller;
  }

  onClick(event: MouseEvent, node: Node | null, edge: Edge | null): void {
    if (node) {
      console.log(`Node clicked: ${node.info}`);
      // TODO: 显示节点信息框
    } else if (edge) {
      console.log(`Edge clicked: from ${edge.source} to ${edge.target}`);
      // TODO: 显示边信息框
    } else {
      const [x, y] = d3.pointer(event, this.controller.getSVG());
      let id = this.controller.addNode({
        id: 0,
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        info: `Node created at node-${Date.now()}`,
        radius: 20,
      });
      console.log(`New node created: ${id}`);
    }
  }
}

// 定义按住处理器
export class HoldHandler {
  private controller: GraphController;

  constructor(controller: GraphController) {
    this.controller = controller;
  }

  onHolding(event: MouseEvent, node: Node | null, edge: Edge | null): void {
    if (node) {
      this.controller.removeNode(node);
      console.log(`Node removed: ${node.id}`);
    }
    if (edge) {
      this.controller.removeEdge(edge);
      console.log(`Edge removed: from ${edge.source} to ${edge.target}`);
    }
  }
}
