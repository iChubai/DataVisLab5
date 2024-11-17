import { SynapseModel } from "./base_model";

/**
 * Hebbian 学习规则的突触模型实现。
 */
export class HebbianSynapseModel extends SynapseModel {
  private weight: number; // 突触权重
  private learningRate: number; // 学习速率

  constructor(initialWeight: number = 0.5, learningRate: number = 0.01) {
    super();
    this.weight = initialWeight;
    this.learningRate = learningRate;
  }

  update(deltaTime: number): void {
    // Hebbian 学习规则：∆w = learningRate * deltaTime
    this.weight += this.learningRate * deltaTime;
  }

  getWeight(): number {
    return this.weight;
  }
}
