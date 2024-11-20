import * as d3 from "d3";
import { Node, Edge, Graph, createDefaultNode, createDefaultEdge } from "../infrastructure/graph";
import { GUIController } from "./controller";

// 常量
const FORCE_MULTIPLIER = 0.1; // 力的系数，用于调节拖拽的强度

/**
 * 拖拽处理器，用于处理节点的拖拽事件。
 */
export class DragHandler {
  private controller: GUIController; // 图形控制器实例

  /**
   * 构造函数，初始化拖拽处理器。
   * @param {GUIController} controller - 图形控制器实例。
   */
  constructor(controller: GUIController) {
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
    if (targetNode && targetNode._id !== node._id)
      this.controller.addEdge(createDefaultEdge(node._id, targetNode._id, "1"));
  }
}

/**
 * 单击处理器，用于处理节点或边的单击事件。
 */
// export class ClickHandler
// 已弃用

/**
 * 按住处理器，用于处理节点或边的按住事件。
 */
export class HoldHandler {
  private controller: GUIController; // 图形控制器实例

  /**
   * 构造函数，初始化按住处理器。
   * @param {GUIController} controller - 图形控制器实例。
   */
  constructor(controller: GUIController) {
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
      console.log(`Node removed: ${node._id}`);
    }
    if (edge) {
      this.controller.removeEdge(edge);
      console.log(`Edge removed: from ${edge.source} to ${edge.target}`);
    }
  }
}
