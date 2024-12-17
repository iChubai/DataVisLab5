import { GraphEventManager } from "./core/Graph/EventManager";

/**
 * 描述单个节点参数的结构。
 */
export interface Parameter {
  name: string; // 参数名称
  type: "boolean" | "number" | "string" | "select"; // 参数类型
  value: any; // 当前值
  options?: any[]; // 可选值（针对下拉框类型）
}

export type NodeParamName = "x" | "y";
export const NodeParamNames: Set<NodeParamName> = new Set(["x", "y"]);
export type EdgeParamName = "distance" | "time";
export const EdgeParamNames: Set<EdgeParamName> = new Set(["distance", "time"]);
export type GlobalParamName = "color" | "size";
export const GlobalParamNames: Set<GlobalParamName> = new Set(["color", "size"]);

export type ParamName = NodeParamName | EdgeParamName | GlobalParamName;
export const ParamNames: Set<ParamName> = new Set([
  ...NodeParamNames,
  ...EdgeParamNames,
  ...GlobalParamNames,
]);

/**
 * 节点参数管理类。
 * 允许模块为节点动态注册可调节的参数。
 *
 * 在这里的参数都是会被显示到节点面板上的参数。
 */
export class ParameterManager {
  private initialNodeParameters: Parameter[]; // 初始参数列表。在节点创建时，会将初始参数列表复制到节点参数列表中。
  private initialEdgeParameters: Parameter[]; // 初始边参数列表。在边创建时，会将初始参数列表复制到边参数列表中。
  private parameters: Map<string, Parameter[]>; // 节点/边 ID -> 参数列表
  private globalParameters: Parameter[]; // 全局参数列表。在创建节点/边时，会将全局参数列表复制到节点/边参数列表中。

  constructor(private ctx: Context) {
    this.initialNodeParameters = [];
    this.initialEdgeParameters = [];
    this.parameters = new Map();
    this.globalParameters = [];
  }

  registerCallbacks(graphEventManager: GraphEventManager) {
    graphEventManager.on("NodeAdded", (nodeId) => {
      // this.nodeParameters.set(nodeId, this.initialParameters.slice()); 这是浅拷贝，不对。
      // this.Parameters.set(nodeId, JSON.parse(JSON.stringify(this.initialNodeParameters))); // 这里用深拷贝 // 但是也不对。
      const newParameters = this.initialNodeParameters.map((param) => ({
        ...param, // 浅拷贝所有属性
        options: param.options ? [...param.options] : undefined, // 确保深拷贝数组
      }));
      this.parameters.set(nodeId, newParameters);

      console.log(
        `[ParameterManager] Node added: ${nodeId} with parameters: `,
        this.parameters.get(nodeId)
      );
    });
    graphEventManager.on("NodeRemoved", (nodeId) => {
      this.parameters.delete(nodeId);
    });
    graphEventManager.on("EdgeAdded", (edgeId) => {
      this.parameters.set(edgeId, JSON.parse(JSON.stringify(this.initialEdgeParameters)));
      console.log(
        `[ParameterManager] Edge added: ${edgeId} with parameters: `,
        this.parameters.get(edgeId)
      );
    });
    graphEventManager.on("EdgeRemoved", (edgeId) => {
      this.parameters.delete(edgeId);
    });
  }

  /**
   * 添加一个初始参数。
   * @param parameter - 参数信息。
   */
  addNodeParam(parameter: Parameter): void {
    this.initialNodeParameters.push(parameter);
  }

  addEdgeParam(parameter: Parameter): void {
    this.initialEdgeParameters.push(parameter);
  }

  existNodeParam(parameterName: NodeParamName): boolean {
    return this.initialNodeParameters.some((p) => p.name === parameterName);
  }

  existEdgeParam(parameterName: EdgeParamName): boolean {
    return this.initialEdgeParameters.some((p) => p.name === parameterName);
  }

  // 仅被模拟器调用。
  get(parameterName: ParamName, Id?: string): any {
    if (Id === undefined) {
      const globalParam = this.globalParameters.find((p) => p.name === parameterName);
      if (globalParam === undefined)
        throw new Error(`[ParameterManager] Global parameter ${parameterName} unfound.`);
      return globalParam.value;
    }
    const parameters = this.parameters.get(Id) || [];
    if (parameters === undefined) throw new Error(`[ParameterManager] Item ${Id} unfound.`);
    const parameter = parameters.find((p) => p.name === parameterName);
    if (parameter === undefined)
      throw new Error(`[ParameterManager] Parameter ${parameterName} unfound in Item ${Id}.`);
    return parameter?.value;
  }

  // 仅被模拟器调用。
  // 参数设置面板内的值变化时，不会调用此函数，而是会直接param.value = newValue;。
  // 因此**此处不可以调用onChange回调函数**，
  // 因为onChange是用来向模拟器通知参数改变用的，然而这个消息本身是由模拟器发出的，所以不需要通知。
  // 反而需要向参数面板通知参数值变化。
  set(parameterName: ParamName, value: any, Id?: string): void {
    if (Id === undefined) {
      const globalParam = this.globalParameters.find((p) => p.name === parameterName);
      if (globalParam === undefined)
        throw new Error(`[ParameterManager] Global parameter ${parameterName} unfound.`);
      globalParam.value = value;
      this.ctx.panelEvent().trigger("UpdateGlobalParameter", { paramName: parameterName });
      return;
    }
    const parameters = this.parameters.get(Id);
    if (parameters === undefined) throw new Error(`[ParameterManager] Item ${Id} unfound.`);
    const parameter = parameters.find((p) => p.name === parameterName);
    if (parameter === undefined)
      throw new Error(`[ParameterManager] Parameter ${parameterName} unfound in Item ${Id}.`);
    parameter.value = value;
    this.ctx.panelEvent().trigger("UpdateParameter", { paramName: parameterName, id: Id });
  }

  /**
   * 为指定节点/边注册一个新参数。
   * @param itemId - 节点/边 ID。
   * @param parameter - 参数信息。
   */
  registerToTarget(parameter: Parameter, itemId: string): void {
    if (!this.parameters.has(itemId)) {
      this.parameters.set(itemId, []);
    }
    this.parameters.get(itemId)!.push(parameter);
  }

  /**
   * 获取指定节点/边的所有参数。
   * @param itemId - 节点 ID。
   * @returns {Parameter[]} 参数列表。
   */
  getParametersFromTarget(itemId: string): Parameter[] {
    return this.parameters.get(itemId) || [];
  }
}

export class Context {}
