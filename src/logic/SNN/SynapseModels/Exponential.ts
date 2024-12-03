import { Graph } from "../../../core/Graph";
import { ParameterManager } from "../../../core/ParameterManager";
import { SynapseModel } from "./Interface";

export class EdgeExponentialParamRegistry {
  private edgeParamManager: ParameterManager;
  constructor(edgeParamManager: ParameterManager) {
    this.edgeParamManager = edgeParamManager;
  }

  /**
   * 注册边参数。
   * @param {...string} params - 要注册的参数名。
   *
   * 支持的参数：
   * - psc: number - 突触后电流（PSC），初始值为0。
   * - tau: number - 时间常数，初始值为。
   * - weight: number - 权重，初始值为1。
   *
   * 更新机制：
   * ds/dt = -s/tau + weight * \delta(t)，其中\delta(t)是狄拉克delta函数，表示突触前神经元是否发放。
   */
  register(...params: string[]): void {
    params.forEach((param) => {
      if (this.edgeParamManager.existEdgeParam(param)) {
        console.warn(`Edge parameter ${param} already exists, skip.`);
        return;
      }
      switch (param) {
        case "psc": {
          this.edgeParamManager.addEdgeParam({
            name: "psc",
            type: "number",
            value: 0,
            isChanganble: false,
            onChange: (edgeId, newValue) => {
              console.log(`Edge ${edgeId} psc changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
          break;
        }
        case "tau": {
          this.edgeParamManager.addEdgeParam({
            name: "tau",
            type: "number",
            value: 1000,
            isChanganble: true,
            onChange: (edgeId, newValue) => {
              console.log(`Edge ${edgeId} tau changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
          break;
        }
        case "weight": {
          this.edgeParamManager.addEdgeParam({
            name: "weight",
            type: "number",
            value: 0.5,
            isChanganble: true,
            onChange: (edgeId, newValue) => {
              console.log(`Edge ${edgeId} weight changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
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
 * 指数型突触模型。
 * 目前weight是常数，后期实现突触可塑性机制以使weight随着时间的推移而变化。 // TODO
 */
export class ExponentialSynapseModel extends SynapseModel {
  private params: ParameterManager;

  constructor(parameterManager: ParameterManager) {
    super();
    this.params = parameterManager;
  }

  /**
   * 更新突触。
   * @param deltaTime - 时间步长（单位：毫秒）。
   * @param synapseId - 突触 ID。
   * @param sourceFired - 源神经元是否激活。
   * @param targetFired - 目标神经元是否激活。
   */
  update(deltaTime: number, synapseId: string, sourceFired: boolean, targetFired: boolean): void {
    const sourceId = Graph.getSourceId(synapseId);
    const targetId = Graph.getTargetId(synapseId);
    if (this.params.get(sourceId, "isInput")) {
      this.params.set(synapseId, "psc", this.params.get(sourceId, "potential"));
      return;
    }

    const psc = this.params.get(synapseId, "psc");
    const tau = this.params.get(synapseId, "tau");
    const weight = this.params.get(synapseId, "weight");
    const dpscdt = -psc / tau + weight * (sourceFired ? 1 : 0);
    this.params.set(synapseId, "psc", psc + dpscdt * deltaTime);
  }

  /**
   * 获取突触后电流（PSC）。
   * @returns {number} 突触后电流（PSC）。
   */
  getPSC(synapseId: string): number {
    return this.params.get(synapseId, "psc");
  }
}
