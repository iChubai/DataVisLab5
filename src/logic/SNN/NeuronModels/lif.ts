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
   * - "potential": 膜电位，默认 -65 mV。
   * - "lastSpikeTime": 上次发放脉冲的时间，默认 0。
   * - "v_rest": 静息电位，默认 -65 mV。
   * - "v_th": 阈值电位，默认 -55 mV。
   * - "tau_m": 膜时间常数，默认 10 ms。
   * - "R": 输入电阻，默认 3。
   * - "t_ref": 不应期时长，默认200 ms。
   */
  register(...params: string[]): void {
    params.forEach((param) => {
      if (this.nodeParamManager.existNodeParam(param)) {
        console.warn(`Node parameter ${param} already exists, skip.`);
        return;
      }
      switch (param) {
        case "potential":
          this.nodeParamManager.addNodeParam({
            name: "potential",
            type: "number",
            value: -65,
            isChanganble: false,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} potential changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
          break;
        case "lastSpikeTime":
          this.nodeParamManager.addNodeParam({
            name: "lastSpikeTime",
            type: "number",
            value: 0,
            isChanganble: false,
            onChange: (nodeId, newValue) => {
              console.log(`Node ${nodeId} lastSpikeTime changed to ${newValue}`);
            },
          });
          break;
        case "v_rest":
          this.nodeParamManager.addNodeParam({
            name: "v_rest",
            type: "number",
            value: -65,
            isChanganble: false,
            onChange: (nodeId, newValue) => {
              console.log(`Node ${nodeId} v_rest changed to ${newValue}`);
            },
          });
          break;
        case "v_th":
          this.nodeParamManager.addNodeParam({
            name: "v_th",
            type: "number",
            value: -55,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              console.log(`Node ${nodeId} v_th changed to ${newValue}`);
            },
          });
          break;
        case "tau_m":
          this.nodeParamManager.addNodeParam({
            name: "tau_m",
            type: "number",
            value: 434, // 434 ms = 1/ln(n/20), where n is the in degree of the neuron, here we use 2 as in degree
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              console.log(`Node ${nodeId} tau_m changed to ${newValue}`);
            },
          });
          break;
        case "R":
          this.nodeParamManager.addNodeParam({
            name: "R",
            type: "number",
            value: 1,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              console.log(`Node ${nodeId} R changed to ${newValue}`);
            },
          });
          break;
        case "t_ref":
          this.nodeParamManager.addNodeParam({
            name: "t_ref",
            type: "number",
            value: 200,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              console.log(`Node ${nodeId} t_ref changed to ${newValue}`);
            },
          });
          break;
        default:
          console.warn(`Unsupported node parameter "${param}".`);
          break;
      }
    });
  }
}

/**
 * LIF（Integrate-and-Fire）模型的实现，基于BrainPy的形式。
 */
export class LIFNeuronModel extends NeuronModel {
  private params: ParameterManager;

  /**
   * 创建 LIF 神经元模型。
   *
   * 使用变量：
   * - v_rest: number - 静息电位，默认 -65 mV。
   * - tau_m: number - 膜时间常数，默认 10 ms。
   * - v_th: number - 阈值电位，默认 -55 mV。
   * - R: number - 输入电阻，默认 3。
   */
  constructor(parameterManager: ParameterManager) {
    super();
    this.params = parameterManager;
  }

  /**
   * 更新膜电位，使用经典的LIF更新公式
   *
   * ∆V = (I - (V - V_rest) / R) * (dt / tau_m)
   *
   * @param deltaTime 时间间隔（ms）
   * @param neuronId 神经元 ID
   * @param input 神经元输入电流
   * @returns 是否放电
   */
  update(deltaTime: number, neuronId: string, input: number): void {
    if (this.params.get(neuronId, "isInput")) {
      this.params.set(neuronId, "isSpiking", true);
      this.params.set(neuronId, "lastSpikeTime", Date.now());
      return;
    }

    if (
      Date.now() - this.params.get(neuronId, "lastSpikeTime") <
      this.params.get(neuronId, "t_ref")
    ) {
      this.params.set(neuronId, "isSpiking", false); // 未发放脉冲
      return; // 未到不应期时长，不更新
    }

    // 使用经典LIF方程计算膜电位的变化
    const v_rest = this.params.get(neuronId, "v_rest");
    const tau_m = this.params.get(neuronId, "tau_m");
    const R = this.params.get(neuronId, "R");
    const potential = this.params.get(neuronId, "potential");

    const newPotential =
      v_rest +
      (potential - v_rest) * Math.exp(-deltaTime / tau_m) +
      (input / R) * (1 - Math.exp(-deltaTime / tau_m));

    this.params.set(neuronId, "potential", newPotential);

    // 检查膜电位是否超过阈值
    const v_th = this.params.get(neuronId, "v_th");
    if (newPotential >= v_th) {
      this.reset(neuronId);
      this.params.set(neuronId, "isSpiking", true); // 发放脉冲
      this.params.set(neuronId, "lastSpikeTime", Date.now()); // 更新上次发放脉冲的时间
      console.log(
        `Node ${neuronId} spiked at ${newPotential} mV, previous potential was ${potential} mV. Other params are: v_rest=${v_rest} mV, tau_m=${tau_m} ms, v_th=${v_th} mV, R=${R} Ohm.`
      );
      return;
    }

    this.params.set(neuronId, "isSpiking", false); // 未发放脉冲
  }

  /**
   * 检查神经元是否在放电
   * @param neuronId 神经元 ID
   * @returns 是否放电
   */
  isSpiking(neuronId: string): boolean {
    return this.params.get(neuronId, "isSpiking");
  }

  /**
   * 获取当前神经元的膜电位
   * @param neuronId 神经元 ID
   * @returns 当前膜电位
   */
  getPotential(neuronId: string): number {
    return this.params.get(neuronId, "potential");
  }

  /**
   * 重置膜电位为静息电位
   * @param neuronId 神经元 ID
   */
  reset(neuronId: string): void {
    this.params.set(neuronId, "potential", this.params.get(neuronId, "v_rest"));
  }
}
