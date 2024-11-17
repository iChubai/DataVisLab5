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
    this.graph.onNodeAdded((node) => {
      this.addNeuron(node);
      console.log(`Neuron added: ${node.id}`);
    });

    this.graph.onNodeRemoved((node) => {
      this.removeNeuron(node);
      console.log(`Neuron removed: ${node.id}`);
    });

    this.graph.onEdgeAdded((edge) => {
      this.addSynapse(edge);
      console.log(`Synapse added: ${edge.id}`);
    });

    this.graph.onEdgeRemoved((edge) => {
      this.removeSynapse(edge);
      console.log(`Synapse removed: ${edge.id}`);
    });
  }

  private initializeNeurons(): void {
    const nodes = this.graph.getNodes();
    for (const node of nodes) {
      this.addNeuron(node);
    }
  }

  private initializeSynapses(): void {
    const edges = this.graph.getEdges();
    for (const edge of edges) {
      this.addSynapse(edge);
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

  private addNeuron(node: Node): void {
    if (this.neurons.has(node.id)) return;
    this.neurons.set(node.id, new Neuron(node.id, new LIFNeuronModel()));
  }

  private removeNeuron(node: Node): void {
    this.neurons.delete(node.id);
  }

  private addSynapse(edge: Edge): void {
    if (this.synapses.has(edge.id)) return;
    this.synapses.set(edge.id, new Synapse(edge.source, edge.target, new HebbianSynapseModel()));
  }

  private removeSynapse(edge: Edge): void {
    this.synapses.delete(edge.id);
  }

  private computeNeuronInputs(neuronId: string): number {
    const sourceEdges = this.graph.getSourceEdges(neuronId);
    let totalInput = 0;

    for (const edge of sourceEdges) {
      const synapse = this.synapses.get(edge.id);
      if (synapse) {
        totalInput += synapse.getWeight();
      }
    }

    return totalInput;
  }
}
