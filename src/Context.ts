import { Data } from "./Data";
import { GraphContext } from "./Graph/GraphContext";
import { MapContext } from "./MapContext";
import { LeftSidePanel, RightSidePanel, TopSidePanel } from "./SidePanel";

export class Context {
  data: Data;

  private graphContext: GraphContext;
  private mapContext: MapContext;

  constructor() {
    this.data = new Data();
    this.mapContext = new MapContext(this);
    this.graphContext = new GraphContext(this, this.mapContext.zoom, this.mapContext.projection);

    this.data.load().then(() => {
      this.mapContext.render();
    });

    window.onload = () => {
      const leftSidePanel = new LeftSidePanel();
      leftSidePanel.init();
      const rightSidePanel = new RightSidePanel();
      rightSidePanel.init();
      const topSidePanel = new TopSidePanel(this);
      topSidePanel.init();
    };
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
