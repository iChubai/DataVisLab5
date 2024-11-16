import * as d3 from "d3";
import { Node, Edge, Graph } from "./graph";

// 常量
const FORCE_MULTIPLIER = 0.1; // 力的系数，用于调节拖拽的强度

// 定义拖拽处理器
export class DragHandler {
  private graph: Graph;
  private container: SVGSVGElement;

  constructor(graph: Graph, container: SVGSVGElement) {
    this.graph = graph;
    this.container = container;
  }

  // 拖拽过程中
  onDragging(event: MouseEvent, node: Node): void {
    if (node) {
      const [x, y] = d3.pointer(event, this.container);
      const { x: nx, y: ny } = node;
      const dx = x - nx;
      const dy = y - ny;
      const forceX = dx * FORCE_MULTIPLIER;
      const forceY = dy * FORCE_MULTIPLIER;

      node.vx += forceX; // 更新速度
      node.vy += forceY;

      node.x += node.vx; // 更新位置
      node.y += node.vy;

      this.graph.updateNodePosition(node.id, node.x, node.y);
    }
  }

  // 结束拖拽
  onDragEnd(event: MouseEvent, node: Node, targetNode: Node | null, info: number): void {
    if (targetNode && targetNode.id !== node.id) {
      const newEdge = { source: node.id, target: targetNode.id, info: 1 };
      this.graph.addEdge(newEdge);
    }
  }
}

// 定义单击处理器
export class ClickHandler {
  private graph: Graph;
  private container: SVGSVGElement;

  constructor(graph: Graph, container: SVGSVGElement) {
    this.graph = graph;
    this.container = container;
  }

  onClick(event: MouseEvent, node: Node | null, edge: Edge | null): void {
    if (node) {
      console.log(`Node clicked: ${node.info}`);
      // TODO: 显示节点信息框
    } else if (edge) {
      console.log(`Edge clicked: from ${edge.source} to ${edge.target}`);
      // TODO: 显示边信息框
    } else {
      const [x, y] = d3.pointer(event, this.container);
      let id = this.graph.addNode({
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
  private graph: Graph;
  private container: SVGSVGElement;

  constructor(graph: Graph, container: SVGSVGElement) {
    this.graph = graph;
    this.container = container;
  }

  onHolding(event: MouseEvent, node: Node | null, edge: Edge | null): void {
    if (node) {
      this.graph.removeNode(node.id);
      console.log(`Node removed: ${node.id}`);
    }
    if (edge) {
      this.graph.removeEdge(edge);
      console.log(`Edge removed: from ${edge.source} to ${edge.target}`);
    }
  }
}
