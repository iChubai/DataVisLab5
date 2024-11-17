/**
 * 神经元模型接口，用于实现不同的神经元动力学逻辑。
 */
export interface NeuronModel {
  /**
   * 更新神经元状态。
   * @param deltaTime - 时间步长。
   * @param inputs - 输入电流或其他影响神经元状态的参数。
   * @returns {boolean} - 是否发生放电（true 表示放电）。
   */
  update(deltaTime: number, inputs: number): boolean;

  /**
   * 获取当前神经元的膜电位。
   * @returns {number} - 当前膜电位。
   */
  getPotential(): number;

  /**
   * 重置神经元状态（如放电后）。
   */
  reset(): void;
}

/**
 * 突触模型接口，用于实现不同的突触逻辑。
 */
export interface SynapseModel {
  /**
   * 更新突触权重。
   * @param deltaTime - 时间步长。
   */
  update(deltaTime: number): void;

  /**
   * 获取当前突触权重。
   * @returns {number} - 突触权重。
   */
  getWeight(): number;
}
