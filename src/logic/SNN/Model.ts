// ./src/snn/snn.ts

import { Graph, Node, Edge } from "../../core/Graph";
import { LIFNeuronModel } from "./NeuronModels/lif";
import { HebbianSynapseModel } from "./SynapseModels/hebbian";
import { ParameterManager } from "../../core/ParameterManager";
import { NeuronModel } from "./NeuronModels/Interface";
import { SynapseModel } from "./SynapseModels/Interface";
import { GraphEventManager, GraphEvents } from "../../core/Graph/EventManager";
import { SNNEventManager } from "./Event/Manager";

export class Neuron {
  _id: string;
  private model: NeuronModel;

  constructor(id: string, model: NeuronModel) {
    this._id = id;
    this.model = model;
  }

  update(deltaTime: number, inputs: number): void {
    this.model.update(deltaTime, this._id, inputs);
  }

  isSpiking(): boolean {
    return this.model.isSpiking(this._id);
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
  update(deltaTime: number, sourceFired: boolean, targetFired: boolean): void {
    this.model.update(deltaTime, this._id, sourceFired, targetFired);
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
  private neurons: Map<string, Neuron>;
  private synapses: Map<string, Synapse>;

  private neuronModel: NeuronModel;
  private synapseModel: SynapseModel;

  /**
   * 创建一个神经网络。
   *
   * 需要注册回调函数。
   *
   * @param graph - 神经网络的图。
   * @param parameterManager - 参数管理器。
   * @param neuronModel - 神经元模型。
   *  - `LIF`：Leaky Integrate and Fire 神经元模型。
   * @param synapseModel - 突触模型。
   *  - `Hebbian`：Hebbian 突触模型。
   */
  constructor(
    private graph: Graph,
    private params: ParameterManager,
    private eventManager: SNNEventManager,
    neuronModel: string | NeuronModel = "LIF",
    synapseModel: string | SynapseModel = "Hebbian"
  ) {
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
  }

  registerCallbacks(graphEventManager: GraphEventManager) {
    graphEventManager.on("NodeAdded", (nodeId) => {
      this.addNeuron(nodeId);
    });
    graphEventManager.on("NodeRemoved", (nodeId) => {
      this.removeNeuron(nodeId);
    });
    graphEventManager.on("EdgeAdded", (edgeId) => {
      this.addSynapse(edgeId);
    });
    graphEventManager.on("EdgeRemoved", (edgeId) => {
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

    const spikings = new Map<string, boolean>();
    this.neurons.forEach((neuron) => {
      spikings.set(neuron._id, neuron.isSpiking());
    });

    const inputs = new Map<string, number>();
    this.synapses.forEach((synapse) => {
      const sourceNeuron = this.neurons.get(synapse.source)!;
      const targetNeuron = this.neurons.get(synapse.target)!;

      const sourceSpiking = spikings.get(synapse.source) ?? false;
      const targetSpiking = spikings.get(synapse.target) ?? false;

      const weight = synapse.getWeight();

      console.log(`source: ${synapse.source}, source spiking: ${sourceSpiking}, weight: ${weight}`); // FIXME: remove this line

      // 更新 inputs
      const targetId = synapse.target;
      if (inputs.has(targetId)) {
        const currentValue = inputs.get(targetId)!;
        inputs.set(targetId, currentValue + (sourceSpiking ? weight : 0)); // 只有在源神经元发Spike时才累加权重
      } else {
        inputs.set(targetId, sourceSpiking ? weight : 0);
      }

      // 更新突触权重
      synapse.update(0, sourceSpiking, targetSpiking);
    });

    this.neurons.forEach((neuron) => {
      const input = inputs.get(neuron._id) || 0;
      neuron.update(deltaTime, input);
      if (neuron.isSpiking()) {
        this.eventManager.trigger("Spike", { itemId: neuron._id });
        console.log(`[SNNModel] Spike: ${neuron._id}`); // FIXME: remove this line
      } else {
        this.eventManager.trigger("Reset", { itemId: neuron._id });
      }
    });

    this.synapses.forEach((synapse) => {
      const sourceNeuron = this.neurons.get(synapse.source)!;
      const targetNeuron = this.neurons.get(synapse.target)!;

      synapse.update(deltaTime, sourceNeuron.isSpiking(), targetNeuron.isSpiking());
      const weight = synapse.getWeight();
      // console.log(`Synapse ${synapse.source} -> ${synapse.target} | Weight: ${weight.toFixed(3)}`); // FIXME: remove this line
    });
  }

  private computeNeuronInputs(neuronId: string): number {
    const sourceEdges = this.graph.getSourceEdges(neuronId);
    let totalInput = 0;

    for (const edge of sourceEdges) {
      const synapse = this.synapses.get(edge._id);
      const sourceNeuron = this.neurons.get(edge.source);

      if (synapse && sourceNeuron) {
        const sourceSpiking = sourceNeuron.isSpiking();
        totalInput += sourceSpiking ? synapse.getWeight() : 0;
        console.log(sourceNeuron, sourceSpiking, totalInput, edge._id); // FIXME: remove this line
      }
    }

    return totalInput;
  }
}
