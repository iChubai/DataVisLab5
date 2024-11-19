import { Graph } from "../infrastructure/graph";
import { ParameterManager } from "../infrastructure/parameter";

import { NodeLIFParamRegistry } from "./models/lif";
import { EdgeHebbianParamRegistry } from "./models/hebbian";

/**
 * 注册 SNN 模块中的神经元参数。
 *
 * 支持的模型：
 * - `LIF`: Leaky Integrate and Fire 神经元模型。
 */
export class NodeSNNParameterRegistry {
  private graph: Graph;
  private parameterManager: ParameterManager;
  private paramRegistry: NodeLIFParamRegistry; // TODO: support other neuron models

  constructor(graph: Graph, parameterManager: ParameterManager, neuronModel: string) {
    this.graph = graph;
    this.parameterManager = parameterManager;

    this.paramRegistry =
      {
        LIF: new NodeLIFParamRegistry(graph, parameterManager),
      }[neuronModel] ||
      (() => {
        throw new Error(`Unsupported neuron model ${neuronModel}.`);
      }).apply(null);
  }

  /**
   * 注册所有神经元参数，托管给具体的神经元模型注册器。
   * @param params - 神经元参数名称列表。
   *
   * 支持的参数：
   * - LIF 模型：
   *    - `potential`: 节点的电位，初始值为 0。
   *    - `threshold`: 节点的阈值，初始值为 1。
   *    - `recovery`: 节点的恢复时间常数，初始值为 0.1。
   *    - `resistance`: 节点的输入电阻，初始值为 1。
   */
  register(...params: string[]): void {
    this.paramRegistry.register(...params);
  }
}

/**
 * 注册 SNN 模块中的突触参数。
 *
 * 支持的模型：
 * - `Hebbian`: Hebbian 突触模型。
 */
export class EdgeSNNParameterRegistry {
  private graph: Graph;
  private parameterManager: ParameterManager;
  private paramRegistry: EdgeHebbianParamRegistry; // TODO: support other synapse models

  constructor(graph: Graph, parameterManager: ParameterManager, synapseModel: string) {
    this.graph = graph;
    this.parameterManager = parameterManager;

    this.paramRegistry =
      {
        Hebbian: new EdgeHebbianParamRegistry(graph, parameterManager),
      }[synapseModel] ||
      (() => {
        throw new Error(`Unsupported synapse model ${synapseModel}.`);
      }).apply(null);
  }

  /**
   * 注册所有突触参数，托管给具体的突触模型注册器。
   * @param params - 突触参数名称列表。
   *
   * 支持的参数：
   * - Hebbian 模型：
   *    - `weight`: 突触的权重，初始值为 0.5。
   *    - `learningRate`: 突触的学习率，初始值为 0.01。
   */
  register(...params: string[]): void {
    this.paramRegistry.register(...params);
  }
}
