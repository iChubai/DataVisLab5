// ./src/infrastructure/parameter.ts

import { Graph, NodeBasicParamRegistry } from "../infrastructure/graph";
import { NodePhysicParamRegistry } from "../gui/force";

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
  // 这些回调函数会在参数值**因手动更改而**发生变化时被调用（见parameter_explorer.ts中的param.onChange）。
  // 注意：**因自动变化而**产生的变化不会触发回调函数，例如物理模拟导致x变化时，不会触发回调函数。
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

    this.graph.onNodeAdded((nodeId) => {
      // this.nodeParameters.set(nodeId, this.initialParameters.slice()); 这是浅拷贝，不对。
      this.nodeParameters.set(nodeId, JSON.parse(JSON.stringify(this.initialParameters))); // 这里用深拷贝
      console.log(
        `NodeParameterManager: Node added: ${nodeId} with parameters: `,
        this.nodeParameters.get(nodeId)
      );
    });
    this.graph.onNodeRemoved((nodeId) => {
      this.nodeParameters.delete(nodeId);
    });
  }

  /**
   * 添加一个初始参数。
   * @param parameter - 参数信息。
   */
  add(parameter: NodeParameter): void {
    this.initialParameters.push(parameter);
  }

  has(parameterName: string): boolean {
    return this.initialParameters.some((p) => p.name === parameterName);
  }

  getValue(nodeId: string, parameterName: string): any {
    const parameters = this.nodeParameters.get(nodeId) || [];
    const parameter = parameters.find((p) => p.name === parameterName);
    return parameter?.value;
  }

  setValue(nodeId: string, parameterName: string, value: any): void {
    const parameters = this.nodeParameters.get(nodeId) || [];
    const parameter = parameters.find((p) => p.name === parameterName);
    if (parameter) {
      parameter.value = value;
      parameter.onChange(nodeId, value);
    }
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

export class NodeParameterRegistry {
  private graph: Graph;
  private parameterManager: NodeParameterManager;

  private nodeBasicParamRegistry: NodeBasicParamRegistry; // 节点基础参数注册器
  private nodePhysicParamRegistry: NodePhysicParamRegistry; // 节点物理参数注册器

  constructor(graph: Graph, parameterManager: NodeParameterManager) {
    this.graph = graph;
    this.parameterManager = parameterManager;

    this.nodeBasicParamRegistry = new NodeBasicParamRegistry(graph, parameterManager);
    this.nodePhysicParamRegistry = new NodePhysicParamRegistry(graph, parameterManager);
  }

  registerAll() {
    this.nodeBasicParamRegistry.register("info");
    this.nodePhysicParamRegistry.register("x", "y", "vx", "vy", "radius");

    console.log("NodeParameterRegistry: All parameters registered.", this.parameterManager);
  }
}
