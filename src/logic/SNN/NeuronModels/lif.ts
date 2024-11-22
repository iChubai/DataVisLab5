// ./src/snn/models/lif.ts

import { NeuronModel } from "./Interface";

import { ParameterManager } from "../../../core/ParameterManager";

export class NodeLIFParamRegistry {
  private nodeParamManager: ParameterManager;
  constructor(nodeParamManager: ParameterManager) {
    this.nodeParamManager = nodeParamManager;
  }
  /**
   * 注册节点参数。
   * @param {...string} params - 要注册的参数名。
   *
   * 支持的参数：
   * - "potential": 节点的电位，初始值为 0。
   * - "threshold": 节点的阈值，初始值为 1。
   * - "recovery": 节点的恢复时间常数，初始值为 0.1。
   * - "resistance": 节点的输入电阻，初始值为 1。
   */
  register(...params: string[]): void {
    params.forEach((param) => {
      if (this.nodeParamManager.existNodeParam(param)) {
        console.warn(`Node parameter ${param} already exists, skip.`);
        return;
      }
      switch (param) {
        case "potential": {
          this.nodeParamManager.addNodeParam({
            name: "potential",
            type: "number",
            value: 0,
            isChanganble: false,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} potential changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
        }
        case "threshold": {
          this.nodeParamManager.addNodeParam({
            name: "threshold",
            type: "number",
            value: 1,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} threshold changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
        }
        case "recovery": {
          this.nodeParamManager.addNodeParam({
            name: "recovery",
            type: "number",
            value: 0.1,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} recovery changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
        }
        case "resistance": {
          this.nodeParamManager.addNodeParam({
            name: "resistance",
            type: "number",
            value: 1,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} resistance changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
        }
        default:
          console.warn(`Unsupported node parameter "${param}".`);
      }
    });
  }
}

/**
 * LIF（Integrate-and-Fire）模型的实现。
 */
export class LIFNeuronModel extends NeuronModel {
  private params: ParameterManager;

  /**
   * 创建 LIF 神经元模型。
   *
   * 使用变量：
   * - potential: number - 膜电位，默认 0。
   * - resistance: number - 输入电阻，默认 1。
   * - threshold: number - 阈值，默认 1。
   * - recovery: number - 恢复时间常数，默认 0.1。
   */
  constructor(
    parameterManager: ParameterManager,
    threshold: number = 1,
    recovery: number = 0.1,
    resistance: number = 1
  ) {
    super();
    this.params = parameterManager;
  }

  /**
   * 更新膜电位，简单的 RC 电路模型
   *
   * ∆p = (I - pR) * dt
   *
   * @param deltaTime 时间间隔
   * @param neuronId 神经元 ID
   * @param inputs 神经元输入
   * @returns 是否放电
   */
  update(deltaTime: number, neuronId: string, inputs: number): boolean {
    // potential = potential + (inputs - potential * recovery) * deltaTime
    const potential =
      this.params.get(neuronId, "potential") +
      (inputs - this.params.get(neuronId, "potential") * this.params.get(neuronId, "recovery")) *
        deltaTime;
    this.params.set(neuronId, "potential", potential);

    // 检查是否放电
    const threshold = this.params.get(neuronId, "threshold");
    if (potential >= threshold) {
      this.reset(neuronId);
      return true; // 放电
    }

    return false; // 未放电
  }

  getPotential(neuronId: string): number {
    return this.params.get(neuronId, "potential");
  }

  /**
   * 重置膜电位为 0。
   */
  reset(neuronId: string): void {
    this.params.set(neuronId, "potential", 0);
  }
}
