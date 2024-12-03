// ./src/snn/models/hebbian.ts

import { SynapseModel } from "./Interface";

import { ParameterManager } from "../../../core/ParameterManager";
import { Graph } from "../../../core/Graph";

export class EdgeHebbianParamRegistry {
  private edgeParamManager: ParameterManager;
  constructor(edgeParamManager: ParameterManager) {
    this.edgeParamManager = edgeParamManager;
  }

  /**
   * 注册边参数。
   * @param {...string} params - 要注册的参数名。
   *
   * 支持的参数：
   * - "weight": 突触权重，初始值为 0.5。
   * - "learningRate": 学习速率，初始值为 0.01。
   */
  register(...params: string[]): void {
    params.forEach((param) => {
      if (this.edgeParamManager.existEdgeParam(param)) {
        console.warn(`Edge parameter ${param} already exists, skip.`);
        return;
      }
      switch (param) {
        case "weight": {
          this.edgeParamManager.addEdgeParam({
            name: "weight",
            type: "number",
            value: 0.5,
            isChanganble: true,
            onChange: (edgeId, newValue) => {
              // TODO
              console.log(`Edge ${edgeId} weight changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
          break;
        }
        case "learningRate": {
          this.edgeParamManager.addEdgeParam({
            name: "learningRate",
            type: "number",
            value: 0.01,
            isChanganble: true,
            onChange: (edgeId, newValue) => {
              // TODO
              console.log(`Edge ${edgeId} learningRate changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
          break;
        }
        default:
          console.warn(`Unsupported edge parameter "${param}".`);
          break;
      }
    });
  }
}

/**
 * Hebbian 学习规则的突触模型实现。
 *
 * 使用变量：
 * - weight: number - 突触权重。
 * - learningRate: number - 学习速率。
 */
export class HebbianSynapseModel extends SynapseModel {
  private params: ParameterManager;

  constructor(
    parameterManager: ParameterManager,
    initialWeight: number = 0.5,
    learningRate: number = 0.01
  ) {
    super();
    this.params = parameterManager;
  }

  /**
   * 根据 Hebbian 学习规则更新突触权重。
   * Hebbian 学习规则：∆w = learningRate * deltaTime
   * @param deltaTime - 时间步长。
   * @param synapseId - 突触 ID。
   * @param sourceFired - 源神经元是否激活。
   * @param targetFired - 目标神经元是否激活。
   */
  update(deltaTime: number, synapseId: string, sourceFired: boolean, targetFired: boolean): void {
    const sourceId = Graph.getSourceId(synapseId);
    if (this.params.get(sourceId, "isInput")) {
      this.params.set(synapseId, "weight", this.params.get(sourceId, "potential"));
      return;
    }

    const activity = sourceFired && targetFired ? 1 : 0;
    const weight =
      this.params.get(synapseId, "weight") +
      activity * this.params.get(synapseId, "learningRate") * deltaTime;
    this.params.set(synapseId, "weight", weight);
  }

  /**
   * 获取突触权重。
   * @returns {number} 突触权重。
   */
  getPSC(synapseId: string): number {
    return this.params.get(synapseId, "weight");
  }

  /**
   * 设置突触权重。
   * @param newWeight - 新的突触权重。
   */
  setWeight(synapseId: string, newWeight: number): void {
    this.params.set(synapseId, "weight", newWeight);
  }

  /**
   * 设置学习速率。
   * @param newRate - 新的学习速率。
   */
  setLearningRate(synapseId: string, newRate: number): void {
    this.params.set(synapseId, "learningRate", newRate);
  }
}
