import { GraphContext } from "./Graph/GraphContext";
import { MapContext } from "./MapContext";
import { LeftSidePanel, RightSidePanel, TopSidePanel } from "./SidePanel";

export class Context {
  private graphContext: GraphContext;
  private mapContext: MapContext;

  constructor() {
    this.mapContext = new MapContext();
    this.graphContext = new GraphContext(this, this.mapContext.zoom, this.mapContext.projection);

    window.onload = () => {
      const leftSidePanel = new LeftSidePanel();
      leftSidePanel.init();
      const rightSidePanel = new RightSidePanel();
      rightSidePanel.init();
      const topSidePanel = new TopSidePanel(this);
      topSidePanel.init();
    };

    this.mapContext.render();
  }

  renderMap(): void {
    this.mapContext.clear();
    this.graphContext.clear();
    this.mapContext.init();
    this.mapContext.render();
  }

  renderGraph(model: "distance" | "time"): void {
    this.mapContext.clear();
    this.graphContext.clear();
    this.graphContext.init(model);
    this.graphContext.render();
  }
}

const ctx = new Context();
