import * as d3 from "d3";
import { SNNModel, Neuron, Synapse } from "./Model";
import { ChartDrawer } from "../../gui/Chart/Renderer";

export class SNNSimulator {
  private engine: d3.Simulation<any, any>; // 仅用于on tick。// TODO: 不一定。可能后面可视化的时候会直接用这个engine。
  constructor(private model: SNNModel, private drawer: ChartDrawer) {
    this.engine = d3.forceSimulation().alphaDecay(0);
  }

  run(): void {
    let lastTime = Date.now();
    this.engine.on("tick", () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      this.model.update(deltaTime);

      // TODO: 这里应该更新一点什么东西，例如交互界面节点的颜色（如果spark了），或者可视化图表（多画一点）。
      this.drawer.update(currentTime);
    });
  }
}
