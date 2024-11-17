import { NeuronModel } from "./models/base_model";

export class Neuron {
  id: string;
  private model: NeuronModel;

  constructor(id: string, model: NeuronModel) {
    this.id = id;
    this.model = model;
  }

  update(deltaTime: number, inputs: number): boolean {
    return this.model.update(deltaTime, inputs);
  }

  getPotential(): number {
    return this.model.getPotential();
  }

  reset(): void {
    this.model.reset();
  }
}
