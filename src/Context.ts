import { Data } from "./Data";
import { GraphContext } from "./Graph/GraphContext";
import { MapContext } from "./MapContext";
import { ParamsExplorer } from "./ParamsExplorer";
import { LeftSidePanel, RightSidePanel, TopSidePanel } from "./SidePanel";

export class Context {
  data: Data;
  private paramsExporer: ParamsExplorer;

  private mapContext: MapContext;
  private graphContext: GraphContext;

  private leftSidePanel: LeftSidePanel;
  private rightSidePanel: RightSidePanel;
  private topSidePanel: TopSidePanel;

  constructor() {
    this.data = new Data();
    this.paramsExporer = new ParamsExplorer(this, this.data);

    this.mapContext = new MapContext(this);
    this.graphContext = new GraphContext(this, this.mapContext.zoom, this.mapContext.projection);

    this.data.load().then(() => {
      this.mapContext.render();
    });

    this.leftSidePanel = new LeftSidePanel();
    this.rightSidePanel = new RightSidePanel();
    this.topSidePanel = new TopSidePanel(this);
    window.onload = () => {
      this.leftSidePanel.init();
      this.rightSidePanel.init();
      this.topSidePanel.init();
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

  exploreParams(dataCategory: string, id?: string): void {
    if (this.leftSidePanel.contentOnShow !== "params") this.leftSidePanel.changeToParamsView();
    this.paramsExporer.explore(dataCategory, id);
  }
}

const ctx = new Context();
