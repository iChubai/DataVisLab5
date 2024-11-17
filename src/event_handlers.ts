import * as d3 from "d3";
import { Node, Edge, Graph } from "./graph";
import { GraphController } from "./controller";

// 常量
const FORCE_MULTIPLIER = 0.1; // 力的系数，用于调节拖拽的强度

/**
 * 拖拽处理器，用于处理节点的拖拽事件。
 */
export class DragHandler {
  private controller: GraphController; // 图形控制器实例

  /**
   * 构造函数，初始化拖拽处理器。
   * @param {GraphController} controller - 图形控制器实例。
   */
  constructor(controller: GraphController) {
    this.controller = controller;
  }

  /**
   * 拖拽结束时的回调函数。
   * @param {d3.D3DragEvent<SVGCircleElement, Node, Node>} event - D3 拖拽事件对象。
   * @param {Node} node - 被拖拽的节点对象。
   * @param {Node | null} targetNode - 拖拽目标的节点（如果有）。
   * @param {number} info - 额外的信息参数。
   */
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

/**
 * 单击处理器，用于处理节点或边的单击事件。
 */
export class ClickHandler {
  private controller: GraphController; // 图形控制器实例

  /**
   * 构造函数，初始化单击处理器。
   * @param {GraphController} controller - 图形控制器实例。
   */
  constructor(controller: GraphController) {
    this.controller = controller;
  }

  /**
   * 单击事件的回调函数。
   * @param {MouseEvent} event - 鼠标事件对象。
   * @param {Node | null} node - 被单击的节点对象（如果有）。
   * @param {Edge | null} edge - 被单击的边对象（如果有）。
   */
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

/**
 * 按住处理器，用于处理节点或边的按住事件。
 */
export class HoldHandler {
  private controller: GraphController; // 图形控制器实例

  /**
   * 构造函数，初始化按住处理器。
   * @param {GraphController} controller - 图形控制器实例。
   */
  constructor(controller: GraphController) {
    this.controller = controller;
  }

  /**
   * 按住事件的回调函数。
   * @param {MouseEvent} event - 鼠标事件对象。
   * @param {Node | null} node - 被按住的节点对象（如果有）。
   * @param {Edge | null} edge - 被按住的边对象（如果有）。
   */
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
