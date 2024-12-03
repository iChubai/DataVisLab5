import { c } from "vite/dist/node/types.d-aGj9QkWt";
import { Graph } from "../../../core/Graph";
import { ParameterManager } from "../../../core/ParameterManager";
import { SynapseModel } from "./Interface";

export class EdgeSTDPParamRegistry {
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
   * - "A_pre"
   * - "A_post"
   * - "tau_pre"
   * - "tau_post"
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
            value: 1,
            isChanganble: true,
            onChange: (edgeId, newValue) => {
              // TODO
              console.log(`Edge ${edgeId} weight changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
          break;
        }
        case "A_pre": {
          this.edgeParamManager.addEdgeParam({
            name: "A_pre",
            type: "number",
            value: 0.2,
            isChanganble: true,
            onChange: (edgeId, newValue) => {
              console.log(`Edge ${edgeId} A_pre changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
          break;
        }
        case "A_post": {
          this.edgeParamManager.addEdgeParam({
            name: "A_post",
            type: "number",
            value: 0.2,
            isChanganble: true,
            onChange: (edgeId, newValue) => {
              console.log(`Edge ${edgeId} A_post changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
          break;
        }
        case "tau_pre": {
          this.edgeParamManager.addEdgeParam({
            name: "tau_pre",
            type: "number",
            value: 20000,
            isChanganble: true,
            onChange: (edgeId, newValue) => {
              console.log(`Edge ${edgeId} tau_pre changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
          break;
        }
        case "tau_post": {
          this.edgeParamManager.addEdgeParam({
            name: "tau_post",
            type: "number",
            value: 20000,
            isChanganble: true,
            onChange: (edgeId, newValue) => {
              console.log(`Edge ${edgeId} tau_post changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
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
 * 突触的 STDP 学习模型。
 */
export class STDPSynapseModel extends SynapseModel {
  private params: ParameterManager;

  constructor(parameterManager: ParameterManager) {
    super();
    this.params = parameterManager;
  }

  /**
   * 更新突触权重。
   * @param deltaTime - 时间步长（单位：毫秒）。
   * @param synapseId - 突触 ID。
   * @param sourceFired - 源神经元是否激活。
   * @param targetFired - 目标神经元是否激活。
   */
  update(deltaTime: number, synapseId: string, sourceFired: boolean, targetFired: boolean): void {
    const sourceId = Graph.getSourceId(synapseId);
    const targetId = Graph.getTargetId(synapseId);
    if (this.params.get(sourceId, "isInput")) {
      this.params.set(synapseId, "weight", this.params.get(sourceId, "potential"));
      return;
    }

    const A_pre = this.params.get(synapseId, "A_pre");
    const A_post = this.params.get(synapseId, "A_post");
    const tau_pre = this.params.get(synapseId, "tau_pre");
    const tau_post = this.params.get(synapseId, "tau_post");
    const weight = this.params.get(synapseId, "weight");

    const t_pre = this.params.get(sourceId, "lastSpikeTime");
    const t_post = this.params.get(targetId, "lastSpikeTime");
    if (t_pre === 0 || t_post === 0) return;
    const dt = t_pre - t_post;

    const deltaWeight =
      (targetFired ? A_post * Math.exp(-dt / tau_post) : 0) - // 当target（post）神经元激活时，t_pre < t_post, dt < 0, weight增大，表现为长时程增强
      (sourceFired ? A_pre * Math.exp(-dt / tau_pre) : 0); // 当source（pre）神经元激活时，t_pre > t_post, dt > 0, weight减小，表现为长时程抑制

    this.params.set(synapseId, "weight", weight + deltaWeight);
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
}
