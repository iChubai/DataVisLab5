import { ParameterManager } from "../../core/ParameterManager";

import { NodeLIFParamRegistry } from "./NeuronModels/lif";
import { EdgeHebbianParamRegistry } from "./SynapseModels/hebbian";

/**
 * 注册 SNN 模块中的神经元参数。
 *
 * 支持的模型：
 * - `LIF`: Leaky Integrate and Fire 神经元模型。
 */
export class NodeSNNParameterRegistry {
  private paramRegistry: NodeLIFParamRegistry; // TODO: support other neuron models

  constructor(private parameterManager: ParameterManager, neuronModel: string) {
    this.paramRegistry =
      {
        LIF: new NodeLIFParamRegistry(parameterManager),
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
   * - 通用参数：
   *    - `isInput`: 节点是否是输入节点，初始值为 false。
   *        当节点是输入节点时，其电位将被固定为设定值。
   *    - `isSpiking`: boolean - 节点是否正在发放脉冲，初始值为 false。
   * - LIF 模型：
   *    - `potential`: 节点的电位，初始值为 0。
   *    - `threshold`: 节点的阈值，初始值为 1。
   *    - `recovery`: 节点的恢复时间常数，初始值为 0.1。
   *    - `resistance`: 节点的输入电阻，初始值为 1。
   */
  register(...params: string[]): void {
    ["isInput", "isSpiking"].forEach((param) => {
      if (params.includes(param)) {
        if (this.parameterManager.existNodeParam(param)) {
          console.warn(`Node parameter ${param} already exists, skip.`);
          return;
        }
        switch (param) {
          case "isInput":
            this.parameterManager.addNodeParam({
              name: "isInput",
              type: "boolean",
              value: false,
              isChanganble: true,
              onChange: (nodeId, newValue) => {
                console.log(`Node ${nodeId} potential changing to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
                this.parameterManager.setChangeable(nodeId, "potential", !newValue);
              },
            });
            break;
          case "isSpiking":
            this.parameterManager.addNodeParam({
              name: "isSpiking",
              type: "boolean",
              value: false,
              isChanganble: false,
              onChange: (nodeId, newValue) => {
                // console.log(`Node ${nodeId} isSpiking changing to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
              },
            });
          default:
            break;
        }
      }
    });
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
  private parameterManager: ParameterManager;
  private paramRegistry: EdgeHebbianParamRegistry; // TODO: support other synapse models

  constructor(parameterManager: ParameterManager, synapseModel: string) {
    this.parameterManager = parameterManager;

    this.paramRegistry =
      {
        Hebbian: new EdgeHebbianParamRegistry(parameterManager),
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
