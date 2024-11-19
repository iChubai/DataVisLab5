import { Graph, Node, Edge } from "../infrastructure/graph";
import { Neuron } from "./neuron";
import { Synapse } from "./synapse";
import { LIFNeuronModel } from "./models/lif";
import { HebbianSynapseModel } from "./models/hebbian";

export class SNN {
  private neurons: Map<string, Neuron>;
  private synapses: Map<string, Synapse>;
  private graph: Graph;

  constructor(graph: Graph) {
    this.graph = graph;
    this.neurons = new Map();
    this.synapses = new Map();

    // 初始化神经元和突触
    this.initializeNeurons();
    this.initializeSynapses();

    // 动态同步 Graph 的变化
    this.graph.onNodeAdded((nodeId) => {
      this.addNeuron(nodeId);
      console.log(`Neuron added: ${nodeId}`);
    });

    this.graph.onNodeRemoved((nodeId) => {
      this.removeNeuron(nodeId);
      console.log(`Neuron removed: ${nodeId}`);
    });

    this.graph.onEdgeAdded((edgeId) => {
      this.addSynapse(edgeId);
      console.log(`Synapse added: ${edgeId}`);
    });

    this.graph.onEdgeRemoved((edgeId) => {
      this.removeSynapse(edgeId);
      console.log(`Synapse removed: ${edgeId}`);
    });
  }

  private initializeNeurons(): void {
    const nodes = this.graph.getNodes();
    for (const node of nodes) {
      this.addNeuron(node._id);
    }
  }

  private initializeSynapses(): void {
    const edges = this.graph.getEdges();
    for (const edge of edges) {
      this.addSynapse(edge._id);
    }
  }

  public update(deltaTime: number): void {
    console.log(`SNN Update: deltaTime = ${deltaTime}`);

    // 更新所有神经元
    for (const neuron of this.neurons.values()) {
      const inputs = this.computeNeuronInputs(neuron.id);
      const fired = neuron.update(deltaTime, inputs);
      console.log(
        `Neuron ${neuron.id} | Potential: ${neuron.getPotential().toFixed(3)} | Fired: ${fired}`
      );
    }

    // 更新所有突触
    for (const synapse of this.synapses.values()) {
      synapse.update(deltaTime);
      console.log(
        `Synapse ${synapse.source} -> ${synapse.target} | Weight: ${synapse.getWeight().toFixed(3)}`
      );
    }
  }

  public getNeuronState(neuronId: string): string {
    const neuron = this.neurons.get(neuronId);
    if (!neuron) {
      return `Neuron ${neuronId} does not exist.`;
    }

    return `Neuron ${neuronId} | Potential: ${neuron.getPotential().toFixed(3)}`;
  }

  private addNeuron(nodeId: string): void {
    if (this.neurons.has(nodeId)) return;
    this.neurons.set(nodeId, new Neuron(nodeId, new LIFNeuronModel()));
  }

  private removeNeuron(nodeId: string): void {
    this.neurons.delete(nodeId);
  }

  private addSynapse(edgeId: string): void {
    if (this.synapses.has(edgeId)) return;
    this.synapses.set(
      edgeId,
      new Synapse(Graph.getSourceId(edgeId), Graph.getTargetId(edgeId), new HebbianSynapseModel())
    );
  }

  private removeSynapse(edgeId: string): void {
    this.synapses.delete(edgeId);
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
