import { SynapseModel } from "./models/base_model";

export class Synapse {
  source: string;
  target: string;
  private model: SynapseModel;

  constructor(source: string, target: string, model: SynapseModel) {
    this.source = source;
    this.target = target;
    this.model = model;
  }

  update(deltaTime: number): void {
    this.model.update(deltaTime);
  }

  getWeight(): number {
    return this.model.getWeight();
  }
}
