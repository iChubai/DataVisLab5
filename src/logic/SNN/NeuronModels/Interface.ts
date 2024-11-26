/**
 * 神经元模型基类，定义神经元的基本接口。
 */
export abstract class NeuronModel {
  /**
   * 更新神经元状态。
   * @param deltaTime - 时间步长。
   * @param inputs - 输入电流或影响状态的参数。
   * @returns {boolean} - 是否放电（true 表示放电）。
   */
  abstract update(deltaTime: number, neuronId: string, inputs: number): boolean;

  abstract isSpiking(neuronId: string): boolean;

  /**
   * 获取当前神经元的膜电位。
   * @returns {number} - 当前膜电位。
   */
  abstract getPotential(neuronId: string): number;

  /**
   * 重置神经元状态。
   */
  abstract reset(neuronId: string): void;
}
