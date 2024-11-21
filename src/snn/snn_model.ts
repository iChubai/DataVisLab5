// ./src/snn/snn.ts

import { Graph, Node, Edge } from "../infrastructure/graph";
import { LIFNeuronModel } from "./models/lif";
import { HebbianSynapseModel } from "./models/hebbian";
import { ParameterManager } from "../infrastructure/parameter";
import { NeuronModel, SynapseModel } from "./interface";
import { GraphEvents } from "../infrastructure/graph_event_manager";

export class Neuron {
  _id: string;
  private model: NeuronModel;

  constructor(id: string, model: NeuronModel) {
    this._id = id;
    this.model = model;
  }

  update(deltaTime: number, inputs: number): boolean {
    return this.model.update(deltaTime, this._id, inputs);
  }

  getPotential(): number {
    return this.model.getPotential(this._id);
  }

  reset(): void {
    this.model.reset(this._id);
  }
}

export class Synapse {
  _id: string;
  source: string;
  target: string;
  private model: SynapseModel;

  constructor(id: string, source: string, target: string, model: SynapseModel) {
    this._id = id;
    this.source = source;
    this.target = target;
    this.model = model;
  }

  /**
   * 更新突触权重。
   * @param deltaTime - 时间步长。
   * @returns 突触权重。
   */
  update(deltaTime: number): void {
    this.model.update(deltaTime, this._id);
  }

  getWeight(): number {
    return this.model.getWeight(this._id);
  }
}

export type SNNEvent = "neuron-added" | "neuron-removed" | "synapse-added" | "synapse-removed";
export type SNNEventCallback = (event: SNNEvent, itemId: string) => void;

/**
 * 神经网络。
 *
 * 支持的模型：
 * - 神经元模型：
 *   - `LIF`：Leaky Integrate and Fire 神经元模型。
 * - 突触模型：
 *   - `Hebbian`：Hebbian 突触模型。
 */
export class SNNModel {
  private graph: Graph;
  private params: ParameterManager;

  private neurons: Map<string, Neuron>;
  private synapses: Map<string, Synapse>;

  private neuronModel: NeuronModel;
  private synapseModel: SynapseModel;

  /**
   * 创建一个神经网络。
   * @param graph - 神经网络的图。
   * @param parameterManager - 参数管理器。
   * @param neuronModel - 神经元模型。
   *  - `LIF`：Leaky Integrate and Fire 神经元模型。
   * @param synapseModel - 突触模型。
   *  - `Hebbian`：Hebbian 突触模型。
   */
  constructor(
    graph: Graph,
    parameterManager: ParameterManager,
    neuronModel: string | NeuronModel = "LIF",
    synapseModel: string | SynapseModel = "Hebbian"
  ) {
    this.graph = graph;
    this.params = parameterManager;

    this.neurons = new Map();
    this.synapses = new Map();

    this.neuronModel =
      typeof neuronModel === "string"
        ? {
            LIF: new LIFNeuronModel(this.params),
            // TODO: ...
          }[neuronModel] ||
          (() => {
            throw new Error(`Invalid neuron model: ${neuronModel}`);
          }).apply(null)
        : neuronModel;
    this.synapseModel =
      typeof synapseModel === "string"
        ? {
            Hebbian: new HebbianSynapseModel(this.params),
            // TODO: ...
          }[synapseModel] ||
          (() => {
            throw new Error(`Invalid synapse model: ${synapseModel}`);
          }).apply(null)
        : synapseModel;

    // 注册增删元素的回调函数
    this.graph.on("NodeAdded", (nodeId) => {
      this.addNeuron(nodeId);
    });
    this.graph.on("NodeRemoved", (nodeId) => {
      this.removeNeuron(nodeId);
    });
    this.graph.on("EdgeAdded", (edgeId) => {
      this.addSynapse(edgeId);
    });
    this.graph.on("EdgeRemoved", (edgeId) => {
      this.removeSynapse(edgeId);
    });
  }

  private addNeuron(nodeId: string): void {
    if (this.neurons.has(nodeId)) return;
    this.neurons.set(nodeId, new Neuron(nodeId, this.neuronModel));
  }

  private removeNeuron(nodeId: string): void {
    this.neurons.delete(nodeId);
  }

  private addSynapse(edgeId: string): void {
    if (this.synapses.has(edgeId)) return;
    this.synapses.set(
      edgeId,
      new Synapse(edgeId, Graph.getSourceId(edgeId), Graph.getTargetId(edgeId), this.synapseModel)
    );
  }

  private removeSynapse(edgeId: string): void {
    this.synapses.delete(edgeId);
  }

  public update(deltaTime: number): void {
    // console.log(`SNN Update: deltaTime = ${deltaTime}`); // FIXME: remove this line

    this.neurons.forEach((neuron) => {
      const inputs = this.computeNeuronInputs(neuron._id);
      const fired = neuron.update(deltaTime, inputs);
      // console.log(
      //   `Neuron ${neuron._id} | Potential: ${neuron.getPotential().toFixed(3)} | Fired: ${fired}`
      // );// FIXME: remove this line
    });

    this.synapses.forEach((synapse) => {
      synapse.update(deltaTime);
      const weight = synapse.getWeight();
      // console.log(`Synapse ${synapse.source} -> ${synapse.target} | Weight: ${weight.toFixed(3)}`); // FIXME: remove this line
    });
  }

  private computeNeuronInputs(neuronId: string): number {
    const sourceEdges = this.graph.getSourceEdges(neuronId);
    let totalInput = 0;

    for (const edge of sourceEdges) {
      const synapse = this.synapses.get(edge._id);
      if (synapse) {
        totalInput += synapse.getWeight();
      }
    }

    return totalInput;
  }
}
