// ./src/snn/models/hebbian.ts

import { SynapseModel } from "./Interface";

import { Graph } from "../../../core/Graph";
import { ParameterManager } from "../../../core/ParameterManager";

export class EdgeHebbianParamRegistry {
  private graph: Graph;
  private edgeParamManager: ParameterManager;
  constructor(graph: Graph, edgeParamManager: ParameterManager) {
    this.graph = graph;
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
        }
        default:
          console.warn(`Unsupported edge parameter "${param}".`);
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
   */
  update(deltaTime: number, synapseId: string): void {
    // weight += learningRate * deltaTime
    const weight =
      this.params.get(synapseId, "weight") + this.params.get(synapseId, "learningRate") * deltaTime;
    this.params.set(synapseId, "weight", weight);
  }

  /**
   * 获取突触权重。
   * @returns {number} 突触权重。
   */
  getWeight(synapseId: string): number {
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
