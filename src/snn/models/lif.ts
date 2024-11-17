import { NeuronModel } from "./base_model";
/**
 * LIF（Integrate-and-Fire）模型的实现。
 */
export class LIFNeuronModel extends NeuronModel {
  private potential: number; // 膜电位
  private threshold: number; // 放电阈值
  private recovery: number; // 恢复变量
  private resistance: number; // 输入电阻

  constructor(threshold: number = 1, recovery: number = 0.1, resistance: number = 1) {
    super();
    this.potential = 0;
    this.threshold = threshold;
    this.recovery = recovery;
    this.resistance = resistance;
  }

  update(deltaTime: number, inputs: number): boolean {
    // 更新膜电位，简单的 RC 电路模型
    this.potential += deltaTime * (inputs / this.resistance - this.potential * this.recovery);

    // 检查是否放电
    if (this.potential >= this.threshold) {
      this.reset();
      return true; // 放电
    }

    return false; // 未放电
  }

  getPotential(): number {
    return this.potential;
  }

  reset(): void {
    this.potential = 0; // 重置膜电位
  }
}
