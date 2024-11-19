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
   */
  register(...params: string[]): void {
    this.paramRegistry.register(...params);
  }
}
