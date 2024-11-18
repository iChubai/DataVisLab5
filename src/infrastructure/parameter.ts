import { Graph } from "./graph";

/**
 * 描述单个节点参数的结构。
 */
export interface NodeParameter {
  name: string; // 参数名称
  type: "boolean" | "number" | "string" | "select"; // 参数类型
  value: any; // 当前值
  options?: any[]; // 可选值（针对下拉框类型）
  isChanganble: boolean; // 是否可修改
  onChange: (nodeId: string, newValue: any) => void; // 当参数值变化时的回调函数。
  //这些回调函数会在参数值发生变化时被调用（见parameter_explorer.ts中的param.onChange）。
}

/**
 * 节点参数管理类。
 * 允许模块为节点动态注册可调节的参数。
 *
 * 在这里的参数都是会被显示到节点面板上的参数。
 */
export class NodeParameterManager {
  private graph: Graph; // 节点管理器
  private nodeParameters: Map<string, NodeParameter[]>; // 节点 ID -> 参数列表
  private initialParameters: NodeParameter[]; // 初始参数列表。在节点创建时，会将初始参数列表复制到节点参数列表中。

  constructor(graph: Graph) {
    this.graph = graph;
    this.nodeParameters = new Map();
    this.initialParameters = [];

    this.graph.onNodeAdded((node) => {
      this.nodeParameters.set(node.id, this.initialParameters.slice());
      console.log(
        `NodeParameterManager: Node added: ${node.id} with parameters: `,
        this.nodeParameters.get(node.id)
      );
    });
    this.graph.onNodeRemoved((node) => {
      this.nodeParameters.delete(node.id);
    });
  }

  /**
   * 注册一个初始参数。
   * @param parameter - 参数信息。
   */
  register(parameter: NodeParameter): void {
    this.initialParameters.push(parameter);
  }

  /**
   * 为指定节点注册一个新参数。
   * @param nodeId - 节点 ID。
   * @param parameter - 参数信息。
   */
  registerToNode(nodeId: string, parameter: NodeParameter): void {
    if (!this.nodeParameters.has(nodeId)) {
      this.nodeParameters.set(nodeId, []);
    }
    this.nodeParameters.get(nodeId)!.push(parameter);
  }

  /**
   * 获取指定节点的所有参数。
   * @param nodeId - 节点 ID。
   * @returns {NodeParameter[]} 参数列表。
   */
  getParameters(nodeId: string): NodeParameter[] {
    return this.nodeParameters.get(nodeId) || [];
  }
}
